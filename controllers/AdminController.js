'use strict'


var Admin = require('../models/admin');
var Cliente = require('../models/cliente');
var Talla = require('../models/talla');
var Venta = require('../models/venta');
var Dventa = require('../models/dventa');
var Producto = require('../models/producto');

var bcrypt = require('bcrypt-nodejs');
var jwt = require( '../helpers/jwt');

var fs = require('fs');
var handlebars = require('handlebars');
var ejs = require('ejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');


/* MÉTODO - REGISTRAR NUEVO USUARIO PARA QUE INGRESE AL SISTEMA */
const registro_admin = async function (req, res) {
    var data = req.body; /* TRAE LOS DATOS DEL HTML A UNA VARIABLE DATA */
    var admin_arr = []; /* ARRAY PARA ALMACENAR ADMINS ENCONTRADOS CON EL MISMO EMAIL */

    admin_arr = await Admin.find({ email: data.email }); /* BUSCAR EN LA BASE DE DATOS SI YA EXISTE UN ADMIN CON EL MISMO EMAIL */
 
    if (admin_arr.length == 0) { /* VALIDAR SI NO HAY UN ADMIN CON ESE EMAIL*/
        if (data.password) {  /* VALIDAR SI SE INGRESO UNA CONTRASEÑA */
            bcrypt.hash(data.password, null, null, async function (err, hash) { /* ENCRIPTAR LA CONTRASEÑA CON (bcrypt.hash) */
                if (hash) { /* VALIDAR SI LA CONTRASEÑA SE ENCRIPTA CORRECTAMENTE */
                    data.password = hash; /* REEMPLAZAR LA CONTRASEÑA CON LA CONTRASEÑA INCRIPTADA(hash) */
                    var reg = await Admin.create(data); /* REGISTRAR ADMIN EN LA BASE DE DATOS */
                    res.status(200).send({ message: 'Admin Registrado!', data: reg });
                } else {
                    res.status(200).send({ message: 'Error al registrar Admin', data: undefined });
                }
            })
        } else {
            res.status(200).send({ message: 'No hay contrasena', data: undefined });
        }
    } else {
        res.status(200).send({ message: 'El correo ya existe en base de datos', data: undefined });
    }
}

/* MÉTODO - LOGIN PARA ENTRAR AL SISTEMA */
const lrt = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const login_admin = async function (req, res) {
    var data = req.body; /* TRAE LOS DATOS DEL HTML A UNA VARIABLE DATA */
    var admin_arr = [];

    admin_arr = await Admin.find({ email: data.email }); /* BUSCAR EL CORREO PARA VER SI ESTA REGISTRADO */

    if (lrt.test(data.email)) { /* VALIDAR SI ES UN CORREO */
        if (admin_arr.length == 0) { /* VALIDAR SI EL CORREO NO EXISTE */
            res.status(200).send({ message: 'Correo no registrado', data: undefined });
        } else { /* SI EL CORREO EXISTE, INGRESAR AL SISTEMA */

            let user = admin_arr[0];

            bcrypt.compare(data.password, user.password, async function (err, check) { /* COMPARAR EL PASS INGRESADO CON EL QUE FUE REGISTRADO CON EL CORREO*/
                if (check) { /* SI COINCIDE, INGRESA AL SISTEMA */
                    res.status(200).send({
                        data: user,
                        token: jwt.createToken(user)
                    });
                } else {
                    res.status(200).send({ message: 'La contraseña no coincide', data: undefined });
                }
            })
        }
    } else {
        res.status(200).send({ message: 'Correo invalido!', data: undefined });
    }
}

