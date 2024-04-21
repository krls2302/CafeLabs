const express = require("express");
const mongoose = require("mongoose");
const axios = require('axios');
const ventaSchema = require("../models/ventas");
const prodSchema = require('../models/productos');
const { parse } = require("dotenv");

const router = express.Router();

// post para crear nueva venta!!!
// Realizar una nueva venta y modificar el stock
router.post("/venta", async (req, res) => {
    try {
        // Realiza la consulta de clima actual antes de realizar la venta
        const ciudad = 'Bogotá, CO'; // Nombre de la ciudad para la consulta de clima
        const apiKey = '4c9c71c853066d39c396054e3557d2b5'; // Tu API key de OpenWeatherMap
        const clima = await consultarClima(ciudad, apiKey);

        // generamos las nueva venta
        const nuevaVenta = new ventaSchema(req.body);
        await nuevaVenta.save();

        // Actualiza el stock del producto vendido
        const productoVendido = await prodSchema.findById(req.body.producto);
        if (!productoVendido) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        productoVendido.stock -= req.body.cantidad; // Resta la cantidad vendida al stock
        await productoVendido.save();

        res.json({ message: 'Venta realizada correctamente. El clima en:', ciudad, clima });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Función para consultar el clima actual utilizando la API de OpenWeatherMap
async function consultarClima(ciudad, apiKey) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric`);
        return response.data.main.temp_max;
    } catch (error) {
        console.error('Error al consultar el clima:', error.message);
        throw error;
    }
}

// Obtener todos las ventas!!
router.get("/venta", (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 5;

    let totalventa;

    ventaSchema
        .countDocuments()
        .then((count) => {
            totalventa = count;
            return ventaSchema
                .find()
                .skip((page - 1) * pageSize)
                .limit(pageSize);
        })
        .then((data) => {
            const cantFaltantes = totalventa - (page * pageSize);
            const SiguientePagina = cantFaltantes > 0;
            res.json({ data, SiguientePagina, cantFaltantes });
        })
        .catch((error) => {
            res.json({ message: error.message });
        });
});

// Obtener metodos de pago por id!!
router.get("/venta/:id", (req, res) => {
    const { id } = req.params;
    ventaSchema
        .findById(id)
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// actualizar metodo de pago por id!!
router.put("/venta/:id", (req, res) => {
    const { id } = req.params;
    const { producto, cantidad, metodoPago } = req.body;
    ventaSchema
        .updateOne({_id: id}, { $set: { producto, cantidad, metodoPago }})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar metodo de pago por id!!
router.delete("/venta/:id", (req, res) => {
    const { id } = req.params;
    ventaSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});


module.exports = router;