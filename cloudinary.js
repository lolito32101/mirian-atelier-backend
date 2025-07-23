require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

cloudinary.config(); // Cloudinary lee automáticamente del .env

module.exports = cloudinary;