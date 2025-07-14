const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const { validateRegister, validateLogin } = require('../validators/authValidator');
const { validateProfileUpdate, validatePasswordChange } = require('../validators/profileValidator');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Multer config for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, req.user.id + '-' + Date.now() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed!'));
  }
});

// Register
router.post('/register', validateRegister, authController.register);

// Login
router.post('/login', validateLogin, authController.login);

// Profile (protected)
router.get('/profile', auth, authController.profile);

// Update profile (protected)
router.put('/profile', auth, validateProfileUpdate, authController.updateProfile);

// Change password (protected)
router.put('/change-password', auth, validatePasswordChange, authController.changePassword);

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken);

// Get user stats (protected)
router.get('/stats', auth, authController.getStats);

// 2FA routes (protected)
router.post('/2fa/setup', auth, authController.setup2FA);
router.post('/2fa/verify', auth, authController.verify2FA);
router.post('/2fa/disable', auth, authController.disable2FA);
router.post('/2fa/backup-codes', auth, authController.generateBackupCodes);
router.get('/2fa/status', auth, authController.get2FAStatus);

// Avatar upload route (protected)
router.post('/avatar', auth, upload.single('avatar'), authController.uploadAvatar);

module.exports = router; 