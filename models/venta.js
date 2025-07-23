'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VentaSchema = Schema({
    cliente: {type: Schema.ObjectId, ref: 'cliente', required: true},
    nventa:  {type: String, require: true},
    subtotal: {type: Number, require: true},
    envio_titulo: {type: String, require: true},
    envio_precio: {type: Number, require: true},
    transaccion: {type: String, require: true},
    cupon: {type: String, require: true},
    estado: {type: String, require: true},
    direccion: {type: String, required: true},
    nota: {type: String, require: false},
    
    igv: {type: String, require: true},
    cantidad_igv: {type: Number, require: true},

    //  TRAIDO DE TIENDA V2
    //---------------------
    total_pagar: {type: Number, require: false},
    currency: {type: String, require: false},
    tracking: {type: String,default: '', require: false},
    envio_precio: {type: Number, require: false},
    metodo_pago: {type: String, require: false},
    tipo_descuento: {type: String, require: false},
    valor_descuento: {type: String, require: false},
    //----------------------

    createdAt: {type:Date, default: Date.now, require: true},
});

module.exports =  mongoose.model('venta',VentaSchema);

