'use strict'

/* DECLARACIÓN DE VARIABLES */
var Producto = require('../models/producto');
var Categoria = require('../models/categoria')
const Talla = require('../models/talla');
var Producto_Proveedor = require('../models/producto_proveedor')
var Categoria = require('../models/categoria')

const cloudinary = require('../cloudinary');

/* VARIABLES PARA LAS IMAGENES */
var fs = require('fs');
var path = require('path');

/* MÉTODO - REGISTRAR PRODUCTO Y SUS PROVEEDORES EN TABLAS APARTES - PANEL ADMIN */
const registro_producto_admin = async function (req, res) {
    if (req.user) {
        var data = req.body;
        var detalles = JSON.parse(data.detalles);

        // SUBIR IMAGEN A CLOUDINARY
        const cloudinary = require('../cloudinary');
        const archivo = req.files.portada;

        const uploadResult = await cloudinary.uploader.upload(archivo.path, {
            folder: 'productos'
        });

        // GENERAR TÍTULO EN URL AMIGABLE
        data.titulo_URL = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        // GUARDAR URL DE LA IMAGEN EN CLOUDINARY
        data.portada = uploadResult.secure_url;
        // GUARDAR ID DE CLOUDINARY PARA POSIBLES ELIMINACIONES FUTURAS
        data.public_id = uploadResult.public_id;

        // REGISTRAR PRODUCTO EN LA BD
        let producto = await Producto.create(data);

        // ACTUALIZAR CONTADOR DE PRODUCTOS EN LA CATEGORÍA
        await Categoria.findByIdAndUpdate(data.categoria, {
            $inc: { productos: 1 }
        });

        // REGISTRAR PROVEEDORES DEL PRODUCTO
        for (var element of detalles) {
            element.producto = producto._id;
            await Producto_Proveedor.create(element);
        }

        res.status(200).send({ producto: producto });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}


/* MÉTODO - LISTAR Y/O FILTRAR PRODUCTOS POR TITULO - PANEL ADMIN */
const listar_productos_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let titulo = req.params['titulo'];
            let productos = [];
            if (titulo == null || titulo == 'null') {
                productos = await Producto.find().populate('categoria', 'categoria');
            } else {
                productos = await Producto.find({ titulo: new RegExp(titulo, 'i') }).populate('categoria', 'categoria');
            }

            // AGREGAR STOCK TOTAL PARA CADA PRODUCTO
            const productos_con_stock = await Promise.all(productos.map(async (producto) => {
                const tallas = await Talla.find({ producto: producto._id });
                const stock_total = tallas.reduce((total, talla) => total + talla.stock, 0);
                return { ...producto.toObject(), stock_total };
            }));

            res.status(200).send({ data: productos_con_stock });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

/* MÉTODO - CAMBIAR ESTADO DE PUBLICADO DE PRODUCTO */
const cambiar_estado_producto_admin = async function (req, res) {
    if (req.user) {
        try {
            let id = req.params.id;
            let { publicado } = req.body;

            let producto = await Producto.findByIdAndUpdate(id, { publicado: publicado }, { new: true });

            res.status(200).send({ message: 'Estado actualizado', data: producto });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: 'Error en el servidor' });
        }
    } else {
        res.status(403).send({ message: 'No tienes acceso' });
    }
};

