require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { connectRabbitMQ } = require('./rabbitmq/connection');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/chatRoutes'));

app.get('/health', (req, res) => res.send('Chat Service is running'));

// Setup Service Connections
const startServer = async () => {
  try {
    // Database connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Chat Service: Connected to MongoDB Database');

    // Message Broker
    await connectRabbitMQ();

    // Start Express listener
    const port = process.env.PORT || 3004;
    
    // Note: For WebSockets (e.g., socket.io), we would wrap `app` with `http.createServer`
    const server = app.listen(port, () => {
      console.log(`Chat Service is running on port ${port}`);
    });
    
    // const io = require('socket.io')(server, { cors: { origin: '*' } });
    // require('./sockets/chatSocket')(io);

  } catch (error) {
    console.error('Failed to start Chat Service:', error);
    process.exit(1);
  }
};

startServer();
