const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Order = require('../../models/Order');
const AdminAction = require('../../models/AdminAction');
// const roleCheck = require('../../middlewares/roleCheck');

// List customers with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      flagged,
      location,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minOrders,
      maxOrders
    } = req.query;

    const query = { role: 'buyer' };
    if (status) query.accountStatus = status;
    if (flagged !== undefined) query.flagged = flagged === 'true';
    if (location) query.location = location;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (minOrders || maxOrders) {
      query['stats.ordersPlaced'] = {};
      if (minOrders) query['stats.ordersPlaced'].$gte = parseInt(minOrders);
      if (maxOrders) query['stats.ordersPlaced'].$lte = parseInt(maxOrders);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const customers = await User.paginate ? await User.paginate(query, options) : await User.find(query).sort(options.sort).limit(options.limit).skip((options.page-1)*options.limit);

    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customers', error: error.message });
  }
});

// Get customer details by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password -twoFactorSecret -backupCodes');
    if (!customer || customer.role !== 'buyer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    // Get order history
    const orders = await Order.find({ buyer: req.params.id }).select('orderNumber orderStatus total createdAt').sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: { customer, orders, feedbacks: customer.feedbacks } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customer details', error: error.message });
  }
});

// Flag or unflag a customer
router.post('/:id/flag', async (req, res) => {
  try {
    const { reason, flagged } = req.body;
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'buyer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    customer.flagged = flagged;
    customer.flagReason = flagged ? reason : undefined;
    if (flagged) {
      customer.flagHistory.push({ reason, flaggedBy: req.user ? req.user.id : null });
    }
    await customer.save();
    if (AdminAction && req.user) {
      await AdminAction.logAction({
        admin: req.user.id,
        action: flagged ? 'customer_suspension' : 'user_verification',
        targetType: 'user',
        targetId: customer._id,
        targetModel: 'User',
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    res.json({ success: true, message: flagged ? 'Customer flagged' : 'Customer unflagged', data: { flagged: customer.flagged, flagReason: customer.flagReason } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error flagging customer', error: error.message });
  }
});

// Suspend or unsuspend a customer
router.post('/:id/suspend', async (req, res) => {
  try {
    const { reason, suspend } = req.body;
    const customer = await User.findById(req.params.id);
    if (!customer || customer.role !== 'buyer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    customer.accountStatus = suspend ? 'suspended' : 'active';
    await customer.save();
    if (AdminAction && req.user) {
      await AdminAction.logAction({
        admin: req.user.id,
        action: suspend ? 'customer_suspension' : 'user_verification',
        targetType: 'user',
        targetId: customer._id,
        targetModel: 'User',
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    res.json({ success: true, message: suspend ? 'Customer suspended' : 'Customer unsuspended', data: { accountStatus: customer.accountStatus } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error suspending customer', error: error.message });
  }
});

// Segment customers by location or order frequency
router.get('/stats/segments', async (req, res) => {
  try {
    const segments = await User.aggregate([
      { $match: { role: 'buyer' } },
      { $group: {
        _id: { location: '$location' },
        totalCustomers: { $sum: 1 },
        avgOrders: { $avg: '$stats.ordersPlaced' },
        flagged: { $sum: { $cond: ['$flagged', 1, 0] } }
      } },
      { $sort: { totalCustomers: -1 } }
    ]);
    res.json({ success: true, data: segments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching customer segments', error: error.message });
  }
});

module.exports = router; 