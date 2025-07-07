const Joi = require('joi');

const validatePaymentMethod = (data) => {
  const schema = Joi.object({
    type: Joi.string().valid('card', 'upi', 'wallet').required(),
    name: Joi.string().min(1).max(100).required(),
    number: Joi.string().when('type', {
      is: 'card',
      then: Joi.string().pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/).required().messages({
        'string.pattern.base': 'Card number must be 16 digits (spaces allowed)',
        'any.required': 'Card number is required for card payments'
      }),
      otherwise: Joi.forbidden()
    }),
    expiryDate: Joi.string().when('type', {
      is: 'card',
      then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).required().messages({
        'string.pattern.base': 'Expiry date must be in MM/YY format (e.g., 12/25)',
        'any.required': 'Expiry date is required for card payments'
      }),
      otherwise: Joi.forbidden()
    }),
    cvv: Joi.string().when('type', {
      is: 'card',
      then: Joi.string().pattern(/^\d{3,4}$/).required().messages({
        'string.pattern.base': 'CVV must be 3 or 4 digits',
        'any.required': 'CVV is required for card payments'
      }),
      otherwise: Joi.forbidden()
    }),
    upiId: Joi.string().when('type', {
      is: 'upi',
      then: Joi.string().min(3).max(50).required().messages({
        'string.min': 'UPI ID must be at least 3 characters',
        'string.max': 'UPI ID must be less than 50 characters',
        'any.required': 'UPI ID is required for UPI payments'
      }),
      otherwise: Joi.forbidden()
    }),
    walletType: Joi.string().when('type', {
      is: 'wallet',
      then: Joi.string().valid('paytm', 'gpay', 'phonepe').required().messages({
        'any.only': 'Wallet type must be paytm, gpay, or phonepe',
        'any.required': 'Wallet type is required for wallet payments'
      }),
      otherwise: Joi.forbidden()
    }),
    phone: Joi.string().when('type', {
      is: 'wallet',
      then: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
        'string.pattern.base': 'Phone number must be 10 digits starting with 6-9',
        'any.required': 'Phone number is required for wallet payments'
      }),
      otherwise: Joi.forbidden()
    })
  });

  return schema.validate(data);
};

const validatePaymentMethodUpdate = (data) => {
  const schema = Joi.object({
    type: Joi.string().valid('card', 'upi', 'wallet').required(),
    name: Joi.string().min(1).max(100).required(),
    number: Joi.string().when('type', {
      is: 'card',
      then: Joi.string().pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/).optional().messages({
        'string.pattern.base': 'Card number must be 16 digits (spaces allowed)'
      }),
      otherwise: Joi.forbidden()
    }),
    expiryDate: Joi.string().when('type', {
      is: 'card',
      then: Joi.string().pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).required().messages({
        'string.pattern.base': 'Expiry date must be in MM/YY format (e.g., 12/25)',
        'any.required': 'Expiry date is required for card payments'
      }),
      otherwise: Joi.forbidden()
    }),
    cvv: Joi.string().when('type', {
      is: 'card',
      then: Joi.string().pattern(/^\d{3,4}$/).optional().messages({
        'string.pattern.base': 'CVV must be 3 or 4 digits'
      }),
      otherwise: Joi.forbidden()
    }),
    upiId: Joi.string().when('type', {
      is: 'upi',
      then: Joi.string().min(3).max(50).required().messages({
        'string.min': 'UPI ID must be at least 3 characters',
        'string.max': 'UPI ID must be less than 50 characters',
        'any.required': 'UPI ID is required for UPI payments'
      }),
      otherwise: Joi.forbidden()
    }),
    walletType: Joi.string().when('type', {
      is: 'wallet',
      then: Joi.string().valid('paytm', 'gpay', 'phonepe').required().messages({
        'any.only': 'Wallet type must be paytm, gpay, or phonepe',
        'any.required': 'Wallet type is required for wallet payments'
      }),
      otherwise: Joi.forbidden()
    }),
    phone: Joi.string().when('type', {
      is: 'wallet',
      then: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
        'string.pattern.base': 'Phone number must be 10 digits starting with 6-9',
        'any.required': 'Phone number is required for wallet payments'
      }),
      otherwise: Joi.forbidden()
    })
  });

  return schema.validate(data);
};

const validateTransaction = (data) => {
  const schema = Joi.object({
    orderId: Joi.string().optional(),
    type: Joi.string().valid('order', 'subscription', 'refund', 'commission').required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().valid('INR', 'USD', 'EUR').default('INR'),
    status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').default('pending'),
    paymentMethod: Joi.string().required(),
    description: Joi.string().min(1).max(200).required(),
    farmName: Joi.string().optional(),
    buyerName: Joi.string().optional(),
    metadata: Joi.object().optional()
  });

  return schema.validate(data);
};

module.exports = {
  validatePaymentMethod,
  validatePaymentMethodUpdate,
  validateTransaction
}; 