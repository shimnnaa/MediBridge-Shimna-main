const express = require('express');
const router = express.Router();
const {
  requestMedicine,
  getMyRequests,
  getRequestById,
  getDonorAllocations,
  markRequestAsCollected,
} = require('../controllers/requestController');
const { protect, authorize, checkApprovedBeneficiary } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('beneficiary', 'ngo'), checkApprovedBeneficiary, requestMedicine);
router.get('/my-requests', protect, authorize('beneficiary', 'ngo'), getMyRequests);
router.get('/donor-allocations', protect, authorize('donor', 'admin'), getDonorAllocations);
router.put('/:id/collect', protect, authorize('beneficiary', 'ngo', 'donor', 'admin'), markRequestAsCollected);
router.get('/:id', protect, getRequestById);

module.exports = router;
