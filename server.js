const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const applicationRoutes = require('./server/routes/applications');
const authRoutes = require('./server/routes/auth');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/applications', applicationRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the built Angular app
const angularDistPath = path.join(__dirname, 'dist/application-tracker/browser');
app.use(express.static(angularDistPath));

// Send index.html for any non-API route (Angular client-side routing)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });