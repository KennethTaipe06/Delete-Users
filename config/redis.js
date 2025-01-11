require('dotenv').config();
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redisClient.on('error', (err) => {
  console.error('Error al conectar a Redis', err);
});

module.exports = redisClient;
