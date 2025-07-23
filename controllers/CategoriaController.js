'use strict'

var Categoria = require('../models/categoria')

/* MÉTODO - LISTAR CATEGORÍA */
const listar_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') { /* VERIFICA SI TIENES EL ROL DE "admin" */

            let reg = await Categoria.find();
            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/* MÉTODO - REGISTRAR NUEVA CATEGORÍA */
const registro_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            var data = req.body;

            // Verificar si la categoría ya existe por nombre
            var categoria_existente = await Categoria.findOne({ categoria: { $regex: new RegExp('^' + data.categoria + '$', 'i') } });

            if (!categoria_existente) {
                // Al registrar categoría, 'productos' siempre inicia en 0
                let nueva_categoria = {
                    categoria: data.categoria,
                    productos: 0
                };

                let reg = await Categoria.create(nueva_categoria);
                res.status(200).send({ data: reg });
            } else {
                res.status(500).send({ message: 'La categoría ya está registrada.' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

/* MÉTODO - EDITAR NOMBRE DE CATEGORÍA */
const editar_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let id = req.params['id'];
            let data = req.body;

            // Verificar si ya existe una categoría con el mismo nombre (sin diferenciar mayúsculas/minúsculas)
            const categoriaExistente = await Categoria.findOne({
                categoria: { $regex: new RegExp('^' + data.categoria + '$', 'i') },
                _id: { $ne: id } // Excluir la actual
            });

            if (categoriaExistente) {
                return res.status(500).send({ message: 'La categoría ya está registrada con ese nombre.' });
            }

            let reg = await Categoria.findByIdAndUpdate(id, { categoria: data.categoria }, { new: true });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

/* MÉTODO - ELIMINAR CATEGORÍA */
const eliminar_categoria_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let id = req.params['id'];

            let categoria = await Categoria.findById(id);
            if (!categoria) {
                return res.status(404).send({ message: 'Categoría no encontrada.' });
            }

            if (categoria.productos > 0) {
                return res.status(400).send({ message: 'No se puede eliminar la categoría porque tiene productos registrados.' });
            }
            await Categoria.findByIdAndDelete(id);
            res.status(200).send({ message: 'Categoría eliminada correctamente.' });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};



module.exports = {
    listar_categoria_admin,
    registro_categoria_admin,
    editar_categoria_admin,
    eliminar_categoria_admin,
}