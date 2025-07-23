'use strict'
/* DEFINIR EL MODELO DE "Producto_proveedor", ESTE SE ENCARGA DE GUARDAR EL PRODUCTO Y PROVEEDOR EN UNA TABLA APARTE */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Producto_proveedorSchema = Schema({
    producto: {type: Schema.ObjectId, ref: 'producto', required: true},
    proveedor: {type: Schema.ObjectId, ref: 'proveedor', require: true},
    /* preciocompra: {type: Number,required:true }, */
    /* estadodelete: {type: String,default:'Activo',required: true }, */
    createdAt:{ type:Date,default: Date.now, required: true }
});

module.exports = mongoose.model('producto_proveedor',Producto_proveedorSchema);