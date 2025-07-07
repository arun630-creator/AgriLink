const { body } = require('express-validator');

exports.validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('phone')
    .optional()
    .matches(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  
  body('farmName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Farm name must be less than 100 characters'),
  
  body('farmSize')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Farm size must be less than 50 characters'),
  
  body('farmLocation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Farm location must be less than 100 characters'),
  
  body('certifications')
    .optional()
    .isArray()
    .withMessage('Certifications must be an array'),
  
  body('certifications.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each certification must be less than 50 characters'),
  
  body('preferences')
    .optional()
    .isArray()
    .withMessage('Preferences must be an array'),
  
  body('preferences.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each preference must be less than 30 characters'),
  
  body('favoriteCategories')
    .optional()
    .isArray()
    .withMessage('Favorite categories must be an array'),
  
  body('favoriteCategories.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each category must be less than 30 characters'),
  
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications must be a boolean'),
  
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean'),
  
  body('notifications.marketing')
    .optional()
    .isBoolean()
    .withMessage('Marketing notifications must be a boolean'),
  
  body('privacy.showProfile')
    .optional()
    .isBoolean()
    .withMessage('Show profile must be a boolean'),
  
  body('privacy.showLocation')
    .optional()
    .isBoolean()
    .withMessage('Show location must be a boolean'),
  
  body('privacy.showContact')
    .optional()
    .isBoolean()
    .withMessage('Show contact must be a boolean'),
  
  body('language')
    .optional()
    .isIn(['en', 'hi', 'ta', 'te'])
    .withMessage('Language must be one of: en, hi, ta, te'),
  
  body('currency')
    .optional()
    .isIn(['inr', 'usd', 'eur'])
    .withMessage('Currency must be one of: inr, usd, eur')
];

exports.validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
]; 