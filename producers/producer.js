const kafka = require('kafka-node');

const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_HOST });
const producer = new Producer(client);

producer.on('ready', () => {
  console.log('Productor de Kafka listo');
});

producer.on('error', (err) => {
  console.error('Error en el productor de Kafka:', err);
});

module.exports = producer;
