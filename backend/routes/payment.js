const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/auth');

// Existing payment method routes
router.get('/payment-methods', authenticateToken, getPaymentMethods);
router.post('/payment-methods', authenticateToken, addPaymentMethod);
router.put('/payment-methods/:id', authenticateToken, updatePaymentMethod);
router.delete('/payment-methods/:id', authenticateToken, deletePaymentMethod);
router.put('/payment-methods/:id/default', authenticateToken, setDefaultPaymentMethod);

// Transaction routes
router.get('/transactions', authenticateToken, getTransactions);
router.get('/transactions/:id', authenticateToken, getTransactionById);

// New Razorpay payment routes
router.post('/create-order', authenticateToken, createPaymentOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.get('/status/:orderId', authenticateToken, getPaymentStatus);
router.post('/cancel/:orderId', authenticateToken, cancelPayment);
router.get('/available-methods', getPaymentMethodsFrontend);

module.exports = router; 