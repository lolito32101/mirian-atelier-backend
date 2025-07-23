'use strict'

var express = require('express');
var TallaController = require('../controllers/TallaController');
var api = express.Router();
var auth = require('../middlewares/authenticate');   

api.get('/listar_talla_admin/:id', auth.auth, TallaController.listar_talla_admin);
api.post('/registrar_talla_admin', auth.auth, TallaController.registrar_talla_admin);
api.put('/modificar_talla_admin/:id', auth.auth, TallaController.modificar_talla_admin);
api.delete('/eliminar_talla_admin/:id', auth.auth, TallaController.eliminar_talla_admin);

module.exports = api;
