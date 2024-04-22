const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de CAFELABS',
      version: '1.0.0',
      description: 'Documentación de la API de CAFELABS',
    },
  },
  apis: ['src/routes/*.js'], // Rutas de tus archivos de código que contienen los endpoints
};
const specs = swaggerJsdoc(options);

module.exports = specs;