'use strict'

var express = require('express');
var proveedorController = require('../controllers/ProveedorController');

var api = express.Router();
var auth = require('../middlewares/authenticate');   

api.get('/listar_proveedor_y_filtrar_admin/:ruc?',auth.auth,proveedorController.listar_proveedor_y_filtrar_admin);
api.get('/obtener_proveedor_admin/:id',auth.auth,proveedorController.obtener_proveedor_admin);
api.post('/registro_proveedor_admin',auth.auth,proveedorController.registro_proveedor_admin);
api.put('/actualizar_proveedor_admin/:id',auth.auth,proveedorController.actualizar_proveedor_admin);
api.delete('/eliminar_proveedor_admin/:id',auth.auth,proveedorController.eliminar_proveedor_admin);

module.exports = api;