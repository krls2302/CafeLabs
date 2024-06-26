const mongoose = require("mongoose");

const categSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
    },
});

module.exports = mongoose.model('categorias', categSchema);