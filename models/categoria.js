'use strict' 
/* DEFINIR EL MODELO DE CATEGORIA, SE DARA SU ESTRUCTURA COMO LOS CAMPOS, TIPO DE DATO Y SI ES REQUERIDO  */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategoriaSchema = Schema({ 
    categoria: {type: String,required:true },
    productos: {type: Number,required:false },
});
   
module.exports = mongoose.model('categoria',CategoriaSchema);
