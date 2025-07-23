'use strict'
/* DEFINIR EL MODELO DE CONFIGURACIÓN GENERAL DEL SISTEMA, CONTIENE CAMPOS COMO CATEGORÍAS, TÍTULO, LOGO, SERIE Y CORRELATIVO */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ConfigSchema = Schema({ //diferente
    categorias: [{type: Object,required:true }],
    titulo: {type: String,required:true },
    logo: {type: String,required:true },
    serie: {type: String,required:true },
    correlativo: {type: String,required:true },
    
});
   
module.exports = mongoose.model('config',ConfigSchema);