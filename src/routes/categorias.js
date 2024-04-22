const express = require("express");
const mongoose = require("mongoose");
const categSchema = require("../models/categorias");
const prodSchema = require('../models/productos')
const { parse } = require("dotenv");

const router = express.Router();

// post para categorias nuevos
/**
 * @swagger
 * /cat/catg:
 *   post:
 *     tags:
 *       - Categorías
 *     summary: Crea una nueva categoría para los productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la categoría
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la categoría
 *     responses:
 *       '201':
 *         description: Categoría creada exitosamente
 *       '400':
 *         description: Error en la solicitud. Verifica los datos enviados.
 *       '500':
 *         description: Error interno del servidor. No se pudo crear la categoría.
 */
router.post("/catg", (req, res) => {
    const newcat = categSchema(req.body);
    newcat
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Obtener todos los categorias!!
/**
 * @swagger
 * /cat/catg:
 *   get:
 *     tags:
 *       - Categorías
 *     summary: Obtiene todos las categorias almacenadas en DB
 *     responses:
 *       '200':
 *         description: Respuesta exitosa!!!
 *       '500':
 *         description: Error interno del servidor!!!
 */
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

// actualizar productos por id!!
/**
 * @swagger
 * /cat/catg/{id}:
 *   put:
 *     summary: Actualiza una categoría por su ID
 *     tags:
 *       - Categorías
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la categoría a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la categoría
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción de la categoría
 *     responses:
 *       '200':
 *         description: Categoría actualizada exitosamente
 *       '404':
 *         description: Categoría no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.put("/catg/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    categSchema
        .updateOne({_id: id}, { $set: { nombre, descripcion } })
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar productos por id!!
/**
 * @swagger
 * /cat/catg/{id}:
 *   delete:
 *     summary: Elimina una categoría por su ID
 *     tags:
 *       - Categorías
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la categoría a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Categoría eliminada exitosamente
 *       '404':
 *         description: Categoría no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.delete("/catg/:id", (req, res) => {
    const { id } = req.params;
    categSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Segmentar los productos por categoría
/**
 * @swagger
 * /cat/listcatg/{id}:
 *   get:
 *     summary: Obtiene todos los productos de una categoría específica
 *     tags:
 *       - Categorías
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la categoría para la cual se desean obtener los productos
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Productos encontrados exitosamente
 *       '404':
 *         description: Categoría no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
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