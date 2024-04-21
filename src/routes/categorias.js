const express = require("express");
const mongoose = require("mongoose");
const categSchema = require("../models/categorias");
const prodSchema = require('../models/productos')
const { parse } = require("dotenv");

const router = express.Router();

// post para categorias nuevos
router.post("/catg", (req, res) => {
    const newcat = categSchema(req.body);
    newcat
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Obtener todos los categorias!!
router.get("/catg", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;

    let totalCategorias;

    categSchema
        .countDocuments()
        .then((count) => {
            totalCategorias = count;
            return categSchema
                .find()
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        })
        .then((data) => {
            const cantFaltantes = totalCategorias - (page * pageSize);
            const SiguientePagina = cantFaltantes > 0;
            res.json({ data, SiguientePagina, cantFaltantes });
        })
        .catch((error) => {
            res.json({ message: error.message });
        });
});

// Obtener categoria por id!!
router.get("/catg/:id", (req, res) => {
    const { id } = req.params;
    categSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// actualizar productos por id!!
router.put("/catg/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    categSchema
        .updateOne({_id: id}, { $set: { nombre, descripcion } })
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar productos por id!!
router.delete("/catg/:id", (req, res) => {
    const { id } = req.params;
    categSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Segmentar los productos por categoría
router.get("/listcatg/:id", async (req, res) => {
    try {
        const categoriaId = req.params.id;

        // Agregación para filtrar productos por categoría
        const resultados = await prodSchema.aggregate([
            {
                $match: {
                    clasificacion: new mongoose.Types.ObjectId(categoriaId) // Filtrar por el ID de la categoría
                }
            }
        ]);
        res.json(resultados);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;