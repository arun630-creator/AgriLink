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
  },
  // Agricultural specific fields
  harvestDate: Date,
  expectedHarvestDate: Date,
  qualityGrade: {
    type: String,
    enum: ['Premium', 'Grade A', 'Grade B', 'Standard']
  },
  qualityChecks: [{
    checkType: {
      type: String,
      enum: ['visual', 'weight', 'freshness', 'pesticide', 'other']
    },
    result: {
      type: String,
      enum: ['pass', 'fail', 'pending']
    },
    notes: String,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: {
      type: Date,
      default: Date.now
    }
  }]
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
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  }
});

// Agricultural order lifecycle tracking
const orderLifecycleSchema = new mongoose.Schema({
  stage: {
    type: String,
    enum: ['harvesting', 'packed', 'quality_check', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: String,
  notes: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedCompletion: Date
});

// Quality check schema
const qualityCheckSchema = new mongoose.Schema({
  checkType: {
    type: String,
    enum: ['visual', 'weight', 'freshness', 'pesticide', 'packaging', 'other'],
    required: true
  },
  result: {
    type: String,
    enum: ['pass', 'fail', 'pending'],
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 10
  },
  notes: String,
  images: [String],
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checkedAt: {
    type: Date,
    default: Date.now
  }
});

// Dispute schema
const disputeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quality', 'delivery', 'quantity', 'pricing', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'investigating', 'resolved', 'closed'],
    default: 'open'
  },
  description: {
    type: String,
    required: true
  },
  evidence: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document']
    },
    url: String,
    description: String
  }],
  resolution: {
    action: {
      type: String,
      enum: ['refund', 'replacement', 'partial_refund', 'no_action']
    },
    amount: Number,
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
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
  
  // Enhanced payment information
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'upi', 'card', 'wallet', 'bank_transfer'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
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
    failureReason: String,
    refundAmount: Number,
    refundReason: String
  },
  
  // Enhanced order status with agricultural lifecycle
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'harvesting', 'packed', 'quality_check', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'disputed'],
    default: 'pending'
  },
  
  // Agricultural lifecycle tracking
  lifecycle: [orderLifecycleSchema],
  
  // Quality checks
  qualityChecks: [qualityCheckSchema],
  
  // Disputes
  disputes: [disputeSchema],
  
  // Enhanced pricing
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
  commission: {
    type: Number,
    default: 0
  },
  subsidy: {
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
  
  // Enhanced delivery information
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
  
  // Enhanced tracking
  trackingNumber: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  deliveryPartner: {
    partnerId: String,
    partnerName: String,
    contactNumber: String,
    estimatedDelivery: Date
  },
  
  // Enhanced farmer order management
  farmerOrders: [{
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'harvesting', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    expectedDelivery: {
      type: Date
    },
    deliveredAt: {
      type: Date
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 10
    }
  }],
  
  // Commission and payout tracking
  commissionDetails: {
    platformCommission: {
      type: Number,
      default: 0
    },
    farmerPayout: {
      type: Number,
      default: 0
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'processed', 'completed', 'failed'],
      default: 'pending'
    },
    payoutDate: Date,
    transactionId: String
  },
  
  // Customer feedback
  customerFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    qualityRating: {
      type: Number,
      min: 1,
      max: 5
    },
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5
    },
    submittedAt: Date
  },
  
  // Regional information
  region: {
    type: String,
    required: true
  },
  season: {
    type: String,
    enum: ['spring', 'summer', 'monsoon', 'autumn', 'winter']
  }
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