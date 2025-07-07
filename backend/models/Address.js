const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  landmark: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  addressType: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
addressSchema.index({ userId: 1, isActive: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Virtual for full address string
addressSchema.virtual('fullAddress').get(function() {
  const parts = [
    this.address,
    this.city,
    this.state,
    this.pincode
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Ensure virtuals are serialized
addressSchema.set('toJSON', { virtuals: true });
addressSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Address', addressSchema); 