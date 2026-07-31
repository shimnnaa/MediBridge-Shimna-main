const Request = require('../models/Request');
const Medicine = require('../models/Medicine');

// @desc    Request a medicine
// @route   POST /api/requests
// @access  Private (Approved Beneficiary/NGO only)
const requestMedicine = async (req, res) => {
  try {
    const { medicineId, quantity, reason } = req.body;

    if (!medicineId || !quantity || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required details (medicine ID, quantity, and reason)' });
    }

    // Find medicine and check availability
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    if (medicine.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'This medicine is not verified/available for requests' });
    }

    if (medicine.expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: 'This medicine has expired and cannot be requested' });
    }

    if (medicine.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${quantity}) exceeds available stock (${medicine.quantity})`,
      });
    }

    // Check if requester has already requested this medicine and it is pending
    const existingPendingRequest = await Request.findOne({
      medicine: medicineId,
      requester: req.user._id,
      status: 'pending',
    });

    if (existingPendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this medicine. Please wait for the admin to process it.',
      });
    }

    // Create request
    const request = await Request.create({
      medicine: medicineId,
      requester: req.user._id,
      quantity,
      reason,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Medicine request submitted successfully. Waiting for admin approval.',
      data: request,
    });
  } catch (error) {
    console.error('Request medicine error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get beneficiary's own requests
// @route   GET /api/requests/my-requests
// @access  Private (Beneficiary/NGO only)
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate({
        path: 'medicine',
        select: 'name manufacturer batchNumber expiryDate condition donor',
        populate: {
          path: 'donor',
          select: 'name email phone'
        }
      })
      .sort({ requestDate: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get request details
// @route   GET /api/requests/:id
// @access  Private
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name email phone address organizationName registrationNumber')
      .populate({
        path: 'medicine',
        populate: {
          path: 'donor',
          select: 'name email phone'
        }
      });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Restrict access: Only admin, or the requester/donor of the medicine can view
    const isRequester = request.requester._id.toString() === req.user._id.toString();
    const isDonor = request.medicine.donor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRequester && !isDonor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestMedicine,
  getMyRequests,
  getRequestById,
};
