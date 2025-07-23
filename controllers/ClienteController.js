'use strict'

/* DECLARACIÓN DE VARIABLES */ 
var bcrypt = require('bcrypt-nodejs');
var Cliente = require('../models/cliente');
var jwt = require('../helpers/jwt');
 

/* MÉTODO - LISTAR Y/O BUSCAR CLIENTE ("dni") - PANEL ADMIN */
const listar_o_bucar_dni_cliente_admin = async function (req, res) {
    if (req.user) { // VERIFICAR SI HAY UN USUARIO AUTENTICADO
        if (req.user.rol == 'admin') { // VERIFICAR SI EL USUARIO TIENE ROL DE ADMIN
            let dni = req.params['dni']; // OBTENER EL DNI DEL CLIENTE DESDE LOS PARÁMETROS DE LA URL
            if( dni == null || dni == 'null'){
                let reg = await Cliente.find();
                res.status(200).send({ data: reg });
            } else {
                let reg = await Cliente.find({ dni: new RegExp("^" + dni, 'i') }); // BUSCAR CLIENTE POR DNI EN LA BASE DE DATOS
                res.status(200).send({ data: reg }); // ENVIAR DATOS DEL CLIENTE SI SE ENCUENTRAN
            }
        } else {
            res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI EL USUARIO NO TIENE ROL ADMIN
        }
    } else {
        res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI NO HAY USUARIO AUTENTICADO
    }
}

/* MÉTODO - BUSCAR CLIENTE POR ID - PANEL ADMIN */
const obtener_cliente_admin = async function (req, res) {
    if (req.user) { // VERIFICAR SI HAY UN USUARIO AUTENTICADO
        if (req.user.rol == 'admin') { // VERIFICAR SI EL USUARIO TIENE ROL DE ADMIN
            var id = req.params['id']; // OBTENER EL ID DEL CLIENTE DESDE LOS PARÁMETROS DE LA URL
            try {
                var reg = await Cliente.findById({ _id: id }); // BUSCAR CLIENTE POR ID EN LA BASE DE DATOS
                res.status(200).send({ data: reg }); // ENVIAR DATOS DEL CLIENTE SI SE ENCUENTRAN
            } catch (error) {
                res.status(200).send({ data: undefined }); // RESPONDER CON UNDEFINED EN CASO DE ERROR EN LA CONSULTA
            }

        } else {
            res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI EL USUARIO NO TIENE ROL ADMIN
        }
    } else {
        res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI NO HAY USUARIO AUTENTICADO
    }
}

/* MÉTODO - REGISTRAR NUEVO CLIENTE - PANEL ADMIN */
const registro_cliente_admin = async function (req, res) {
    if (req.user) { // VERIFICAR SI HAY UN USUARIO AUTENTICADO
        if (req.user.rol == 'admin') { // VERIFICAR SI EL USUARIO TIENE ROL DE ADMIN
            var data = req.body; // OBTENER LOS DATOS ENVIADOS DESDE EL FORMULARIO

            var clientes_nombres_arr = []; // ARRAY PARA ALMACENAR CLIENTES CON EL MISMO NOMBRE
            var clientes_apellidos_arr = []; // ARRAY PARA ALMACENAR CLIENTES CON EL MISMO APELLIDO
            var clientes_correo_arr = []; // ARRAY PARA ALMACENAR CLIENTES CON EL MISMO EMAIL
            var clientes_dni_arr = []; // ARRAY PARA ALMACENAR CLIENTES CON EL MISMO DNI

            // BUSCAR CLIENTES EN LA BASE DE DATOS QUE TENGAN EL MISMO NOMBRE, APELLIDO, EMAIL O DNI
            clientes_nombres_arr = await Cliente.find({ nombres: data.nombres });
            clientes_apellidos_arr = await Cliente.find({ apellidos: data.apellidos });
            clientes_correo_arr = await Cliente.find({ email: data.email });
            clientes_dni_arr = await Cliente.find({ dni: data.dni });

            // VERIFICAR QUE NO EXISTAN CLIENTES REGISTRADOS CON LOS MISMOS DATOS
            if (clientes_nombres_arr.length == 0 && clientes_apellidos_arr.length == 0 && clientes_correo_arr.length == 0 && clientes_dni_arr.length == 0) {
                bcrypt.hash('123456789', null, null, async function (err, hash) { // ENCRIPTAR UNA CONTRASEÑA POR DEFECTO
                    if (hash) { // VALIDAR QUE LA CONTRASEÑA SE ENCRIPTE CORRECTAMENTE
                        data.password = hash; // ASIGNAR CONTRASEÑA ENCRIPTADA AL OBJETO DATA
                        let reg = await Cliente.create(data); // REGISTRAR AL CLIENTE EN LA BASE DE DATOS
                        res.status(200).send({ data: reg }); // ENVIAR RESPUESTA DE ÉXITO CON LOS DATOS REGISTRADOS
                    } else {
                        res.status(200).send({ message: 'Hubo un error en el servidor', data: undefined }); // RESPONDER CON ERROR SI LA CONTRASEÑA NO SE ENCRIPTA
                    }
                });
            } else {
                res.status(500).send({ message: 'Datos del cliente ya fueron registrados' }); // RESPONDER SI ALGÚN DATO YA EXISTE EN LA BD
            }
        } else {
            res.status(500).send({ message: 'NoAccess' }); // RESPUESTA EN CASO DE QUE EL USUARIO NO SEA ADMIN
        }
    } else {
        res.status(500).send({ message: 'NoAccess' }); // RESPUESTA EN CASO DE QUE NO HAYA USUARIO AUTENTICADO
    }
}

