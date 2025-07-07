const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Product Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Herbs', 'Seeds', 'Dairy', 'Other']
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 50
  },

  // Pricing and Units
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'gram', 'piece', 'dozen', 'box', 'bunch', 'liter', 'pack']
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: 0
  },
  maxOrderQuantity: {
    type: Number,
    min: 0
  },

  // Inventory
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },

  // Product Quality & Certification
  organic: {
    type: Boolean,
    default: false
  },
  certifications: [{
    type: String,
    enum: ['Organic', 'GAP', 'HACCP', 'ISO', 'FSSAI', 'Other']
  }],
  qualityGrade: {
    type: String,
    enum: ['Premium', 'Grade A', 'Grade B', 'Standard'],
    default: 'Standard'
  },

  // Harvest & Expiry Information
  harvestDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date
  },
  shelfLife: {
    type: Number, // in days
    min: 1
  },

  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],

  // Farmer Information
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  farmLocation: {
    type: String,
    trim: true,
    maxlength: 200
  },

  // Location & Delivery
  availableLocations: [{
    type: String,
    trim: true
  }],
  deliveryRadius: {
    type: Number, // in kilometers
    default: 50
  },
  deliveryTime: {
    type: Number, // in hours
    default: 24
  },

  // Status & Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'pending_approval', 'rejected'],
    default: 'active' // Changed to 'active' for immediate visibility
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isSeasonal: {
    type: Boolean,
    default: false
  },

  // SEO & Discovery
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  searchKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],

  // Statistics
  views: {
    type: Number,
    default: 0
  },
  orders: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ farmer: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ harvestDate: 1 });
productSchema.index({ 'farmer.location': 1 });

// Virtual for available quantity
productSchema.virtual('availableQuantity').get(function() {
  return Math.max(0, this.quantity - this.reservedQuantity);
});

// Virtual for isInStock
productSchema.virtual('isInStock').get(function() {
  return this.availableQuantity > 0 && this.status === 'active';
});

// Pre-save middleware to update timestamps
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find active products
productSchema.statics.findActive = function() {
  return this.find({ status: 'active', quantity: { $gt: 0 } });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Instance method to update stock
productSchema.methods.updateStock = function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    if (this.quantity >= quantity) {
      this.quantity -= quantity;
      return true;
    }
    return false;
  } else if (operation === 'increase') {
    this.quantity += quantity;
    return true;
  }
  return false;
};

// Instance method to reserve stock
productSchema.methods.reserveStock = function(quantity) {
  if (this.availableQuantity >= quantity) {
    this.reservedQuantity += quantity;
    return true;
  }
  return false;
};

// Instance method to release reserved stock
productSchema.methods.releaseReservedStock = function(quantity) {
  if (this.reservedQuantity >= quantity) {
    this.reservedQuantity -= quantity;
    return true;
  }
  return false;
};

module.exports = mongoose.model('Product', productSchema); 