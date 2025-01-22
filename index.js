require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const logger = require('./config/logger');

const app = express();
const port = process.env.PORT || 3003;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: process.env.API_TITLE,
      version: process.env.API_VERSION,
      description: process.env.API_DESCRIPTION
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
app.use('/users', userRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  logger.info('Conectado a MongoDB');
  app.listen(port, () => {
    logger.info(`Servidor corriendo en http://localhost:${port}`);
  });
}).catch(err => {
  logger.error('Error al conectar a MongoDB', err);
});
