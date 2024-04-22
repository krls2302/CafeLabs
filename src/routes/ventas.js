const express = require("express");
const mongoose = require("mongoose");
const axios = require('axios');
const ventaSchema = require("../models/ventas");
const prodSchema = require('../models/productos');
const { parse } = require("dotenv");

const router = express.Router();

// Realizar una nueva venta y modificar el stock
/**
 * @swagger
 * /vent/venta:
 *   post:
 *     tags:
 *       - Ventas
 *     summary: Crea un nueva venta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto:
 *                 type: string
 *                 description: ID del producto
 *               cantidad:
 *                 type: number
 *                 description: Cantidad de venta
 *               metodoPago:
 *                 type: string
 *                 description: ID del metodo de pago
 *     responses:
 *       '201':
 *         description: Venta Realizada exitosamente
 *       '400':
 *         description: Error en la solicitud. Verifica los datos enviados.
 *       '500':
 *         description: Error interno del servidor.
 */
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
/**
 * @swagger
 * /vent/venta:
 *   get:
 *     tags:
 *       - Ventas
 *     summary: Obtiene todos las ventas almacenadas
 *     responses:
 *       '200':
 *         description: Respuesta exitosa!!!
 *       '500':
 *         description: Error interno del servidor!!!
 */
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

// actualizar metodo de pago por id!!
/**
 * @swagger
 * /vent/venta/{id}:
 *   put:
 *     summary: Actualiza una producto por su ID
 *     tags:
 *       - Ventas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto:
 *                 type: string
 *                 description: ID del producto
 *               cantidad:
 *                 type: number
 *                 description: Cantidad de venta
 *               metodoPago:
 *                 type: string
 *                 description: ID del metodo de pago
 *     responses:
 *       '200':
 *         description: Categoría actualizada exitosamente
 *       '404':
 *         description: Categoría no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.put("/venta/:id", (req, res) => {
    const { id } = req.params;
    const { producto, cantidad, metodoPago } = req.body;
    ventaSchema
        .updateOne({_id: id}, { $set: { producto, cantidad, metodoPago }})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar metodo de pago por id!!
/**
 * @swagger
 * /vent/venta/{id}:
 *   delete:
 *     summary: Elimina un venta por su ID
 *     tags:
 *       - Ventas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la venta a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Venta eliminada exitosamente
 *       '404':
 *         description: Venta no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.delete("/venta/:id", (req, res) => {
    const { id } = req.params;
    ventaSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});


module.exports = router;