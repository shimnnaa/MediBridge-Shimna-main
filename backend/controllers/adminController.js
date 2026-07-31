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
    const beneficiaryCount = await User.countDocuments({ role: 'beneficiary' });
    const pendingBeneficiaries = await User.countDocuments({ role: 'beneficiary', status: 'pending' });

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
    const rejectedRequests = await Request.countDocuments({ status: 'rejected' });

    return res.status(200).json({
      success: true,
      data: {
        users: { totalUsers, donorCount, beneficiaryCount, pendingBeneficiaries },
        donations: { totalDonations, pendingDonations, approvedDonations, rejectedDonations, claimedDonations },
        requests: { totalRequests, pendingRequests, approvedRequests, rejectedRequests },
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
      query.status = status;
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

    const request = await Request.findById(req.params.id).populate('medicine');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `This request has already been ${request.status}` });
    }

    const medicine = request.medicine;

    if (status === 'approved') {
      // Double check medicine stock and validity
      if (medicine.status !== 'approved' && medicine.status !== 'claimed') {
        return res.status(400).json({ success: false, message: 'Medicine is not in approved/available status' });
      }

      if (medicine.expiryDate < new Date()) {
        return res.status(400).json({ success: false, message: 'Medicine has expired' });
      }

      if (medicine.quantity < request.quantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve request. Requested quantity (${request.quantity}) exceeds available stock (${medicine.quantity})`,
        });
      }

      // Deduct quantity
      medicine.quantity -= request.quantity;
      if (medicine.quantity === 0) {
        medicine.status = 'claimed';
      }
      await medicine.save();

      request.status = 'approved';
      request.approvedAt = new Date();
    } else {
      request.status = 'rejected';
    }

    request.adminRemarks = adminRemarks || '';
    request.updatedAt = new Date();
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Request has been ${status} successfully.`,
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
    if (role) {
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
        const name = `"${med.name.replace(/"/g, '""')}"`;
        const mfg = `"${med.manufacturer.replace(/"/g, '""')}"`;
        const batch = `"${med.batchNumber.replace(/"/g, '""')}"`;
        const expiry = med.expiryDate.toISOString().split('T')[0];
        const origQty = med.originalQuantity;
        const remQty = med.quantity;
        const status = med.status;
        const donorName = med.donor ? `"${med.donor.name.replace(/"/g, '""')}"` : 'N/A';
        const donorEmail = med.donor ? med.donor.email : 'N/A';
        const created = med.createdAt.toISOString().split('T')[0];

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
        const medName = reqItem.medicine ? `"${reqItem.medicine.name.replace(/"/g, '""')}"` : 'Deleted Medicine';
        const batch = reqItem.medicine ? `"${reqItem.medicine.batchNumber.replace(/"/g, '""')}"` : 'N/A';
        const reqName = reqItem.requester ? `"${reqItem.requester.name.replace(/"/g, '""')}"` : 'N/A';
        const reqEmail = reqItem.requester ? reqItem.requester.email : 'N/A';
        const org = reqItem.requester && reqItem.requester.organizationName ? `"${reqItem.requester.organizationName.replace(/"/g, '""')}"` : 'N/A';
        const qty = reqItem.quantity;
        const status = reqItem.status;
        const reason = `"${reqItem.reason.replace(/"/g, '""')}"`;
        const remarks = reqItem.adminRemarks ? `"${reqItem.adminRemarks.replace(/"/g, '""')}"` : '';
        const created = reqItem.requestDate.toISOString().split('T')[0];

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
  verifyDonation,
  getAllRequests,
  verifyRequest,
  getAllUsers,
  updateUserStatus,
  generateReport,
};
