const Medicine = require('../models/Medicine');


const donateMedicine = async (req, res) => {
  try {
    const { name, manufacturer, batchNumber, expiryDate, quantity, description, condition } = req.body;

    if (!name || !manufacturer || !batchNumber || !expiryDate || !quantity) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const medicine = await Medicine.create({
      name,
      manufacturer,
      batchNumber,
      expiryDate,
      quantity,
      originalQuantity: quantity,
      donor: req.user._id,
      description,
      condition: condition || 'Sealed & Unopened',
      status: 'pending', // Requires admin verification
    });

    return res.status(201).json({
      success: true,
      message: 'Medicine donation submitted successfully. Waiting for administrator approval.',
      data: medicine,
    });
  } catch (error) {
    console.error('Donate medicine error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donor's own donations
// @route   GET /api/medicines/my-donations
// @access  Private (Donor only)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Medicine.find({ donor: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    console.error('Get my donations error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available medicines (Approved, not expired, quantity > 0)
// @route   GET /api/medicines/available
// @access  Private (Beneficiary/NGO/Admin)
const getAvailableMedicines = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Base query: approved, unexpired, quantity > 0
    let query = {
      status: 'approved',
      quantity: { $gt: 0 },
      expiryDate: { $gt: new Date() } // Filter out expired medicines
    };

    // Apply search filter if present
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const medicines = await Medicine.find(query)
      .populate('donor', 'name email phone')
      .sort({ expiryDate: 1 }); // Order by closest to expiry first (priority distribution)

    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    console.error('Get available medicines error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get medicine details
// @route   GET /api/medicines/:id
// @access  Private
const getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('donor', 'name email phone address');

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine record not found' });
    }

    return res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    console.error('Get medicine by ID error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  donateMedicine,
  getMyDonations,
  getAvailableMedicines,
  getMedicineById,
};
