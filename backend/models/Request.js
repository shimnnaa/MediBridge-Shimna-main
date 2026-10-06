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
    enum: ['pending', 'approved', 'rejected', 'collected'],
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
  collectedAt: {
    type: Date,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  collectionConfirmedBy: {
    type: String,
    enum: ['beneficiary', 'donor', 'admin'],
  },
  collectionNotes: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const MongooseRequest = mongoose.model('Request', requestSchema);
const { LocalRequest } = require('../config/localDb');

const RequestProxy = new Proxy(MongooseRequest, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return LocalRequest[prop] !== undefined ? LocalRequest[prop] : target[prop];
  },
});

module.exports = RequestProxy;
