const express = require("express");
const mongoose = require("mongoose")
const prodSchema = require("../models/productos");
const ventSchema = require("../models/ventas")
const { parse } = require("dotenv");

const router = express.Router();

// post para productos nuevos
/**
 * @swagger
 * /api/prod:
 *   post:
 *     tags:
 *       - Productos
 *     summary: Crea un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto
 *               descripcion:
 *                 type: string
 *                 description: Descripción del producto
 *               precio:
 *                 type: number
 *                 description: Precio del producto
 *               stock:
 *                 type: number
 *                 description: Cantidad en stock del producto
 *               clasificacion:
 *                 type: string
 *                 description: ID de la categoría a la que pertenece el producto
 * 
 *     responses:
 *       '201':
 *         description: Metodo de pago creado exitosamente
 *       '400':
 *         description: Error en la solicitud. Verifica los datos enviados.
 *       '500':
 *         description: Error interno del servidor. No se pudo crear el metodo de pago.
 */
router.post("/prod", (req, res) => {
    const newProd = prodSchema(req.body);
    newProd
        .save()
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Obtener todos los productos!!
/**
 * @swagger
 * /api/prod:
 *   get:
 *     tags:
 *       - Productos
 *     summary: Obtiene todos las productos almacenadas
 *     responses:
 *       '200':
 *         description: Respuesta exitosa!!!
 *       '500':
 *         description: Error interno del servidor!!!
 */
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

// actualizar productos por id!!
/**
 * @swagger
 * /api/prod/{id}:
 *   put:
 *     summary: Actualiza una producto por su ID
 *     tags:
 *       - Productos
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
 *               nombre:
 *                 type: string
 *                 description: Nombre del producto
 *               descripcion:
 *                 type: string
 *                 description: Descripción del producto
 *               precio:
 *                 type: number
 *                 description: Precio del producto
 *               stock:
 *                 type: number
 *                 description: Cantidad en stock del producto
 *               clasificacion:
 *                 type: string
 *                 description: ID de la categoría a la que pertenece el producto
 *     responses:
 *       '200':
 *         description: Categoría actualizada exitosamente
 *       '404':
 *         description: Categoría no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.put("/prod/:id", (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, clasificacion } = req.body;
    prodSchema
        .updateOne({_id: id}, { $set: {nombre, descripcion, precio, stock, clasificacion} })
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// Eliminar productos por id!!
/**
 * @swagger
 * /api/prod/{id}:
 *   delete:
 *     summary: Elimina un producto por su ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del producto a eliminar
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Producto eliminada exitosamente
 *       '404':
 *         description: Producto no encontrada
 *       '500':
 *         description: Error interno del servidor
 */
router.delete("/prod/:id", (req, res) => {
    const { id } = req.params;
    prodSchema
        .deleteOne({_id: id})
        .then((data) => res.json(data))
        .catch((error) => res.json({message: error}));
});

// calcular el inventario de cuantos productos hay y cuantos vendidos
/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Obtiene el inventario de productos
 *     tags:
 *       - Inventario
 *     responses:
 *       '200':
 *         description: Inventario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   producto:
 *                     type: string
 *                     description: Nombre del producto
 *                   stockActual:
 *                     type: number
 *                     description: Stock actual del producto
 *                   vendido:
 *                     type: number
 *                     description: Cantidad total vendida del producto
 *       '500':
 *         description: Error interno del servidor
 */
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