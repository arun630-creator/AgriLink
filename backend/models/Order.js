const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  }
});

const deliveryAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  landmark: {
    type: String
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  deliveryAddress: deliveryAddressSchema,
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'upi', 'card', 'wallet'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  // Razorpay payment details
  payment: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    amount: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    completedAt: Date,
    cancelledAt: Date,
    failureReason: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  notes: {
    type: String
  },
  expectedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  // Farmer-specific fields for order management
  farmerOrders: [{
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    expectedDelivery: {
      type: Date
    },
    deliveredAt: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('validate', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    this.orderNumber = `ORD${year}${month}${day}${timestamp}`;
  }
  next();
});

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal + this.deliveryFee + this.tax;
  }
  next();
});

// Create farmer orders when order is created
orderSchema.pre('save', function(next) {
  if (this.isNew && this.items.length > 0) {
    // Group items by farmer
    const farmerGroups = {};
    this.items.forEach(item => {
      const farmerId = item.farmer.toString();
      if (!farmerGroups[farmerId]) {
        farmerGroups[farmerId] = {
          farmer: item.farmer,
          items: []
        };
      }
      farmerGroups[farmerId].items.push(item);
    });

    // Create farmer orders
    this.farmerOrders = Object.values(farmerGroups);
  }
  next();
});

// Indexes for better query performance
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ 'farmerOrders.farmer': 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema); 