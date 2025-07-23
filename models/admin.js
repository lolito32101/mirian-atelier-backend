'use strict' 
/* DEFINIR EL MODELO DE ADMIN, SE DARA SU ESTRUCTURA COMO LOS CAMPOS, TIPO DE DATO Y SI ES REQUERIDO  */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AdminSchema = Schema({ 
    nombres: {type: String,required:true },
    apellidos: {type: String,required:true },
    email: {type: String,required:true },
    password: {type: String,required:true },
    telefono: {type: String,required:false },
    rol: {type: String,required:true },
    dni: {type: String,required:false },
});
   
   
  

module.exports = mongoose.model('admin',AdminSchema);