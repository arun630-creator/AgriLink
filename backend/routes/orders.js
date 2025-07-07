const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const roleCheck = require('../middlewares/roleCheck');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../validators/orderValidator');

// Validation rules
const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.id').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('deliveryAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('deliveryAddress.address').notEmpty().withMessage('Address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').notEmpty().withMessage('State is required'),
  body('deliveryAddress.pincode').notEmpty().withMessage('Pincode is required'),
  body('paymentMethod').optional().isIn(['cod', 'online', 'upi', 'card', 'wallet']).withMessage('Invalid payment method'),
  body('notes').optional().isString().withMessage('Notes must be a string')
];

const updateOrderStatusValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']).withMessage('Invalid order status'),
  body('reason').optional().isString().withMessage('Reason must be a string'),
  body('trackingNumber').optional().isString().withMessage('Tracking number must be a string'),
  body('trackingUrl').optional().isURL().withMessage('Invalid tracking URL')
];

const cancelOrderValidation = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('reason').notEmpty().withMessage('Cancellation reason is required')
];

const getOrdersValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'all']).withMessage('Invalid status')
];

// Routes
// Create order (buyers only)
router.post('/', 
  auth, 
  roleCheck('buyer'),
  createOrderValidation,
  handleValidationErrors,
  orderController.createOrder
);

// Get user's orders (buyers)
router.get('/my-orders',
  auth,
  roleCheck('buyer'),
  getOrdersValidation,
  handleValidationErrors,
  orderController.getUserOrders
);

// Get order by ID (buyer who owns the order or admin)
router.get('/:id',
  auth,
  [param('id').isMongoId().withMessage('Invalid order ID')],
  handleValidationErrors,
  orderController.getOrderById
);

// Update order status (admin or farmer)
router.patch('/:id/status',
  auth,
  roleCheck('admin', 'farmer'),
  updateOrderStatusValidation,
  handleValidationErrors,
  orderController.updateOrderStatus
);

// Cancel order (buyer who owns the order or admin)
router.patch('/:id/cancel',
  auth,
  cancelOrderValidation,
  handleValidationErrors,
  orderController.cancelOrder
);

// Get farmer's orders (farmers only)
router.get('/farmer/orders',
  auth,
  roleCheck('farmer'),
  getOrdersValidation,
  handleValidationErrors,
  orderController.getFarmerOrders
);

// Update farmer order status (farmer who owns the order)
router.patch('/:orderId/farmer-orders/:farmerOrderId/status',
  auth,
  roleCheck('farmer'),
  [
    param('orderId').isMongoId().withMessage('Invalid order ID'),
    param('farmerOrderId').isMongoId().withMessage('Invalid farmer order ID'),
    body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
    body('trackingNumber').optional().isString().withMessage('Tracking number must be a string'),
    body('trackingUrl').optional().isURL().withMessage('Invalid tracking URL')
  ],
  handleValidationErrors,
  orderController.updateFarmerOrderStatus
);

module.exports = router; 