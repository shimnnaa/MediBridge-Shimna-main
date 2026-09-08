const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['donor', 'beneficiary', 'ngo', 'admin'],
    default: 'donor',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active'],
    default: 'approved',
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        const cleaned = v.trim().replace(/[\s\-()]/g, '');
        if (!/^\+?[0-9]+$/.test(cleaned)) return false;
        return /^(?:\+[1-9]\d{0,3})?[0-9]{10}$/.test(cleaned);
      },
      message: 'Please provide a valid 10-digit phone number (e.g. 9876543210 or +91 9876543210)',
    },
  },
  address: {
    type: String,
    trim: true,
  },
  // NGO / Beneficiary specific fields
  organizationName: {
    type: String,
    trim: true,
  },
  registrationNumber: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', userSchema);
const { LocalUser } = require('../config/localDb');

const UserProxy = new Proxy(MongooseUser, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return LocalUser[prop] !== undefined ? LocalUser[prop] : target[prop];
  },
});

module.exports = UserProxy;
