const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide the medicine name'],
    trim: true,
  },
  manufacturer: {
    type: String,
    required: [true, 'Please provide the manufacturer'],
    trim: true,
  },
  batchNumber: {
    type: String,
    required: [true, 'Please provide the batch number'],
    trim: true,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide the expiry date'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide the quantity'],
    min: [1, 'Quantity must be at least 1'],
  },
  originalQuantity: {
    type: Number,
    required: [true, 'Please provide the original quantity'],
    min: [1, 'Quantity must be at least 1'],
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'claimed'],
    default: 'pending',
  },
  verificationDetails: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  description: {
    type: String,
    trim: true,
  },
  condition: {
    type: String,
    trim: true,
    default: 'Sealed & Unopened',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Medicine', medicineSchema);
