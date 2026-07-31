const express = require('express');
const router = express.Router();
const {
  donateMedicine,
  getMyDonations,
  getAvailableMedicines,
  getMedicineById,
} = require('../controllers/medicineController');
const { protect, authorize, checkApprovedBeneficiary } = require('../middleware/authMiddleware');

router.post('/donate', protect, authorize('donor'), donateMedicine);
router.get('/my-donations', protect, authorize('donor'), getMyDonations);
router.get('/available', protect, authorize('beneficiary', 'admin'), checkApprovedBeneficiary, getAvailableMedicines);
router.get('/:id', protect, getMedicineById);

module.exports = router;
