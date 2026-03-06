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

// Routes (Uncomment as you add controllers)
// app.use('/api/posts', require('./routes/postRoutes'));
// app.use('/api/jobs', require('./routes/jobRoutes'));

app.get('/health', (req, res) => res.send('Content Service is running'));

// Setup Service Connections
const startServer = async () => {
  try {
    // Database connection
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Content Service: Connected to MongoDB Database');

    // Message Broker connection
    await connectRabbitMQ();

    // Start Express listener
    const port = process.env.PORT || 3002;
    app.listen(port, () => {
      console.log(`Content Service is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start Content Service:', error);
    process.exit(1);
  }
};

startServer();
