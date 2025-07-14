const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/token');
const { 
  generateSecret, 
  generateQRCode, 
  verifyToken, 
  generateBackupCodes, 
  verifyBackupCode,
  generateTestToken
} = require('../utils/twoFactor');
const speakeasy = require('speakeasy');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendPasswordResetSuccessEmail } = require('../utils/email');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!['buyer', 'farmer'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either buyer or farmer' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone already in use' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });
    const token = generateToken(user);
    res.status(201).json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        profileCompletion: user.profileCompletion
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const token = generateToken(user);
    res.json({
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone,
        profileCompletion: user.profileCompletion
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get current user profile
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Format the response to match frontend expectations
    const profileData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar ? `${req.protocol}://${req.get('host')}${user.avatar}` : user.avatar,
      bio: user.bio,
      location: user.location,
      joinDate: user.createdAt,
      isVerified: user.isVerified,
      statusText: user.statusText,
      profileCompletion: user.profileCompletion,
      
      // Farmer specific
      farmName: user.farmName,
      farmSize: user.farmSize,
      farmLocation: user.farmLocation,
      certifications: user.certifications,
      
      // Buyer specific
      preferences: user.preferences,
      favoriteCategories: user.favoriteCategories,
      
      // Settings
      notifications: user.notifications,
      privacy: user.privacy,
      language: user.language,
      currency: user.currency,
      
      // Stats
      stats: user.stats,
      
      // Security
      lastLogin: user.lastLogin,
      loginAttempts: user.loginAttempts,
      lastPasswordChange: user.lastPasswordChange,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      
      // 2FA
      twoFactorEnabled: user.twoFactorEnabled,
      backupCodesCount: user.backupCodes ? user.backupCodes.filter(bc => !bc.used).length : 0
    };
    
    res.json(profileData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const {
      name,
      phone,
      bio,
      location,
      avatar,
      farmName,
      farmSize,
      farmLocation,
      certifications,
      preferences,
      favoriteCategories,
      notifications,
      privacy,
      language,
      currency
    } = req.body;
    
    // Update basic information
    if (name) user.name = name;
    if (phone) {
      // Check if phone is already taken by another user
      const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
      if (existingPhone) {
        return res.status(400).json({ message: 'Phone number already in use' });
      }
      user.phone = phone;
    }
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (avatar !== undefined) user.avatar = avatar;
    
    // Update farmer-specific information
    if (user.role === 'farmer') {
      if (farmName !== undefined) user.farmName = farmName;
      if (farmSize !== undefined) user.farmSize = farmSize;
      if (farmLocation !== undefined) user.farmLocation = farmLocation;
      if (certifications !== undefined) user.certifications = certifications;
    }
    
    // Update buyer-specific information
    if (user.role === 'buyer') {
      if (preferences !== undefined) user.preferences = preferences;
      if (favoriteCategories !== undefined) user.favoriteCategories = favoriteCategories;
    }
    
    // Update settings
    if (notifications) {
      user.notifications = { ...user.notifications, ...notifications };
    }
    if (privacy) {
      user.privacy = { ...user.privacy, ...privacy };
    }
    if (language) user.language = language;
    if (currency) user.currency = currency;
    
    await user.save();
    
    // Return updated profile
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatar: updatedUser.avatar ? `${req.protocol}://${req.get('host')}${updatedUser.avatar}` : updatedUser.avatar,
        bio: updatedUser.bio,
        location: updatedUser.location,
        joinDate: updatedUser.createdAt,
        isVerified: updatedUser.isVerified,
        statusText: updatedUser.statusText,
        profileCompletion: updatedUser.profileCompletion,
        farmName: updatedUser.farmName,
        farmSize: updatedUser.farmSize,
        farmLocation: updatedUser.farmLocation,
        certifications: updatedUser.certifications,
        preferences: updatedUser.preferences,
        favoriteCategories: updatedUser.favoriteCategories,
        notifications: updatedUser.notifications,
        privacy: updatedUser.privacy,
        language: updatedUser.language,
        currency: updatedUser.currency,
        stats: updatedUser.stats
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get user stats
exports.getStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('stats role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ stats: user.stats, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Setup 2FA - Generate secret and QR code
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }
    
    // Generate new secret
    const secret = generateSecret();
    const qrCode = await generateQRCode(secret, user.email);
    const backupCodes = generateBackupCodes();
    
    // Save secret and backup codes temporarily (not enabled yet)
    user.twoFactorSecret = secret.base32;
    user.backupCodes = backupCodes;
    await user.save();
    
    res.json({
      qrCode,
      backupCodes: backupCodes.map(bc => bc.code),
      secret: secret.base32
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify and enable 2FA
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }
    
    // Verify the token
    const isValid = verifyToken(user.twoFactorSecret, token);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    
    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();
    
    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.backupCodes = [];
    await user.save();
    
    res.json({ message: '2FA disabled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Generate new backup codes
exports.generateBackupCodes = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }
    
    const backupCodes = generateBackupCodes();
    user.backupCodes = backupCodes;
    await user.save();
    
    res.json({
      backupCodes: backupCodes.map(bc => bc.code)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get 2FA status
exports.get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('twoFactorEnabled backupCodes');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      enabled: user.twoFactorEnabled,
      backupCodesCount: user.backupCodes.filter(bc => !bc.used).length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Avatar upload
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Save the relative path to the avatar
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();
    
    // Return the relative path (not full URL) to avoid double URL construction
    res.json({ url: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload avatar', error: err.message });
  }
};

// Forgot Password - Request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token and expiry (1 hour from now)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password/${resetToken}`;
    
    // Send email
    const emailSent = await sendPasswordResetEmail(user.email, resetToken, resetUrl);
    
    if (emailSent) {
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } else {
      // If email fails, clear the token
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      
      res.status(500).json({ message: 'Failed to send password reset email. Please try again.' });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset Password - Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.lastPasswordChange = new Date();
    
    await user.save();
    
    // Send success email
    await sendPasswordResetSuccessEmail(user.email, user.name);
    
    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify Reset Token - Check if token is valid
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    res.json({ message: 'Token is valid', email: user.email });
  } catch (err) {
    console.error('Verify reset token error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

 