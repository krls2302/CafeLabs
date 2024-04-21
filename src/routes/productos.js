const express = require("express");
const mongoose = require("mongoose")
const prodSchema = require("../models/productos");
const ventSchema = require("../models/ventas")
const { parse } = require("dotenv");

const router = express.Router();

// post para productos nuevos
router.post("/prod", (req, res) => {
    const newProd = prodSchema(req.body);
    newProd
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Obtener todos los productos!!
router.get("/prod", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;

    let totalProducts;

    prodSchema
        .countDocuments()
        .then((count) => {
            totalProducts = count;
            return prodSchema
                .find()
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        })
        .then((data) => {
            const cantFaltantes = totalProducts - (page * pageSize);
            const SiguientePagina = cantFaltantes > 0;
            res.json({ data, SiguientePagina, cantFaltantes });
        })
        .catch((error) => {
            res.json({ message: error.message });
        });
});

// Obtener productos por id!!
router.get("/prod/:id", (req, res) => {
    const { id } = req.params;
    prodSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// actualizar productos por id!!
router.put("/prod/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, clasificacion } = req.body;
    prodSchema
        .updateOne({_id: id}, { $set: {nombre, descripcion, precio, stock, clasificacion} })
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar productos por id!!
router.delete("/prod/:id", (req, res) => {
    const { id } = req.params;
    prodSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Devolver los productos por clasificación puntual
router.get("/prod/:clasificacion", (req, res) => {
    const { clasificacion } = req.params.data;
    console.log(req.query);

    prodSchema
        .find({ $clasificacion: clasificacion }) // Filtrar por la clasificación especificada
        .then((data) => {
            res.json(data);
        })
        .catch((error) => res.json({message: error}));
});

// Devolver los productos por clasificación puntual
router.get("/prod/:clasificacion", (req, res) => {
    const clasificacion = req.params.clasificacion;
    console.log(req.params)
    prodSchema
        .find() // Buscar por la clasificación especificada, ignorando mayúsculas y minúsculas
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            res.status(500).json({ message: error.message });
        });
});

// calcular el inventario de cuantos productos hay y cuantos vendidos
router.get("/inventario", async (req, res) => {
    try {
        // Obtener todos los productos
        const productos = await prodSchema.find();

        // Calcular el inventario de cada producto
        const inventario = productos.map(async (producto) => {
            // Obtener el total vendido del producto
            const ventas = await ventSchema.find({ producto: producto._id });
            const totalVendido = ventas.reduce((total, venta) => total + venta.cantidad, 0);

            return {
                producto: producto.nombre,
                stockActual: producto.stock,
                vendido: totalVendido
            };
        });

        res.json(await Promise.all(inventario));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;