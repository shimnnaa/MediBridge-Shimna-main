const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - Verify JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medibridge_secret_key_12345');

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'User is not authorized',
      });
    }

    const userRole = req.user.role;
    // If beneficiary is authorized, allow both 'beneficiary' and 'ngo'
    const expandedRoles = [...roles];
    if (roles.includes('beneficiary') && !expandedRoles.includes('ngo')) {
      expandedRoles.push('ngo');
    }
    if (roles.includes('ngo') && !expandedRoles.includes('beneficiary')) {
      expandedRoles.push('beneficiary');
    }

    if (!expandedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Ensure beneficiary/NGO is not rejected or blocked by admin
const checkApprovedBeneficiary = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === 'beneficiary' || req.user.role === 'ngo') &&
    req.user.status === 'rejected'
  ) {
    return res.status(403).json({
      success: false,
      message: 'Your account registration was rejected or restricted by the administrator.',
    });
  }
  next();
};

module.exports = { protect, authorize, checkApprovedBeneficiary };
