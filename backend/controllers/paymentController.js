const PaymentMethod = require('../models/PaymentMethod');
const Transaction = require('../models/Transaction');
const { validatePaymentMethod, validatePaymentMethodUpdate } = require('../validators/paymentValidator');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');

// Initialize Razorpay with test credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_rfZeI7lhyLf0bh',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'oijVr3PDz4kRenw0oXfeTbzK'
});

// Get all payment methods for a user
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find({
      userId: req.user.id,
      isActive: true
    }).sort({ isDefault: -1, createdAt: -1 });

    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Failed to fetch payment methods' });
  }
};

// Add a new payment method
const addPaymentMethod = async (req, res) => {
  try {
    console.log('Payment method data received:', req.body);
    const { error } = validatePaymentMethod(req.body);
    if (error) {
      console.log('Validation error:', error.details[0]);
      return res.status(400).json({ message: error.details[0].message });
    }

    const { type, name, number, expiryDate, cvv, upiId, walletType, phone } = req.body;

    // Create payment method data
    const paymentMethodData = {
      userId: req.user.id,
      type,
      name
    };

    // Handle different payment types
    if (type === 'card') {
      if (!number || !expiryDate || !cvv) {
        return res.status(400).json({ message: 'Card number, expiry date, and CVV are required' });
      }
      
      // Mask card number for security
      const maskedNumber = '•••• •••• •••• ' + number.slice(-4);
      paymentMethodData.maskedNumber = maskedNumber;
      paymentMethodData.expiryDate = expiryDate;
      
      // In a real app, you would encrypt and store the card details securely
      // For now, we'll just store the masked version
    } else if (type === 'upi') {
      if (!upiId) {
        return res.status(400).json({ message: 'UPI ID is required' });
      }
      paymentMethodData.upiId = upiId;
    } else if (type === 'wallet') {
      if (!walletType || !phone) {
        return res.status(400).json({ message: 'Wallet type and phone number are required' });
      }
      paymentMethodData.walletType = walletType;
      paymentMethodData.phone = phone;
    }

    // Set as default if it's the first payment method
    const existingMethods = await PaymentMethod.countDocuments({
      userId: req.user.id,
      isActive: true
    });
    
    if (existingMethods === 0) {
      paymentMethodData.isDefault = true;
    }

    const paymentMethod = new PaymentMethod(paymentMethodData);
    await paymentMethod.save();

    res.status(201).json({
      message: 'Payment method added successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ message: 'Failed to add payment method' });
  }
};

// Update a payment method
const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating payment method:', id, 'with data:', req.body);
    
    const { error } = validatePaymentMethodUpdate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0]);
      return res.status(400).json({ message: error.details[0].message });
    }

    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    const { type, name, number, expiryDate, cvv, upiId, walletType, phone } = req.body;

    // Update basic fields
    paymentMethod.type = type;
    paymentMethod.name = name;

    // Handle different payment types
    if (type === 'card') {
      if (number) {
        const maskedNumber = '•••• •••• •••• ' + number.slice(-4);
        paymentMethod.maskedNumber = maskedNumber;
      }
      if (expiryDate) {
        paymentMethod.expiryDate = expiryDate;
      }
    } else if (type === 'upi') {
      if (upiId) {
        paymentMethod.upiId = upiId;
      }
    } else if (type === 'wallet') {
      if (walletType) {
        paymentMethod.walletType = walletType;
      }
      if (phone) {
        paymentMethod.phone = phone;
      }
    }

    await paymentMethod.save();
    console.log('Payment method updated successfully:', paymentMethod._id);

    res.json({
      message: 'Payment method updated successfully',
      paymentMethod
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ message: 'Failed to update payment method' });
  }
};

// Delete a payment method
const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Soft delete
    paymentMethod.isActive = false;
    await paymentMethod.save();

    // If this was the default method, set another one as default
    if (paymentMethod.isDefault) {
      const nextDefault = await PaymentMethod.findOne({
        userId: req.user.id,
        isActive: true,
        _id: { $ne: id }
      });

      if (nextDefault) {
        nextDefault.isDefault = true;
        await nextDefault.save();
      }
    }

    res.json({ message: 'Payment method removed successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ message: 'Failed to remove payment method' });
  }
};

// Set default payment method
const setDefaultPaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findOne({
      _id: id,
      userId: req.user.id,
      isActive: true
    });

    if (!paymentMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }

    // Remove default from all other payment methods
    await PaymentMethod.updateMany(
      { userId: req.user.id, isActive: true },
      { isDefault: false }
    );

    // Set this one as default
    paymentMethod.isDefault = true;
    await paymentMethod.save();

    res.json({ message: 'Default payment method updated successfully' });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    res.status(500).json({ message: 'Failed to set default payment method' });
  }
};

