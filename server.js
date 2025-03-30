const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pothole-detector', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Pothole Schema
const potholeSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  intensity: Number,
  timestamp: { type: Date, default: Date.now }
});

const Pothole = mongoose.model('Pothole', potholeSchema);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('pothole-detected', async (data) => {
    try {
      const pothole = new Pothole({
        latitude: data.latitude,
        longitude: data.longitude,
        intensity: data.intensity
      });
      await pothole.save();
      io.emit('new-pothole', pothole);
    } catch (error) {
      console.error('Error saving pothole:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API Routes
app.get('/api/potholes', async (req, res) => {
  try {
    const potholes = await Pothole.find().sort({ timestamp: -1 });
    res.json(potholes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('\nAvailable network interfaces:');
  const interfaces = os.networkInterfaces();
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`\n${interfaceName}:`);
        console.log(`http://${interface.address}:${PORT}`);
      }
    });
  });
}); 