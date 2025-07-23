'use strict'

/* DECLARACIÓN DE VARIABLES PARA LLAMAR A LOS PAQUETES */
var express = require('express')
var app = express();
var bodyparser = require('body-parser')
var mongoose = require('mongoose')
var server = require('http').createServer(app);
var port = process.env.PORT || 4201; /* PUERTO A EJECUTAR */


var cliente_route = require('./routes/cliente');
var proveedor_route = require('./routes/proveedor');
var producto_route = require('./routes/producto');
var categoria_route = require('./routes/categoria')
var talla_route = require('./routes/talla')
var admin_route = require('./routes/admin');
var config_route = require('./routes/config');

/* CONECCIÓN a LA BASE DE DATOS MONDODB */
mongoose.connect("mongodb+srv://abelloorizano:Y7ZVVx3cuOyE9ErC@mirian-atelier.4e6uhpb.mongodb.net/mirian_atelier?retryWrites=true&w=majority&appName=mirian-atelier").then(() => {
    console.log('✅ Conectado a MongoDB Atlas');
    server.listen(port, function () {
        console.log('🚀 Servidor corriendo en el puerto ' + port);
    });
}).catch(err => console.error('❌ Error al conectar con MongoDB Atlas:', err));

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json({limit:'50mb',  extended:true}));

/* CONFIGURACIÓN DE CORS (Control de acceso entre dominios) */
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*'); 
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET, PUT, POST, DELETE, OPTIONS');
    res.header('Allow','GET, PUT, POST, DELETE, OPTIONS');
    next();
});
// RESPUESTA A PRE-REQUEST DE CORS
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.sendStatus(200);
});

/* RUTAS */
app.use('/api',cliente_route);
app.use('/api',proveedor_route);
app.use('/api',producto_route);
app.use('/api',categoria_route);
app.use('/api',talla_route);
app.use('/api',admin_route);
app.use('/api',config_route);

module.exports = app;