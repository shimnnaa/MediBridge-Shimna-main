const Medicine = require('../models/Medicine');
const Request = require('../models/Request');

const donateMedicine = async (req, res) => {
  try {
    const { name, manufacturer, batchNumber, expiryDate, quantity, description, condition } = req.body;

    if (!name || !manufacturer || !batchNumber || !expiryDate || quantity === undefined || quantity === null) {
      return res.status(400).json({ success: false, message: 'Please fill all required fields' });
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer greater than 0' });
    }

    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid expiry date' });
    }

    const now = new Date();
    if (expiry <= now) {
      return res.status(400).json({ success: false, message: 'Medicine must be unexpired. Expiry date must be in the future.' });
    }

    const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    if (daysRemaining < 30) {
      return res.status(400).json({ success: false, message: 'Safety policy: Medicines must have at least 30 days of shelf life remaining.' });
    }

    const medicine = await Medicine.create({
      name: name.trim(),
      manufacturer: manufacturer.trim(),
      batchNumber: batchNumber.trim(),
      expiryDate: expiry.toISOString(),
      quantity: numQuantity,
      originalQuantity: numQuantity,
      donor: req.user._id,
      description: description ? description.trim() : '',
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

// @desc    Get donor's own donations (with admin-approved beneficiary allocations)
// @route   GET /api/medicines/my-donations
// @access  Private (Donor only)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Medicine.find({ donor: req.user._id }).sort({ createdAt: -1 });

    // Find all approved requests across this donor's medicines
    const medicineIds = donations.map((d) => String(d._id));
    let approvedRequests = [];

    if (medicineIds.length > 0) {
      const allApproved = await Request.find({ status: { $in: ['approved', 'collected'] } })
        .populate('requester', 'name email phone address organizationName registrationNumber website role');

      approvedRequests = allApproved.filter((r) => {
        const reqMedId = r.medicine && r.medicine._id ? String(r.medicine._id) : String(r.medicine);
        return medicineIds.includes(reqMedId);
      });
    }

    const enhancedDonations = donations.map((medDoc) => {
      const med = medDoc.toObject ? medDoc.toObject() : { ...medDoc };
      const medIdStr = String(med._id);

      // Filter requests specifically approved or collected for this medicine
      const medAllocations = approvedRequests
        .filter((r) => {
          const reqMedId = r.medicine && r.medicine._id ? String(r.medicine._id) : String(r.medicine);
          return reqMedId === medIdStr;
        })
        .map((r) => {
          const rObj = r.toObject ? r.toObject() : { ...r };
          return {
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
            requester: rObj.requester || null,
          };
        });

      med.approvedAllocations = medAllocations;
      med.totalAllocatedQuantity = medAllocations.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      med.recipientCount = medAllocations.length;
      med.collectedAllocations = medAllocations.filter((a) => a.status === 'collected');
      med.collectedQuantity = med.collectedAllocations.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      med.collectedCount = med.collectedAllocations.length;

      return med;
    });

    return res.status(200).json({
      success: true,
      count: enhancedDonations.length,
      data: enhancedDonations,
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
      .populate('donor', 'name email phone address')
      .sort({ expiryDate: 1 }); // Order by closest to expiry first (priority distribution)

    // Check if requester has admin approval to view donor contact details
    const userRole = req.user ? req.user.role : '';
    const userStatus = req.user ? req.user.status : '';
    const isApprovedNgoOrAdmin =
      userRole === 'admin' ||
      ((userRole === 'beneficiary' || userRole === 'ngo') && (userStatus === 'approved' || userStatus === 'active'));

    const sanitizedMedicines = medicines.map((medDoc) => {
      const med = medDoc.toObject ? medDoc.toObject() : { ...medDoc };
      if (med.donor && typeof med.donor === 'object') {
        if (isApprovedNgoOrAdmin) {
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
      return med;
    });

    return res.status(200).json({
      success: true,
      count: sanitizedMedicines.length,
      data: sanitizedMedicines,
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

    const userRole = req.user ? req.user.role : '';
    const userStatus = req.user ? req.user.status : '';
    const isDonorOwner = medicine.donor && String(medicine.donor._id || medicine.donor) === String(req.user._id);
    const isApprovedNgoOrAdmin =
      userRole === 'admin' ||
      isDonorOwner ||
      ((userRole === 'beneficiary' || userRole === 'ngo') && (userStatus === 'approved' || userStatus === 'active'));

    const medObj = medicine.toObject ? medicine.toObject() : { ...medicine };
    if (medObj.donor && typeof medObj.donor === 'object') {
      if (isApprovedNgoOrAdmin) {
        medObj.donorContactVisible = true;
      } else {
        medObj.donor = {
          _id: medObj.donor._id,
          name: medObj.donor.name || 'Anonymous Donor',
        };
        medObj.donorContactVisible = false;
      }
    }

    return res.status(200).json({
      success: true,
      data: medObj,
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
