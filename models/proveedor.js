'use strict'
/* DEFINIR EL MODELO DE PROVEEDOR, SE DARA SU ESTRUCTURA COMO LOS CAMPOS, TIPO DE DATO Y SI ES REQUERIDO  */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProveedorSchema = Schema({
    nombre: {type: String,required:true },
    correo: {type: String,required:true },
    telefono: {type: String,required:false },
    ruc: {type: String,required:true },
    direccion: {type: String,required:true },
    createdAt:{ type:Date,default:Date.now, required: true }
});

module.exports = mongoose.model('proveedor',ProveedorSchema);