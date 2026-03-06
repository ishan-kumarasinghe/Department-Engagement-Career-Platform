const amqp = require('amqplib');
const Notification = require('../models/Notification');

let channel;

async function connectRabbitMQ() {
  try {
    const amqpServer = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    console.log('Notification Service: Connected to RabbitMQ');
    
    // Ensure the exchange and queue exist, and bind them
    const exchange = 'decp_events';
    const queue = 'notification_queue';
    
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    
    // Bind the queue to all routing keys we care about
    const routingKeys = ['user.*', 'post.*', 'job.*'];
    for (const key of routingKeys) {
      await channel.bindQueue(queue, exchange, key);
    }
    
    // Start consuming messages
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        try {
          const event = JSON.parse(msg.content.toString());
          console.log(`Received event on ${msg.fields.routingKey}:`, event);
          
          // Handle the event (e.g., create a Notification in the DB)
          // await handleEvent(msg.fields.routingKey, event);

          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          // For Dead Letter Queue (DLQ), we might want to nack and not requeue:
          // channel.nack(msg, false, false);
        }
      }
    });

  } catch (ex) {
    console.error('RabbitMQ Connection Error (Notification Service):', ex);
  }
}

module.exports = {
  connectRabbitMQ
};
