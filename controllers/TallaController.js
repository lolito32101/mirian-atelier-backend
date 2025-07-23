'use strict'

const Talla = require('../models/talla');

/* MÉTODO - LISTAR TALLAS DE UN PRODUCTO - PANEL ADMIN */
const listar_talla_admin = async function(req, res) {
    try {
        let id = req.params.id;
        let tallas = await Talla.find({ producto: id }).populate('producto');
        res.status(200).send({ data: tallas });
    } catch (error) {
        res.status(500).send({ message: 'Error al listar tallas', error });
    }
}

/* MÉTODO - REGISTRAR TALLA - PANEL ADMIN */
const registrar_talla_admin = async function (req, res) {
    try {
        const { producto, talla } = req.body;

        // VERIFICAR SI LA TALLA YA EXISTE SIN IMPORTAR MAYÚSCULAS
        const existe_talla = await Talla.findOne({
            producto: producto,
            talla: { $regex: '^' + talla + '$', $options: 'i' } // i = case insensitive
        });

        if (existe_talla) {
            return res.status(400).send({ message: 'La talla ya existe para este producto' });
        }

        // REGISTRAR TALLA SI NO EXISTE
        const nuevaTalla = await Talla.create({
            producto: producto,
            talla: talla,
            stock: req.body.stock || 0
        });

        res.status(200).send({ message: 'Talla registrada correctamente', data: nuevaTalla });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error al registrar talla', error });
    }
};


/* MÉTODO - MODIFICAR TALLA - PANEL ADMIN */
const modificar_talla_admin = async (req, res) => {
    if (req.user) {
        try {
            const id = req.params['id'];
            const data = req.body;
            const talla = await Talla.findByIdAndUpdate(id, data, { new: true });
            res.status(200).send({ talla });
        } catch (error) {
            res.status(500).send({ message: 'Error al modificar talla', error });
        }
    } else {
        res.status(500).send({ message: 'NoAccess' });
    }
};

/* MÉTODO - ELIMINAR TALLA ADMIN */
const eliminar_talla_admin = async function (req, res) {
    if (req.user) {
        try {
            const id = req.params['id'].trim();
            const talla = await Talla.findByIdAndDelete(id);
            if (!talla) {
                return res.status(404).send({ message: 'Talla no encontrada' });
            }
            res.status(200).send({ message: 'Talla eliminada', talla });
        } catch (error) {
            console.log('Error al eliminar talla:', error);
            res.status(500).send({ message: 'Error al eliminar talla', error });
        }
    } else {
        res.status(403).send({ message: 'NoAccess' });
    }
};


module.exports = {
    listar_talla_admin,
    registrar_talla_admin,
    modificar_talla_admin,
    eliminar_talla_admin
};
