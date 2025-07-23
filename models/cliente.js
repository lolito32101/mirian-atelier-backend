'use strict'
/* DEFINIR EL MODELO DE CLIENTE, SE DARA SU ESTRUCTURA COMO LOS CAMPOS, TIPO DE DATO Y SI ES REQUERIDO  */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClienteSchema = Schema({
    nombres: {type: String,required:true },
    apellidos: {type: String,required:true },
    email: {type: String,required:true },
    password: {type: String,required:true },
    telefono: {type: String,required:false },
    genero: {type: String,required:false },
    f_nacimiento: {type: String,required:false },
    dni: {type: String,required:false },
    direccion: {type: String,required:false },
    createdAt:{ type:Date,default:Date.now, required: true }
});

module.exports = mongoose.model('cliente',ClienteSchema);