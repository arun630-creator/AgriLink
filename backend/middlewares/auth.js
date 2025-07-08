const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('HEADERS:', req.headers); // Debug log
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('NO TOKEN OR BAD FORMAT');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('TOKEN:', token);
    
    // Try to verify the token
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('DECODED:', decoded);
    } catch (err) {
      console.log('JWT VERIFY ERROR:', err);
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Fetch the user from database to ensure we have the latest data
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('USER NOT FOUND');
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set the user object in the request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      location: user.location,
      farmName: user.farmName,
      farmLocation: user.farmLocation
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = auth; 