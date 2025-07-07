const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['card', 'upi', 'wallet'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // For cards
  maskedNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: String,
    trim: true
  },
  // For UPI
  upiId: {
    type: String,
    trim: true
  },
  // For wallets
  walletType: {
    type: String,
    enum: ['paytm', 'gpay', 'phonepe']
  },
  phone: {
    type: String,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentMethodSchema.index({ userId: 1, isActive: 1 });
paymentMethodSchema.index({ userId: 1, isDefault: 1 });

// Ensure only one default payment method per user
paymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Mask card number for security
paymentMethodSchema.methods.maskCardNumber = function(cardNumber) {
  if (!cardNumber) return null;
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return cleaned;
  return '•••• •••• •••• ' + cleaned.slice(-4);
};

// Validate payment method data
paymentMethodSchema.methods.validatePaymentData = function() {
  if (this.type === 'card') {
    if (!this.maskedNumber || !this.expiryDate) {
      throw new Error('Card number and expiry date are required for card payments');
    }
  } else if (this.type === 'upi') {
    if (!this.upiId) {
      throw new Error('UPI ID is required for UPI payments');
    }
  } else if (this.type === 'wallet') {
    if (!this.walletType || !this.phone) {
      throw new Error('Wallet type and phone number are required for wallet payments');
    }
  }
};

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema); 