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

    if (new Date(medicine.expiryDate) < new Date()) {
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

    const now = new Date();
    // Create request
    const request = await Request.create({
      medicine: medicineId,
      requester: req.user._id,
      quantity,
      reason,
      status: 'pending',
      requestDate: now,
      createdAt: now,
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
          select: 'name email phone address'
        }
      })
      .sort({ requestDate: -1 });

    const sanitizedRequests = requests.map((reqDoc) => {
      const item = reqDoc.toObject ? reqDoc.toObject() : { ...reqDoc };

      // Ensure requestDate has fallback to createdAt
      if (!item.requestDate && item.createdAt) {
        item.requestDate = item.createdAt;
      }

      const isApproved = item.status === 'approved' || item.status === 'collected';

      if (item.medicine && typeof item.medicine === 'object') {
        const med = item.medicine.toObject ? item.medicine.toObject() : { ...item.medicine };
        if (med.donor && typeof med.donor === 'object') {
          if (isApproved) {
            med.donorContactVisible = true;
          } else {
            med.donor = {
              _id: med.donor._id,
              name: med.donor.name || 'Anonymous Donor',
            };
            med.donorContactVisible = false;
          }
        } else {
          med.donorContactVisible = false;
        }
        item.medicine = med;
      }

      item.donorContactVisible = isApproved;
      return item;
    });

    return res.status(200).json({
      success: true,
      count: sanitizedRequests.length,
      data: sanitizedRequests,
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
          select: 'name email phone address'
        }
      });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Restrict access: Only admin, or the requester/donor of the medicine can view
    const isRequester = request.requester._id.toString() === req.user._id.toString();
    const isDonor = request.medicine && request.medicine.donor && request.medicine.donor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRequester && !isDonor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
    }

    const item = request.toObject ? request.toObject() : { ...request };
    if (!item.requestDate && item.createdAt) {
      item.requestDate = item.createdAt;
    }

    const isApproved = item.status === 'approved' || item.status === 'collected';
    const canSeeDonorDetails = isAdmin || isDonor || isApproved;

    if (item.medicine && typeof item.medicine === 'object') {
      const med = item.medicine.toObject ? item.medicine.toObject() : { ...item.medicine };
      if (med.donor && typeof med.donor === 'object') {
        if (canSeeDonorDetails) {
          med.donorContactVisible = true;
        } else {
          med.donor = {
            _id: med.donor._id,
            name: med.donor.name || 'Anonymous Donor',
          };
          med.donorContactVisible = false;
        }
      } else {
        med.donorContactVisible = false;
      }
      item.medicine = med;
    }
    item.donorContactVisible = canSeeDonorDetails;

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all approved allocations for medicines donated by current donor
// @route   GET /api/requests/donor-allocations
// @access  Private (Donor only)
const getDonorAllocations = async (req, res) => {
  try {
    // 1. Get all medicines donated by this donor
    const donorMedicines = await Medicine.find({ donor: req.user._id });
    const medicineMap = new Map();
    donorMedicines.forEach((m) => {
      medicineMap.set(String(m._id), m.toObject ? m.toObject() : { ...m });
    });

    if (medicineMap.size === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // 2. Find all approved & collected requests
    const allApprovedRequests = await Request.find({ status: { $in: ['approved', 'collected'] } })
      .populate('requester', 'name email phone address organizationName registrationNumber website role')
      .sort({ approvedAt: -1, createdAt: -1 });

    // 3. Filter requests where medicine belongs to this donor
    const donorAllocations = [];
    allApprovedRequests.forEach((reqDoc) => {
      const rObj = reqDoc.toObject ? reqDoc.toObject() : { ...reqDoc };
      const reqMedId = rObj.medicine && rObj.medicine._id ? String(rObj.medicine._id) : String(rObj.medicine);

      if (medicineMap.has(reqMedId)) {
        const medInfo = medicineMap.get(reqMedId);
        donorAllocations.push({
          _id: rObj._id,
          quantity: rObj.quantity,
          reason: rObj.reason,
          status: rObj.status,
          adminRemarks: rObj.adminRemarks || '',
          approvedAt: rObj.approvedAt || rObj.updatedAt || rObj.createdAt,
          collectedAt: rObj.collectedAt || null,
          collectionConfirmedBy: rObj.collectionConfirmedBy || null,
          collectionNotes: rObj.collectionNotes || '',
          requestDate: rObj.requestDate || rObj.createdAt,
          requester: rObj.requester,
          medicine: {
            _id: medInfo._id,
            name: medInfo.name,
            batchNumber: medInfo.batchNumber,
            manufacturer: medInfo.manufacturer,
            expiryDate: medInfo.expiryDate,
            condition: medInfo.condition,
            originalQuantity: medInfo.originalQuantity,
            remainingQuantity: medInfo.quantity,
          },
        });
      }
    });

    return res.status(200).json({
      success: true,
      count: donorAllocations.length,
      data: donorAllocations,
    });
  } catch (error) {
    console.error('Get donor allocations error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark an approved medicine request as collected
// @route   PUT /api/requests/:id/collect
// @access  Private (Requester Beneficiary, Medicine Donor, or Admin)
const markRequestAsCollected = async (req, res) => {
  try {
    const { notes } = req.body || {};
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name email phone organizationName')
      .populate({
        path: 'medicine',
        populate: {
          path: 'donor',
          select: 'name email phone address',
        },
      });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Medicine request not found' });
    }

    // Verify authorization
    const requesterId = request.requester && (request.requester._id ? String(request.requester._id) : String(request.requester));
    const medDonorId = request.medicine && request.medicine.donor && (request.medicine.donor._id ? String(request.medicine.donor._id) : String(request.medicine.donor));
    const currentUserId = String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const isRequester = requesterId === currentUserId;
    const isDonor = medDonorId === currentUserId;

    if (!isRequester && !isDonor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this medicine request as collected.',
      });
    }

    if (request.status === 'collected') {
      return res.status(400).json({
        success: false,
        message: 'This medicine request has already been marked as collected.',
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Only approved medicine requests can be marked as collected. Current status: ${request.status}`,
      });
    }

    // Locate medicine to deduct quantity from medicine inventory collection
    const medId = request.medicine && (request.medicine._id ? request.medicine._id : request.medicine);
    const medicine = await Medicine.findById(medId);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'The medicine referenced by this request was not found.',
      });
    }

    // Reduce stock in medicine collection
    const currentStock = Number(medicine.quantity) || 0;
    const requestedQty = Number(request.quantity) || 0;
    const newStock = Math.max(0, currentStock - requestedQty);

    medicine.quantity = newStock;
    if (newStock === 0) {
      medicine.status = 'claimed';
    }
    await medicine.save();

    // Identify who confirmed the collection
    let confirmedBy = 'beneficiary';
    if (isAdmin) {
      confirmedBy = 'admin';
    } else if (isDonor) {
      confirmedBy = 'donor';
    }

    const now = new Date();
    request.status = 'collected';
    request.collectedAt = now;
    request.collectedBy = req.user._id;
    request.collectionConfirmedBy = confirmedBy;
    if (notes) {
      request.collectionNotes = String(notes).trim();
    }
    request.updatedAt = now;

    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Medicine collection confirmed successfully. Stock quantity has been reduced from medicine collection.',
      data: {
        request,
        remainingMedicineStock: medicine.quantity,
        medicineStatus: medicine.status,
      },
    });
  } catch (error) {
    console.error('Mark request collected error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestMedicine,
  getMyRequests,
  getRequestById,
  getDonorAllocations,
  markRequestAsCollected,
};
