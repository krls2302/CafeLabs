const mongoose = require("mongoose");

const prodSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
    },
    precio: {
        type: Number,
    },
    stock: {
        type: Number,
    },
    clasificacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categorias'
    }
});

module.exports = mongoose.model('productos', prodSchema);