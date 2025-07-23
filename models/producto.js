'use strict'
/* DEFINIR EL MODELO DE PRODUCTO, SE DARA SU ESTRUCTURA COMO LOS CAMPOS, TIPO DE DATO Y SI ES REQUERIDO  */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductoSchema = Schema({
    titulo: {type: String,required:true },
    titulo_URL: {type: String,required:false },
    /* galeria: [{type: Object,required:false }], */
    portada: {type: String,required:true },
    precio: {type: Number,required:true },
    descripcion: {type: String,required:true },
    /* contenido: {type: String,required:true },
    stock: {type: Number,required:true },
    stockMin: {type: Number,required:true },
    stockMax: {type: Number,required:true }, */
    nventas: {type: Number, default:0, required:true },
    categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'categoria', required: true },
    publicado: { type: Boolean, default: false, required: true },
    /* estado: {type: String,default:'Activo',required: true }, */
    createdAt:{ type:Date,default: Date.now, required: true }
});

module.exports = mongoose.model('producto',ProductoSchema);