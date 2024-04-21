const mongoose = require("mongoose")

const metodoSchema = mongoose.Schema({
    nomMetodo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
    },
});

module.exports = mongoose.model('metodoPago', metodoSchema);