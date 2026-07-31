const express = require('express');
const router = express.Router();
const {
  requestMedicine,
  getMyRequests,
  getRequestById,
} = require('../controllers/requestController');
const { protect, authorize, checkApprovedBeneficiary } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('beneficiary'), checkApprovedBeneficiary, requestMedicine);
router.get('/my-requests', protect, authorize('beneficiary'), getMyRequests);
router.get('/:id', protect, getRequestById);

module.exports = router;
