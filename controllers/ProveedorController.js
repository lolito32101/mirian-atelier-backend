'use strict'

var Proveedor = require('../models/proveedor');


/* MÉTODO - LISTAR Y/O FILTRAR PROVEEDOR ("ruc") */
const listar_proveedor_y_filtrar_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') { /* VERIFICA SI TIENES EL ROL DE "admin" */
            let ruc = req.params['ruc']; /* PALABRA QUE SE USARA PARA FILTRAR */
            /* SI NO SE MENCIONA EL RUC ENTONCES SE MOSTRARA TODA LA LISTA DE PROVEEDORES */
            if (ruc == null || ruc == 'null') { 
                let reg = await Proveedor.find();
                res.status(200).send({ data: reg });
            } else {
                let reg = await Proveedor.find({ ruc: new RegExp("^" + ruc, 'i') });
                res.status(200).send({ data: reg });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/* MÉTODO - BUSCAR PROVEEDOR POR ID Y OBTENER ID */
const obtener_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            var id = req.params['id'];
            try {
                var reg = await Proveedor.findById({ _id: id });
                res.status(200).send({ data: reg });
            } catch (error) {
                res.status(200).send({ data: undefined });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/* MÉTODO - REGISTRAR NUEVO PROVEEDOR */
const registro_proveedor_admin = async function(req,res){
    if (req.user) {
        if (req.user.rol == 'admin') { /* VERIFICA SI TIENES EL ROL DE "admin" */
            var data = req.body; /* TRAE LOS DATOS DEL HTML A UNA VARIABLE DATA */
            /* ARRAY'S PARA ALMACENAR DATOS DEL NUEVO PROVEEDOR */
            var proveedores_nombres_arr = [];
            var proveedores_correo_arr = [];
            var proveedores_telefono_arr = [];
            var proveedores_ruc_arr = [];
            var proveedores_direccion_arr = [];
            /* VERIFICA SI ALGUN DATO YA EXSITE EN LA BD */
            proveedores_nombres_arr = await Proveedor.find({ nombre: data.nombre });
            proveedores_correo_arr = await Proveedor.find({ correo: data.correo });
            proveedores_telefono_arr = await Proveedor.find({ telefono: data.telefono });
            proveedores_ruc_arr = await Proveedor.find({ ruc: data.ruc });
            proveedores_direccion_arr = await Proveedor.find({ direccion: data.direccion });
            /* SI NO HAY DATOS YA REPETIDOS (0) ENTONCES SE REGISTRA AL NUEVO PROVEEDOR */
            if(proveedores_nombres_arr.length == 0 && proveedores_correo_arr.length == 0 && proveedores_telefono_arr.length == 0 && proveedores_ruc_arr.length == 0){
                let reg = await Proveedor.create(data); /* REGISTRO */
                res.status(200).send({data:reg});
            } else {
                res.status(500).send({ message: 'Datos del proveedor ya fueron registrados' });
            }
        }else{
            res.status(500).send({message:'NoAccess'});
        }
    }else{
        res.status(500).send({message:'NoAccess'});
    }
}

/* MÉTODO - ACTUALIZAR PROVEEDOR */
const actualizar_proveedor_admin = async function (req, res) {
    try {
        if (req.user) {
            if (req.user.role == 'admin') {
                var id = req.params['id'];
                var data = req.body;

                var proveedores_nombres_arr = await Proveedor.find({ nombre: data.nombre, _id: { $ne: id } });
                var proveedores_correo_arr = await Proveedor.find({ correo: data.correo, _id: { $ne: id } });
                var proveedores_telefono_arr = await Proveedor.find({ telefono: data.telefono, _id: { $ne: id } });
                var proveedores_ruc_arr = await Proveedor.find({ ruc: data.ruc, _id: { $ne: id } });

                if (
                    proveedores_nombres_arr.length == 0 &&
                    proveedores_correo_arr.length == 0 &&
                    proveedores_telefono_arr.length == 0 &&
                    proveedores_ruc_arr.length == 0
                ) {
                    var reg = await Proveedor.findByIdAndUpdate(
                        { _id: id },
                        {
                            nombre: data.nombre,
                            correo: data.correo,
                            telefono: data.telefono,
                            ruc: data.ruc,
                            direccion: data.direccion
                        },
                        { new: true }
                    );
                    res.status(200).send({ data: reg });
                } else {
                    res.status(500).send({ message: 'Datos del proveedor ya está en uso' });
                }
            } else {
                res.status(500).send({ message: 'NoAccess' });
            }
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } catch (error) {
        console.log('ERROR AL ACTUALIZAR PROVEEDOR:', error);
        res.status(500).send({ message: 'Error en el servidor', error });
    }
}
/* MÉTODO - ELIMINAR PROVEEDOR */
const eliminar_proveedor_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            var id = req.params['id'];

            let reg = await Proveedor.findByIdAndDelete({ _id: id });

            res.status(200).send({ data: reg });

        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

module.exports = {
    listar_proveedor_y_filtrar_admin,
    obtener_proveedor_admin,
    registro_proveedor_admin,
    actualizar_proveedor_admin,
    eliminar_proveedor_admin,
}