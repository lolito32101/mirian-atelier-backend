var Config = require('../models/config');

var fs = require('fs');
var path = require('path');
const { config } = require('process');


/* METODO - ACTULIZAR DATOS DE LA TIENDA(CATEGORIAS, LOGO, NOMBRE) */
const actualizar_config_admin = async function (req, res) {
    if (req.user) {
        console.log('Usuario autenticado:', req.user);
        if (req.user.rol == 'admin') {
            let data = req.body;
            if (req.files) {
                var img_path = req.files.logo.path;
                var name = img_path.split('\\');
                var logo_name = name[2];
                let reg = await Config.findByIdAndUpdate({ _id: "6813f05ac7e46c2a789a54bb" }, {
                    categorias: JSON.parse(data.categorias),
                    titulo: data.titulo,
                    logo: logo_name,
                    serie: data.serie,
                    correlativo: data.correlativo,
                });
                fs.stat('./uploads/configuraciones/' + reg.logo, function (err) {
                    if (!err) {
                        fs.unlink('./uploads/configuraciones/' + reg.logo, (err) => {
                            if (err) throw err;
                        })
                    }
                })
                res.status(200).send({ data: reg });
            } else {
                console.log('no hay imagen');
                let reg = await Config.findByIdAndUpdate({ _id: "6813f05ac7e46c2a789a54bb" }, {
                    categorias: data.categorias,
                    titulo: data.titulo,
                    serie: data.serie,
                    correlativo: data.correlativo,
                });
                res.status(200).send({ data: reg });
            }
        } else {
            res.status(500).send({ message: 'NoAccess2' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess3' });
    }
}

/* METODO - OBTIENE LOS DATOS EXISTENTES DE LA TIENDA(CATEGORIAS, LOGO, NOMBRE) */
const obtener_config_admin = async function (req, res) {
    if (req.user) {
        if (req.user.rol == 'admin') {
            let reg = await Config.findById({ _id: "6813f05ac7e46c2a789a54bb" });
            res.status(200).send({ data: reg });
        } else {
            res.status(500).send({ message: 'NoAccess' });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
}

/* METODO - OBTIENE LOGO ACTUAL DE LA TIENDA */
const obtener_logo = async function (req, res) {
    var img = req.params['img'];
    fs.stat('./uploads/logos/nuevos_logos/' + img, function (err) {
        if (!err) {
            let path_img = './uploads/logos/nuevos_logos/' + img;
            res.status(200).sendFile(path.resolve(path_img));
        } else {
            let path_img = './uploads/logo_default.png';
            res.status(200).sendFile(path.resolve(path_img));
        }
    })
}

module.exports = {
    actualizar_config_admin,
    obtener_config_admin,
    obtener_logo,
}