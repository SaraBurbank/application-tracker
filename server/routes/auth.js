const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../auth');

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function toPublicUser(user) {
  return { id: user._id, email: user.email, name: user.name };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(400).json({ message: 'Failed to register', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    const passwordMatches = user ? await user.comparePassword(password) : false;

    if (!user || !passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to log in', error: err.message });
  }
});

// GET /api/auth/me - check if token is still valid after a page refresh
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(toPublicUser(user));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch current user', error: err.message });
  }
});

module.exports = router;