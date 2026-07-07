const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const applicationRoutes = require('./server/routes/applications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/applications', applicationRoutes);

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB then start the server
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/job-tracker';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });