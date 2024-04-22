const express = require("express");
const mongoose = require("mongoose");
const metPagoSchema = require("../models/metodo_pago");
const ventSchema = require('../models/ventas')
const { parse } = require("dotenv");

const router = express.Router();

// post para crear metodos de pago!!!
/**
 * @swagger
 * /met/metpag:
 *   post:
 *     tags:
 *       - Metodo de Pago
 *     summary: Crea un nuevo metodo de pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomMetodo:
 *                 type: string
 *                 description: Nombre del metodo de pago
 *               descripcion:
 *                 type: string
 *                 description: Descripción del metodo de pago
 *     responses:
 *       '201':
 *         description: Metodo de pago creado exitosamente
 *       '400':
 *         description: Error en la solicitud. Verifica los datos enviados.
 *       '500':
 *         description: Error interno del servidor. No se pudo crear el metodo de pago.
 */
router.post("/metpag", (req, res) => {
    const newmetPag = metPagoSchema(req.body);
    newmetPag
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Obtener todos los metodos de pago!!
/**
 * @swagger
 * /met/metpag:
 *   get:
 *     tags:
 *       - Metodo de Pago
 *     summary: Obtiene todos los metodos de pago.
 *     responses:
 *       '200':
 *         description: Respuesta exitosa!!!
 *       '500':
 *         description: Error interno del servidor!!!
 */
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

// actualizar metodo de pago por id!!
/**
 * @swagger
 * /met/metpag/{id}:
 *   put:
 *     summary: Actualiza un metodo de pago por su ID
 *     tags:
 *       - Metodo de Pago
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del metodo de pago a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomMetodo:
 *                 type: string
 *                 description: Nuevo nombre del metodo de pago
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción del metodo de pago
 *     responses:
 *       '200':
 *         description: Metodo de pago actualizada exitosamente
 *       '404':
 *         description: Metodo de pago no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.put("/metpag/:id", (req, res) => {
    const { id } = req.params;
    const { nomMetodo, descripcion } = req.body;
    metPagoSchema
        .updateOne({_id: id}, { $set: { nomMetodo, descripcion }})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar metodo de pago por id!!
/**
 * @swagger
 * /met/metpag/{id}:
 *   delete:
 *     summary: Elimina un metodo de pago por su ID
 *     tags:
 *       - Metodo de Pago
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del metodo de pago a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Metodo de pago eliminado exitosamente
 *       '404':
 *         description: Metodo de pago no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.delete("/metpag/:id", (req, res) => {
    const { id } = req.params;
    metPagoSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Segmentar las ventas por metodo de pago!!
/**
 * @swagger
 * /met/listmet/{id}:
 *   get:
 *     summary: Obtiene todos las ventas por metodo de pago especifico.
 *     tags:
 *       - Metodo de Pago
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del metodo de pago por el cual se desean obtener las ventas.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Ventas encontrados exitosamente.
 *       '404':
 *         description: Ventas no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
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