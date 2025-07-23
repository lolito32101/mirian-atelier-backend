'use strict'

var express = require('express');
var categoriaController = require('../controllers/CategoriaController'); /* LLAMAR AL CONTROLADOR */

var api = express.Router();
var auth = require('../middlewares/authenticate');

// CRUD CATEGOÍA - PANEL ADMIN
api.get('/listar_categoria_admin',auth.auth,categoriaController.listar_categoria_admin);
api.post('/registro_categoria_admin',auth.auth,categoriaController.registro_categoria_admin);
api.put('/editar_categoria_admin/:id', auth.auth, categoriaController.editar_categoria_admin);
api.delete('/eliminar_categoria_admin/:id', auth.auth, categoriaController.eliminar_categoria_admin);


module.exports = api;

