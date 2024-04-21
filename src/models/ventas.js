const mongoose = require("mongoose");

const ventaSchema = mongoose.Schema({
    producto : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productos',
        require: true
    },
    cantidad: {
        type: Number,
        required: true
    },
    metodoPago : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'metodopagos',
        require: true
    },
    fecha: {
        type: Date,
        default: Date.now,
        require: true
    }
});

module.exports = mongoose.model('ventas', ventaSchema);