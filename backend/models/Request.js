const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Please specify the quantity requested'],
    min: [1, 'Quantity must be at least 1'],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for the request'],
    trim: true,
  },
  adminRemarks: {
    type: String,
    trim: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Request', requestSchema);