/* MÉTODO - LISTAR VARIEDADES DE PRODUCTOS PUBLICADOS */
const listar_variedades_productos_admin = async function (req, res) {
    if (req.user) {
        var productos = await Talla.find().populate({
                path: 'producto',
                match: { publicado: true }
            });
        res.status(200).send({ data: productos });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/* MÉTODO - REGISTRO DE COMPRA MANUAL CON ACTUALIZACIÓN DE STOCK POR TALLA */
const registro_compra_manual_cliente = async function (req, res) {
    if (req.user) {
        let data = req.body;

        // REGISTRAR LA VENTA
        let nventa = generarCodigoVenta(); // función para crear código de venta
        data.nventa = nventa;
        data.estado = 'Enviado';
        data.cupon = '-';
        data.envio_titulo = 'Envio de productos';

        // BUSCAR CLIENTE PARA OBTENER DIRECCION
        let cliente = await Cliente.findById({ _id: data.cliente });
        data.direccion = cliente.direccion;

        let venta = await Venta.create(data);

        // GUARDAR DETALLE DE VENTA
        for (var item of data.detalles) {
            await Dventa.create({
                venta: venta._id,
                subtotal: item.subtotal,
                producto: item.idproducto,
                talla: item.idtalla,
                cantidad: item.cantidad,
                cliente: data.cliente,
            });

            // RESTAR STOCK TALLA
            await Talla.findByIdAndUpdate(
                { _id: item.idtalla },
                { $inc: { stock: -item.cantidad } }
            );

            // SUMAR NVENTAS PRODUCTO
            await Producto.findByIdAndUpdate(
                { _id: item.idproducto },
                { $inc: { nventas: +item.cantidad } }
            );
        }

        // ENVIAR CORREO
        enviar_orden_compra(venta._id);

        res.status(200).send({ data: venta });
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};
const enviar_orden_compra = async function (venta) {
    try {
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                if (err) return callback(err);
                callback(null, html);
            });
        };

        var transporter = nodemailer.createTransport(smtpTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            auth: {
                user: 'mirianatelierempresa@gmail.com',
                pass: 'hpnuydnvdbpahsis'
            }
        }));

        // OBTENER DATOS DE LA ORDEN
        var orden = await Venta.findById({ _id: venta }).populate('cliente');
        var dventa = await Dventa.find({ venta: venta })
                                  .populate('producto')
                                  .populate('talla');

        // LEER PLANTILLA DE CORREO
        readHTMLFile(process.cwd() + '/mails/email_enviado.html', (err, html) => {
            if (err) {
                console.error('Error leyendo plantilla', err);
                return;
            }

            let rest_html = ejs.render(html, { orden, dventa });
            var template = handlebars.compile(rest_html);
            var htmlToSend = template({ op: true });

            var mailOptions = {
                from: 'mirianatelierempresa@gmail.com',
                to: orden.cliente.email,
                subject: 'Confirmación de compra ' + orden._id,
                html: htmlToSend
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) console.error('Error enviando correo', error);
                else console.log('Email enviado: ' + info.response);
            });
        });
    } catch (error) {
        console.log('Error en enviar_orden_compra', error);
    }
};

// MÉTODO PARA GENERAR UN CÓDIGO ÚNICO DE VENTA
const generarCodigoVenta = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 10; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}

const listar_ventas_admin = async function (req, res) {
    if (req.user) {
        let filtro = req.params['filtro'];
        let ventas = [];

        if (filtro && filtro.trim() !== '') {
            ventas = await Venta.find({ _id: { $regex: filtro, $options: 'i' } })
                .populate('cliente')
                .sort({ createdAt: -1 });
        } else {
            ventas = await Venta.find()
                .populate('cliente')
                .sort({ createdAt: -1 });
        }

        // TOTAL VENDIDO
        let total = ventas.reduce((acc, v) => acc + ((v.subtotal - v.valor_descuento) + v.envio_precio), 0);

        // PRODUCTO MÁS VENDIDO (solo en ventas filtradas)
        const dventas = await Dventa.find({ venta: { $in: ventas.map(v => v._id) } }).populate('producto');
        const contador = {};

        dventas.forEach(d => {
            if (d.producto) {
                const id = d.producto._id;
                const nombre = d.producto.titulo;
                if (!contador[id]) contador[id] = { nombre, cantidad: 0 };
                contador[id].cantidad += d.cantidad;
            }
        });

        let top = 'Sin ventas', max = 0;
        for (let id in contador) {
            if (contador[id].cantidad > max) {
                max = contador[id].cantidad;
                top = contador[id].nombre;
            }
        }

        res.status(200).send({ data: ventas, total, producto_mas_vendido: top });
    } else {
        res.status(403).send({ message: 'NoAccess' });
    }
};



module.exports = {
    registro_admin,
    login_admin,
    listar_variedades_productos_admin,
    registro_compra_manual_cliente,
    listar_ventas_admin,
}
