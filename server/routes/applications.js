const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const authenticate = require('../auth');

router.use(authenticate); // all routes require a valid JWT

// GET /api/applications
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find({ owner: req.userId }).sort({ order: 1, createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch applications', error: err.message });
  }
});

// GET /api/applications/:id
router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findById({ _id: req.params.id, owner: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch application', error: err.message });
  }
});

// POST /api/applications
router.post('/', async (req, res) => {
  try {
    const application = new Application({...req.body, owner: req.userId});
    const saved = await application.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create application', error: err.message });
  }
});

// PUT /api/applications/:id  ->  full edits and drag-and-drop status changes
router.put('/:id', async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(
      {_id: req.params.id, owner: req.userId},
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update application', error: err.message });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Application.findOneAndDelete({ _id: req.params.id, owner: req.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete application', error: err.message });
  }
});

module.exports = router;