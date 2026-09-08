const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medibridge_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      organizationName,
      registrationNumber,
      website,
    } = req.body;

    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Prepare fields
    const userData = {
      name,
      email: normalizedEmail,
      password,
      role: role || 'donor',
      phone,
      address,
    };

    // If beneficiary or NGO, add specific fields and set status to pending awaiting admin approval
    if (role === 'beneficiary' || role === 'ngo') {
      userData.organizationName = organizationName || '';
      userData.registrationNumber = registrationNumber || '';
      userData.website = website || '';
      userData.status = 'pending';
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status || 'approved',
          phone: user.phone,
          address: user.address,
          organizationName: user.organizationName,
          registrationNumber: user.registrationNumber,
          website: user.website,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const normalizedEmail = (email || '').trim().toLowerCase();

    // Check for user and include password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user && (await user.matchPassword(password))) {
      return res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          phone: user.phone,
          address: user.address,
          organizationName: user.organizationName,
          registrationNumber: user.registrationNumber,
          website: user.website,
          token: generateToken(user._id),
        },
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      return res.status(200).json({
        success: true,
        data: user,
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.phone !== undefined) {
        const trimmedPhone = String(req.body.phone).trim();
        const cleaned = trimmedPhone.replace(/[\s\-()]/g, '');
        if (trimmedPhone && (!/^\+?[0-9]+$/.test(cleaned) || !/^(?:\+[1-9]\d{0,3})?[0-9]{10}$/.test(cleaned))) {
          return res.status(400).json({
            success: false,
            message: 'Invalid phone number format. Please provide a valid 10-digit phone number (e.g. 9876543210 or +91 9876543210).',
          });
        }
        user.phone = trimmedPhone;
      }
      user.name = req.body.name || user.name;
      user.address = req.body.address || user.address;

      if (user.role === 'beneficiary') {
        user.organizationName = req.body.organizationName || user.organizationName;
        user.registrationNumber = req.body.registrationNumber || user.registrationNumber;
        user.website = req.body.website || user.website;
      }

      const updatedUser = await user.save();

      return res.status(200).json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          phone: updatedUser.phone,
          address: updatedUser.address,
          organizationName: updatedUser.organizationName,
          registrationNumber: updatedUser.registrationNumber,
          website: updatedUser.website,
        },
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
const updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new passwords' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    // Hash is handled by the Mongoose pre-save hook
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// In-memory OTP storage map: email -> { otp, expiresAt }
const otpStore = new Map();

// @desc    Send OTP to email for verification
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore.set(normalizedEmail, { otp, expiresAt });
    console.log(`[MediBridge OTP Service] Generated OTP for ${normalizedEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${normalizedEmail}`,
      demoOtp: otp,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and OTP code' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const record = otpStore.get(normalizedEmail);

    // Accept master test code 123456 or stored OTP
    if (otp.trim() === '123456' || (record && record.otp === otp.trim() && record.expiresAt > Date.now())) {
      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully.',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP. Please enter the correct code.',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
};
