'use strict'

var express = require('express')
var app = express();
var bodyparser = require('body-parser')
var mongoose = require('mongoose')
var port = process.env.PORT || 4201; // Puerto desde variable de entorno o 4201
var cors = require('cors');

var cliente_route = require('./routes/cliente');
var proveedor_route = require('./routes/proveedor');
var producto_route = require('./routes/producto');
var categoria_route = require('./routes/categoria');
var talla_route = require('./routes/talla');
var admin_route = require('./routes/admin');
var config_route = require('./routes/config');

/* Conexión a MongoDB usando variable de entorno */
mongoose.connect(process.env.DB_MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('✅ Conectado a MongoDB Atlas');

    // Arrancar el servidor solo después de conectar a la base de datos
    app.listen(port, () => {
        console.log('🚀 Servidor corriendo en el puerto ' + port);
    });
}).catch(err => {
    console.error('❌ Error al conectar con MongoDB Atlas:', err);
    process.exit(1); // Salir si no conecta a la DB
});

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json({ limit: '50mb', extended: true }));

/* Configuración CORS oficial con origen específico */
app.use(cors({
    origin: [
        'https://wonderful-madeleine-04514e.netlify.app', // producción
        'http://localhost:4200'                            // desarrollo local
    ], 
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.options('*', (req, res) => {
    res.sendStatus(200);
});

/* Rutas */
app.use('/api', cliente_route);
app.use('/api', proveedor_route);
app.use('/api', producto_route);
app.use('/api', categoria_route);
app.use('/api', talla_route);
app.use('/api', admin_route);
app.use('/api', config_route);
