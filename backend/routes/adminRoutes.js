const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllDonations,
  verifyDonation,
  getAllRequests,
  verifyRequest,
  getAllUsers,
  updateUserStatus,
  generateReport,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Secure all admin routes with auth and admin role check
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);

router.route('/donations')
  .get(getAllDonations);
router.put('/donations/:id/verify', verifyDonation);

router.route('/requests')
  .get(getAllRequests);
router.put('/requests/:id/verify', verifyRequest);

router.route('/users')
  .get(getAllUsers);
router.put('/users/:id/status', updateUserStatus);

router.get('/reports/:type', generateReport);

module.exports = router;
