const express = require("express");
const mongoose = require("mongoose");
const metPagoSchema = require("../models/metodo_pago");
const ventSchema = require('../models/ventas')
const { parse } = require("dotenv");

const router = express.Router();

// post para crear metodos de pago!!!
router.post("/metpag", (req, res) => {
    const newmetPag = metPagoSchema(req.body);
    newmetPag
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Obtener todos los metodos de pago!!
router.get("/metpag", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;

    let totalMetodosPago;

    metPagoSchema
        .countDocuments()
        .then((count) => {
            totalMetodosPago = count;
            return metPagoSchema
                .find()
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        })
        .then((data) => {
            const cantFaltantes = totalMetodosPago - (page * pageSize);
            const SiguientePagina = cantFaltantes > 0;
            res.json({ data, SiguientePagina, cantFaltantes });
        })
        .catch((error) => {
            res.json({ message: error.message });
        });
});

// Obtener metodos de pago por id!!
router.get("/metpag/:id", (req, res) => {
    const { id } = req.params;
    metPagoSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// actualizar metodo de pago por id!!
router.put("/metpag/:id", (req, res) => {
    const { id } = req.params;
    const { nomMetodo, descripcion } = req.body;
    metPagoSchema
        .updateOne({_id: id}, { $set: { nomMetodo, descripcion }})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar metodo de pago por id!!
router.delete("/metpag/:id", (req, res) => {
    const { id } = req.params;
    metPagoSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Segmentar las ventas por metodo de pago!!
router.get("/listmet/:id", async (req, res) => {
    try {
        const metodopagId = req.params.id;

        // Agregación para filtrar ventas por metodo de pago
        const resultados = await ventSchema.aggregate([
            {
                $match: {
                    metodoPago: new mongoose.Types.ObjectId(metodopagId) // Filtrar por el ID de los params
                }
            }
        ]);
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;