const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('name')
    .notEmpty().withMessage('Name is required'),
  body('email')
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('role')
    .isIn(['buyer', 'farmer']).withMessage('Role must be either buyer or farmer'),
  body('phone')
    .matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid Indian mobile number'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const validateLogin = [
  body('email')
    .isEmail().withMessage('Valid email is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateRegister, validateLogin }; 