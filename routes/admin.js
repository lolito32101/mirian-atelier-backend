'use stritc'

var express = require('express');
var adminController = require('../controllers/AdminController');
var auth = require('../middlewares/authenticate');  

var api = express.Router();
/* var auth = require('../middlewares/authenticate'); */

// PRINCIPAL (LOGIN Y CREACION DEL ADMIN)
api.post('/registro_admin',adminController.registro_admin);
api.post('/login_admin',adminController.login_admin);
api.get('/listar_variedades_productos_admin', auth.auth, adminController.listar_variedades_productos_admin);
api.post('/registro_compra_manual_cliente',auth.auth,adminController.registro_compra_manual_cliente);

// LISTAR VENTAS ADMIN
api.get('/listar_ventas_admin/:filtro?', auth.auth, adminController.listar_ventas_admin);



module.exports = api;

