const mongoose = require('mongoose');

const TallaSchema = mongoose.Schema({
    producto: { type: mongoose.Schema.Types.ObjectId, ref: 'producto', required: true },
    talla: { type: String, required: true },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('talla', TallaSchema);