// Get transactions for a user
const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let transactions = await Transaction.find({
      userId: req.user.id
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Transaction.countDocuments({ userId: req.user.id });

    // If no transactions exist, create some sample data for demonstration
    if (transactions.length === 0 && page === 1) {
      await createSampleTransactions(req.user.id, req.user.role);
      transactions = await Transaction.find({
        userId: req.user.id
      })
      .sort({ createdAt: -1 })
      .limit(limit);
    }

    res.json({
      transactions,
      total: transactions.length > 0 ? total : transactions.length,
      page,
      limit,
      totalPages: Math.ceil((transactions.length > 0 ? total : transactions.length) / limit)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
};

// Create sample transactions for demonstration
const createSampleTransactions = async (userId, userRole) => {
  const sampleTransactions = [];
  const now = new Date();

  if (userRole === 'buyer') {
    // Sample buyer transactions
    sampleTransactions.push(
      new Transaction({
        userId,
        orderId: 'FTB-2024-001',
        type: 'order',
        amount: 450,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'VISA •••• 1234',
        description: 'Fresh Vegetables from Organic Farm',
        farmName: 'Organic Farm',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }),
      new Transaction({
        userId,
        orderId: 'FTB-2024-002',
        type: 'order',
        amount: 320,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'UPI • user@upi',
        description: 'Organic Fruits from Green Valley Farm',
        farmName: 'Green Valley Farm',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }),
      new Transaction({
        userId,
        type: 'subscription',
        amount: 299,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'VISA •••• 1234',
        description: 'Premium Subscription - Monthly Plan',
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) // 2 weeks ago
      }),
      new Transaction({
        userId,
        orderId: 'FTB-2024-003',
        type: 'refund',
        amount: 280,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'Google Pay • 9876543210',
        description: 'Refund for Spices & Herbs Order',
        farmName: 'Spice Garden',
        createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000) // 3 weeks ago
      })
    );
  } else if (userRole === 'farmer') {
    // Sample farmer transactions
    sampleTransactions.push(
      new Transaction({
        userId,
        orderId: 'FTB-2024-001',
        type: 'order',
        amount: 405,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'Platform Payment',
        description: 'Fresh Vegetables Order',
        buyerName: 'John Doe',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }),
      new Transaction({
        userId,
        orderId: 'FTB-2024-002',
        type: 'order',
        amount: 288,
        currency: 'INR',
        status: 'pending',
        paymentMethod: 'Platform Payment',
        description: 'Organic Fruits Order',
        buyerName: 'Jane Smith',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      }),
      new Transaction({
        userId,
        type: 'commission',
        amount: 45,
        currency: 'INR',
        status: 'completed',
        paymentMethod: 'Platform Fee',
        description: 'Platform Commission - Monthly',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      })
    );
  }

  await Transaction.insertMany(sampleTransactions);
};

// Get a specific transaction
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Failed to fetch transaction' });
  }
};

// Create payment order
const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId, description } = req.body;
    
    console.log('Creating payment order:', { amount, currency, orderId, description });
    console.log('User ID:', req.user.id);
    
    if (!amount || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount and order ID are required' 
      });
    }

    // Verify the order exists and belongs to the user
    const order = await Order.findById(orderId).populate('buyer');
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    console.log('Order found:', {
      orderId: order._id,
      buyerId: order.buyer._id,
      currentUserId: req.user.id
    });

    // Convert both IDs to strings for comparison
    const orderBuyerId = order.buyer._id.toString();
    const currentUserId = req.user.id.toString();

    if (orderBuyerId !== currentUserId) {
      console.log('Authorization failed:', {
        orderBuyerId,
        currentUserId,
        orderId
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to pay for this order' 
      });
    }

    console.log('Authorization successful, creating Razorpay order...');

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        description: description || 'Farm to Table Bharat Order'
      }
    });

    console.log('Razorpay order created:', razorpayOrder.id);

    // Update order with payment details
    await Order.findByIdAndUpdate(orderId, {
      'payment.razorpayOrderId': razorpayOrder.id,
      'payment.status': 'pending',
      'payment.amount': amount,
      'payment.currency': currency
    });

    res.json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_rfZeI7lhyLf0bh'
      }
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing payment verification parameters' 
      });
    }

    // Verify the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'oijVr3PDz4kRenw0oXfeTbzK')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

    // Update order with payment success
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        'payment.status': 'completed',
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.completedAt': new Date(),
        orderStatus: 'confirmed'
      },
      { new: true }
    ).populate('buyer items.product items.farmer');

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        order: updatedOrder,
        paymentId: razorpay_payment_id
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment',
      error: error.message 
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).select('payment status');
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      data: {
        paymentStatus: order.payment?.status || 'pending',
        orderStatus: order.status,
        amount: order.payment?.amount,
        currency: order.payment?.currency
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment status',
      error: error.message 
    });
  }
};

// Cancel payment
const cancelPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this payment' 
      });
    }

    // Update order payment status
    await Order.findByIdAndUpdate(orderId, {
      'payment.status': 'cancelled',
      'payment.cancelledAt': new Date(),
      status: 'cancelled'
    });

    res.json({
      success: true,
      message: 'Payment cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel payment',
      error: error.message 
    });
  }
};

// Get payment methods (for frontend)
const getPaymentMethodsFrontend = async (req, res) => {
  try {
    // Return available payment methods for Razorpay
    const paymentMethods = [
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Pay with UPI, Cards, Net Banking, or Wallets',
        icon: '💳',
        methods: ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets'],
        isActive: true
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get payment methods',
      error: error.message 
    });
  }
};

module.exports = {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getTransactions,
  getTransactionById,
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  cancelPayment,
  getPaymentMethodsFrontend
}; 