/* MÉTODO - ACTUALIZAR CLIENTE POR ID - PANEL ADMIN */
const actualizar_cliente_admin = async function (req, res) {
    if (req.user) { // VERIFICAR SI HAY UN USUARIO AUTENTICADO
        if (req.user.rol == 'admin') { // VERIFICAR SI EL USUARIO TIENE ROL DE ADMIN
            var id = req.params['id']; // OBTENER EL ID DEL CLIENTE A ACTUALIZAR
            var data = req.body; // OBTENER DATOS ACTUALIZADOS DESDE EL FORMULARIO

            var clientes_nombres_arr = []; // ARRAYS PARA VERIFICAR DATOS DUPLICADOS EXCLUYENDO AL CLIENTE ACTUAL
            var clientes_apellidos_arr = [];
            var clientes_correo_arr = [];
            var clientes_dni_arr = [];

            clientes_nombres_arr = await Cliente.find({ nombres: data.nombres, _id: { $ne: id } });
            clientes_apellidos_arr = await Cliente.find({ apellidos: data.apellidos, _id: { $ne: id } });
            clientes_correo_arr = await Cliente.find({ email: data.email, _id: { $ne: id } });
            clientes_dni_arr = await Cliente.find({ dni: data.dni, _id: { $ne: id } });

            // VALIDAR QUE NINGÚN OTRO CLIENTE TENGA LOS MISMOS DATOS
            if (clientes_nombres_arr.length == 0 && clientes_apellidos_arr.length == 0 && clientes_correo_arr.length == 0 && clientes_dni_arr.length == 0) {
                var reg = await Cliente.findByIdAndUpdate({ _id: id }, {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    email: data.email,
                    telefono: data.telefono,
                    genero: data.genero,
                    f_nacimiento: data.f_nacimiento,
                    dni: data.dni,
                    direccion: data.direccion
                }); // ACTUALIZAR CLIENTE EN LA BASE DE DATOS
                res.status(200).send({ data: reg }); // RESPUESTA EXITOSA CON LOS DATOS ACTUALIZADOS
            } else {
                res.status(500).send({ message: 'Datos del cliente ya esta en uso' }); // RESPONDER SI ALGÚN DATO YA ESTÁ EN USO POR OTRO CLIENTE
            }
        } else {
            res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI EL USUARIO NO TIENE ROL ADMIN
        }
    } else {
        res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI NO HAY USUARIO AUTENTICADO
    }
}

/* MÉTODO - ELIMINAR CLIENTE POR ID - PANEL ADMIN */
const eliminar_cliente_admin = async function (req, res) {
    if (req.user) { // VERIFICAR SI HAY UN USUARIO AUTENTICADO
        if (req.user.rol == 'admin') { // VERIFICAR SI EL USUARIO TIENE ROL DE ADMIN
            var id = req.params['id']; // OBTENER EL ID DEL CLIENTE A ELIMINAR

            let reg = await Cliente.findByIdAndDelete({ _id: id }); // ELIMINAR CLIENTE DE LA BASE DE DATOS POR ID

            res.status(200).send({ data: reg }); // RESPUESTA CON LOS DATOS DEL CLIENTE ELIMINADO

        } else {
            res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI EL USUARIO NO TIENE ROL ADMIN
        }
    } else {
        res.status(500).send({ message: 'NoAccess' }); // RESPUESTA SI NO HAY USUARIO AUTENTICADO
    }
}

module.exports = {
    //CRUD CLIENTE - PANEL ADMIN
    listar_o_bucar_dni_cliente_admin,
    obtener_cliente_admin,
    registro_cliente_admin,
    actualizar_cliente_admin,
    eliminar_cliente_admin,
}