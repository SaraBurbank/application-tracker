const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role/title is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Interviewing', 'Offer', 'Rejected'],
      default: 'Applied',
      required: true,
    },
    dateApplied: {
      type: Date,
      default: Date.now,
    },
    link: {
      type: String,
      trim: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    salaryRange: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // Used to preserve manual card order within a Kanban column
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  }
);

module.exports = mongoose.model('Application', applicationSchema);