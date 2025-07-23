'use strict'

var express = require('express');
var clienteController = require('../controllers/ClienteController'); /* LLAMAR AL CONTROLADOR */

var api = express.Router();
var auth = require('../middlewares/authenticate');

// CRUD CLIENTE - PANEL ADMIN
api.get('/listar_o_bucar_dni_cliente_admin/:dni?',auth.auth,clienteController.listar_o_bucar_dni_cliente_admin);
api.post('/registro_cliente_admin',auth.auth,clienteController.registro_cliente_admin);
api.get('/obtener_cliente_admin/:id',auth.auth,clienteController.obtener_cliente_admin);
api.put('/actualizar_cliente_admin/:id',auth.auth,clienteController.actualizar_cliente_admin);
api.delete('/eliminar_cliente_admin/:id',auth.auth,clienteController.eliminar_cliente_admin);

module.exports = api;

