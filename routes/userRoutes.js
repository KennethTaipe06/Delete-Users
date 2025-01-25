const express = require('express');
const User = require('../models/User');
const redisClient = require('../config/redis');
const router = express.Router();
const userController = require('../controllers/userController');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const kafka = require('kafka-node');
const userService = require('../services/userService');

const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_HOST });
const consumer = new Consumer(
  client,
  [{ topic: 'user.created', partition: 0 }],
  { autoCommit: true }
);

consumer.on('message', async (message) => {
  try {
    const encryptedMessage = JSON.parse(message.value);
    const decryptedMessage = userService.decryptMessage(encryptedMessage);
    console.log('Mensaje descifrado:', decryptedMessage);

    const userData = JSON.parse(decryptedMessage);
    userData._id = new mongoose.Types.ObjectId(userData._id);
    delete userData.id; // Eliminar el campo id duplicado
    const user = new User(userData);
    await user.save();
    console.log('Usuario insertado en la base de datos:', user);
  } catch (error) {
    console.error('Error al procesar el mensaje de Kafka:', error);
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Elimina un usuario por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de autenticación
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: Token no válido
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { token } = req.query;

  // Verificar si el JWT es válido
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error('JWT Error:', err);
      return res.status(401).json({ error: 'Token no válido' });
    }

    console.log('JWT decoded:', decoded);

    redisClient.get(id, async (err, reply) => {
      if (err) {
        console.error('Error Redis:', err);
        return res.status(500).json({ error: 'Error al verificar el token' });
      }
      
      console.log('Token from request:', token);
      console.log('Redis stored token:', reply);
      console.log('User ID:', id);

      if (!reply) {
        return res.status(401).json({ error: 'Token no encontrado en Redis para este usuario' });
      }

      // Comparar el token recibido con el almacenado en Redis
      if (reply !== token) {
        return res.status(401).json({ error: 'Token no válido para este usuario' });
      }

      try {
        const objectId = new mongoose.Types.ObjectId(id);
        console.log('Converted ObjectId:', objectId);

        // Verificar si el usuario existe en la base de datos
        const userExists = await User.exists({ _id: objectId });
        console.log('User exists:', userExists);

        if (!userExists) {
          console.error('Usuario no encontrado en la base de datos:', id);
          return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Eliminar el usuario
        await User.findByIdAndDelete(objectId);

        // Eliminar el token de Redis después de eliminar el usuario
        redisClient.del(id, (redisErr, response) => {
          if (redisErr) {
            console.error('Error al eliminar token de Redis:', redisErr);
            return res.status(500).json({ error: 'Usuario eliminado pero hubo un error al limpiar el token' });
          }
          console.log('Token eliminado de Redis');
          res.json({ message: 'Usuario y token eliminados correctamente' });
        });

      } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
      }
    });
  });
});

router.get('/', userController.getUsers);
router.post('/', userController.createUser);

module.exports = router;
