const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Request = require('../models/Request');

// @desc    Get Admin Dashboard Stats Overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Count users
    const totalUsers = await User.countDocuments();
    const donorCount = await User.countDocuments({ role: 'donor' });
    const beneficiaryCount = (await User.countDocuments({ role: 'beneficiary' })) + (await User.countDocuments({ role: 'ngo' }));
    const pendingBeneficiaries = (await User.countDocuments({ role: 'beneficiary', status: 'pending' })) + (await User.countDocuments({ role: 'ngo', status: 'pending' }));

    // Count medicines
    const totalDonations = await Medicine.countDocuments();
    const pendingDonations = await Medicine.countDocuments({ status: 'pending' });
    const approvedDonations = await Medicine.countDocuments({ status: 'approved' });
    const rejectedDonations = await Medicine.countDocuments({ status: 'rejected' });
    const claimedDonations = await Medicine.countDocuments({ status: 'claimed' });

    // Count requests
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: 'pending' });
    const approvedRequests = await Request.countDocuments({ status: 'approved' });
    const collectedRequests = await Request.countDocuments({ status: 'collected' });
    const rejectedRequests = await Request.countDocuments({ status: 'rejected' });

    return res.status(200).json({
      success: true,
      data: {
        users: { totalUsers, donorCount, beneficiaryCount, pendingBeneficiaries },
        donations: { totalDonations, pendingDonations, approvedDonations, rejectedDonations, claimedDonations },
        requests: { totalRequests, pendingRequests, approvedRequests, collectedRequests, rejectedRequests },
      },
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all medicine donations (with status filters)
// @route   GET /api/admin/donations
// @access  Private (Admin only)
const getAllDonations = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',').map((s) => s.trim()) };
      } else {
        query.status = status;
      }
    }

    const donations = await Medicine.find(query)
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    console.error('Admin get all donations error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get successful medicine donations history (approved/claimed with allocation history)
// @route   GET /api/admin/donations/history
// @access  Private (Admin only)
const getDonationHistory = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    } else {
      query.status = { $in: ['approved', 'claimed'] };
    }

    const donations = await Medicine.find(query)
      .populate('donor', 'name email phone address')
      .sort({ createdAt: -1 });

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

      const allocations = approvedRequests
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

      const rawClaimed = allocations.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const origQty = med.originalQuantity !== undefined && med.originalQuantity > 0 ? med.originalQuantity : (med.quantity || 0);
      const totalClaimedQuantity = Math.min(origQty, rawClaimed);
      const remQty = med.status === 'claimed' ? 0 : Math.max(0, origQty - totalClaimedQuantity);

      return {
        ...med,
        originalQuantity: origQty,
        quantity: remQty,
        allocations,
        totalClaimedQuantity,
        claimCount: allocations.length,
      };
    });

    return res.status(200).json({
      success: true,
      count: enhancedDonations.length,
      data: enhancedDonations,
    });
  } catch (error) {
    console.error('Admin get donation history error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify (Approve/Reject) a medicine donation
// @route   PUT /api/admin/donations/:id/verify
// @access  Private (Admin only)
const verifyDonation = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please specify status as approved or rejected' });
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine donation not found' });
    }

    medicine.status = status;
    medicine.verificationDetails = {
      verifiedBy: req.user._id,
      verifiedAt: new Date(),
      remarks: remarks || '',
    };

    await medicine.save();

    return res.status(200).json({
      success: true,
      message: `Medicine donation has been ${status} successfully.`,
      data: medicine,
    });
  } catch (error) {
    console.error('Verify donation error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all medicine requests (with status filters)
// @route   GET /api/admin/requests
// @access  Private (Admin only)
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('requester', 'name email phone address organizationName registrationNumber')
      .populate({
        path: 'medicine',
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
    console.error('Admin get all requests error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject a medicine request
// @route   PUT /api/admin/requests/:id/verify
// @access  Private (Admin only)
const verifyRequest = async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please specify status as approved or rejected' });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${request.status}` });
    }

    const medId = request.medicine && request.medicine._id ? request.medicine._id : request.medicine;
    const medicine = await Medicine.findById(medId);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'The medicine referenced by this request was not found or has been deleted.',
      });
    }

    let autoRejectedCount = 0;

    if (status === 'approved') {
      // Double check medicine stock and validity
      if (medicine.status !== 'approved' && medicine.status !== 'claimed') {
        return res.status(400).json({ success: false, message: 'Medicine is not in approved/available status' });
      }

      if (new Date(medicine.expiryDate) < new Date()) {
        return res.status(400).json({ success: false, message: 'Medicine has expired' });
      }

      if (medicine.quantity < request.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve request. Requested quantity (${request.quantity}) exceeds available stock (${medicine.quantity})`,
        });
      }

      request.status = 'approved';
      request.approvedAt = new Date();

      // Deduct stock from medicine inventory
      const currentStock = Number(medicine.quantity) || 0;
      const approvedQty = Number(request.quantity) || 0;
      const newStock = Math.max(0, currentStock - approvedQty);

      medicine.quantity = newStock;
      if (newStock === 0) {
        medicine.status = 'claimed';
      }
      await medicine.save();

      // Automatically reject remaining pending requests that exceed newly available stock
      const pendingRequestsForMed = await Request.find({ status: 'pending' });

      for (const otherReq of pendingRequestsForMed) {
        const otherMedId = otherReq.medicine && otherReq.medicine._id ? String(otherReq.medicine._id) : String(otherReq.medicine);
        if (otherMedId === String(medId) && String(otherReq._id) !== String(request._id)) {
          const reqQty = Number(otherReq.quantity) || 0;
          if (newStock === 0 || reqQty > newStock) {
            otherReq.status = 'rejected';
            otherReq.adminRemarks = newStock === 0
              ? 'Auto-rejected by system: Stock fully allocated and claimed.'
              : `Auto-rejected by system: Requested quantity (${reqQty}) exceeds remaining stock (${newStock}).`;
            otherReq.updatedAt = new Date();
            await otherReq.save();
            autoRejectedCount++;
          }
        }
      }
    } else {
      request.status = 'rejected';
    }

    request.adminRemarks = adminRemarks ? adminRemarks.trim() : '';
    request.updatedAt = new Date();
    await request.save();

    let successMsg = `Request has been ${status} successfully.`;
    if (autoRejectedCount > 0) {
      successMsg += ` (${autoRejectedCount} other request(s) exceeding remaining stock were automatically rejected).`;
    }

    return res.status(200).json({
      success: true,
      message: successMsg,
      data: request,
    });
  } catch (error) {
    console.error('Verify request error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users in the system (with role filters)
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role === 'beneficiary' || role === 'ngo') {
      query = { $or: [{ role: 'beneficiary' }, { role: 'ngo' }] };
    } else if (role) {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Admin get all users error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user status (specifically verify NGO/Beneficiary accounts)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['approved', 'rejected', 'active'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User status has been updated to ${status} successfully.`,
      data: user,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to validate phone number format (standard 10-digit number with optional +country code)
const validatePhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  if (!/^\+?[0-9]+$/.test(cleaned)) return false;
  return /^(?:\+[1-9]\d{0,3})?[0-9]{10}$/.test(cleaned);
};

// @desc    Validate a phone number directly
// @route   POST /api/admin/validate-phone
// @access  Private (Admin only)
const validateAdminPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Phone number is required.',
      });
    }

    const isValid = validatePhoneNumber(phone);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid phone number format. Please provide a valid 10-digit phone number (e.g. 9876543210 or +91 9876543210).',
      });
    }

    const cleaned = String(phone).trim().replace(/[\s\-()]/g, '');
    return res.status(200).json({
      success: true,
      valid: true,
      message: 'Phone number is valid.',
      data: {
        phone: String(phone).trim(),
        formattedPhone: cleaned,
      },
    });
  } catch (error) {
    console.error('Validate phone error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin only)
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    return res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update admin profile (with phone validation)
// @route   PUT /api/admin/profile
// @access  Private (Admin only)
const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();
      if (!trimmedPhone) {
        return res.status(400).json({
          success: false,
          message: 'Phone number cannot be empty.',
        });
      }
      if (!validatePhoneNumber(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Please provide a valid 10-digit phone number (e.g. 9876543210 or +91 9876543210).',
        });
      }
      admin.phone = trimmedPhone;
    }

    if (name !== undefined) admin.name = String(name).trim();
    if (address !== undefined) admin.address = String(address).trim();

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Admin profile and phone number updated successfully.',
      data: admin,
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details (with phone validation)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUserDetails = async (req, res) => {
  try {
    const { name, phone, address, organizationName, registrationNumber, website } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (phone !== undefined) {
      const trimmedPhone = String(phone).trim();
      if (trimmedPhone && !validatePhoneNumber(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format. Please provide a valid 10-digit phone number (e.g. 9876543210 or +91 9876543210).',
        });
      }
      user.phone = trimmedPhone;
    }

    if (name !== undefined) user.name = name.trim();
    if (address !== undefined) user.address = address.trim();
    if (organizationName !== undefined) user.organizationName = organizationName.trim();
    if (registrationNumber !== undefined) user.registrationNumber = registrationNumber.trim();
    if (website !== undefined) user.website = website.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User details updated successfully.',
      data: user,
    });
  } catch (error) {
    console.error('Update user details error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to escape and sanitize CSV cells
const escapeCSV = (value) => {
  if (value === null || value === undefined) return '""';
  const clean = String(value).replace(/\r?\n|\r/g, ' ').replace(/"/g, '""');
  return `"${clean}"`;
};

// @desc    Generate report data (CSV)
// @route   GET /api/admin/reports/:type
// @access  Private (Admin only)
const generateReport = async (req, res) => {
  try {
    const { type } = req.params;

    if (type === 'donations') {
      const donations = await Medicine.find().populate('donor', 'name email phone');
      
      // Build CSV header & rows
      let csvContent = 'ID,Medicine Name,Manufacturer,Batch Number,Expiry Date,Original Qty,Remaining Qty,Status,Donor Name,Donor Email,Created Date\n';
      
      donations.forEach((med) => {
        const id = med._id;
        const name = escapeCSV(med.name);
        const mfg = escapeCSV(med.manufacturer);
        const batch = escapeCSV(med.batchNumber);
        const expiry = med.expiryDate ? new Date(med.expiryDate).toISOString().split('T')[0] : 'N/A';
        const origQty = med.originalQuantity;
        const remQty = med.quantity;
        const status = med.status;
        const donorName = med.donor ? escapeCSV(med.donor.name) : '"N/A"';
        const donorEmail = med.donor ? med.donor.email : 'N/A';
        const created = med.createdAt ? new Date(med.createdAt).toISOString().split('T')[0] : 'N/A';

        csvContent += `${id},${name},${mfg},${batch},${expiry},${origQty},${remQty},${status},${donorName},${donorEmail},${created}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=donations_report.csv');
      return res.status(200).send(csvContent);

    } else if (type === 'requests') {
      const requests = await Request.find()
        .populate('requester', 'name email organizationName')
        .populate('medicine', 'name batchNumber');

      let csvContent = 'ID,Medicine Name,Batch Number,Requester Name,Requester Email,Organization,Requested Qty,Status,Reason,Admin Remarks,Request Date\n';

      requests.forEach((reqItem) => {
        const id = reqItem._id;
        const medName = reqItem.medicine ? escapeCSV(reqItem.medicine.name) : '"Deleted Medicine"';
        const batch = reqItem.medicine ? escapeCSV(reqItem.medicine.batchNumber) : '"N/A"';
        const reqName = reqItem.requester ? escapeCSV(reqItem.requester.name) : '"N/A"';
        const reqEmail = reqItem.requester ? reqItem.requester.email : 'N/A';
        const org = reqItem.requester && reqItem.requester.organizationName ? escapeCSV(reqItem.requester.organizationName) : '"N/A"';
        const qty = reqItem.quantity;
        const status = reqItem.status;
        const reason = escapeCSV(reqItem.reason);
        const remarks = escapeCSV(reqItem.adminRemarks || '');
        const created = reqItem.requestDate ? new Date(reqItem.requestDate).toISOString().split('T')[0] : 'N/A';

        csvContent += `${id},${medName},${batch},${reqName},${reqEmail},${org},${qty},${status},${reason},${remarks},${created}\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=requests_report.csv');
      return res.status(200).send(csvContent);

    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type requested. Use donations or requests.' });
    }
  } catch (error) {
    console.error('Generate report error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllDonations,
  getDonationHistory,
  verifyDonation,
  getAllRequests,
  verifyRequest,
  getAllUsers,
  updateUserStatus,
  updateUserDetails,
  validatePhoneNumber,
  validateAdminPhone,
  getAdminProfile,
  updateAdminProfile,
  generateReport,
};
