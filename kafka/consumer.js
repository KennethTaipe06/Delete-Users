const kafka = require('kafka-node');
const mongoose = require('mongoose');
const userService = require('../services/userService');
const User = require('../models/User');

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

module.exports = consumer;
