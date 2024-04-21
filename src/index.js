const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const producRouter = require("./routes/productos");
const catgRouter = require("./routes/categorias");
const metPagRouter = require("./routes/metodo_pago");
const ventaRouter = require("./routes/ventas");


const app = express();
const PORT = process.env.PORT || 3000;


//librerias
app.use(express.json());
app.use("/api", producRouter);
app.use("/cat", catgRouter);
app.use("/met", metPagRouter);
app.use("/vent", ventaRouter);

// Base de datos
mongoose
    .connect(process.env.MONGODB_ATLAS)
    .then(() => console.log("Conexion Exitosa!!"))
    .catch((error) => console.log(error));

//Routas
app.get("/", (req, res) => {
    res.send("Prueba de Backend!!!")
});


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