/* MÉTODO - ELIMINAR PRODUCTO SOLO SI NO TIENE VENTAS Y BORRAR IMAGEN DE CLOUDINARY */
const eliminar_producto_admin = async function (req, res) {
    if (req.user && req.user.rol == 'admin') {
        try {
            var id = req.params['id'];

            // OBTENER PRODUCTO
            const producto = await Producto.findById(id);
            if (!producto) {
                return res.status(404).send({ message: 'Producto no encontrado' });
            }

            // VALIDAR SI TIENE VENTAS
            if (producto.nventas > 0) {
                return res.status(200).send({
                    success: false,
                    message: 'Este producto no puede eliminarse porque tiene ventas registradas. Para conservar el historial de ventas, los productos con ventas no se pueden eliminar del sistema.'
                });
            }

            // ELIMINAR IMAGEN DE CLOUDINARY
            const cloudinary = require('../cloudinary');
            if (producto.public_id) {
                await cloudinary.uploader.destroy(producto.public_id);
            }

            // RESTAR -1 AL CONTADOR DE LA CATEGORÍA
            await Categoria.findByIdAndUpdate(producto.categoria, { $inc: { productos: -1 } });

            // ELIMINAR TALLAS RELACIONADAS
            await Talla.deleteMany({ producto: id });

            // ELIMINAR EL PRODUCTO
            await Producto.findByIdAndDelete(id);

            res.status(200).send({
                success: true,
                message: 'Producto eliminado correctamente'
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: 'Error en el servidor' });
        }
    } else {
        res.status(403).send({ message: 'No tienes acceso' });
    }
};


/* MÉTODO - OBTENER PORTADA DEL PRODUCTO - PANEL ADMIN */
const obtener_portada = async function (req, res) {
    var img = req.params['img'];

    fs.stat('./uploads/productos/' + img, function (err) {
        if (!err) {
            let path_img = './uploads/productos/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = './uploads/default.jpg';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}

/* MÉTODO - OBTENER UN PRODUCTO POR SU ID - PANEL ADMIN */
const obtener_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        try {
            let producto = await Producto.findById(id).populate('categoria', 'categoria');
            let proveedor = await Producto_Proveedor.findOne({ producto: id }).populate('proveedor');
            res.status(200).send({ producto, proveedor });
        } catch (error) {
            res.status(500).send({ message: 'Error al obtener producto', error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/* MÉTODO - ACTUALIZAR PRODUCTO Y SUS PROVEEDORES - PANEL ADMIN */
const actualizar_producto_admin = async function (req, res) {
    if (req.user) {
        var id = req.params['id'];
        var data = req.body;
        var detalles = JSON.parse(data.detalles);
        const cloudinary = require('../cloudinary');

        try {
            let producto_antiguo = await Producto.findById(id);

            // ✅ SUBIR NUEVA PORTADA SI HAY ARCHIVO
            if (req.files && req.files.portada) {
                // ELIMINAR IMAGEN ANTIGUA DE CLOUDINARY
                if (producto_antiguo.public_id) {
                    await cloudinary.uploader.destroy(producto_antiguo.public_id);
                }

                // SUBIR NUEVA IMAGEN
                const archivo = req.files.portada;
                const uploadResult = await cloudinary.uploader.upload(archivo.path, {
                    folder: 'productos'
                });

                data.portada = uploadResult.secure_url;
                data.public_id = uploadResult.public_id;
            } else {
                delete data.portada;
                delete data.public_id;
            }

            // ✅ GENERAR TITULO_URL
            data.titulo_URL = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            // ✅ VALIDAR CAMBIO DE CATEGORÍA
            if (producto_antiguo.categoria.toString() !== data.categoria) {
                await Categoria.findByIdAndUpdate(producto_antiguo.categoria, { $inc: { productos: -1 } });
                await Categoria.findByIdAndUpdate(data.categoria, { $inc: { productos: 1 } });
            }

            // ✅ ACTUALIZAR PRODUCTO
            let producto = await Producto.findByIdAndUpdate(id, data, { new: true });

            // ✅ ACTUALIZAR PROVEEDORES
            await Producto_Proveedor.deleteMany({ producto: id });
            for (let element of detalles) {
                element.producto = id;
                await Producto_Proveedor.create(element);
            }

            res.status(200).send({ producto });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: 'Error al actualizar producto', error });
        }
    } else {
        res.status(403).send({ message: 'NoAccess' });
    }
};


module.exports = {
    registro_producto_admin,
    listar_productos_admin,

    cambiar_estado_producto_admin,
    eliminar_producto_admin,
    obtener_portada,
    obtener_producto_admin,
    actualizar_producto_admin,

}