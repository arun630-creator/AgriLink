const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./backend/models/User');
const Admin = require('./backend/models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname';

async function createAdminUser() {
  await mongoose.connect(MONGO_URI);

  const email = 'admin@example.com';
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if user already exists
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      name: 'Admin User',
      email,
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      accountStatus: 'active',
      verificationStatus: 'verified',
      isVerified: true
    });
    await user.save();
    console.log('User created:', user._id);
  } else {
    console.log('User already exists:', user._id);
  }

  // Check if Admin document exists
  let admin = await Admin.findOne({ user: user._id });
  if (!admin) {
    admin = new Admin({
      user: user._id,
      permissions: ['all'],
      accountStatus: 'active'
    });
    await admin.save();
    console.log('Admin document created:', admin._id);
  } else {
    console.log('Admin document already exists:', admin._id);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

createAdminUser().catch(err => {
  console.error('Error creating admin user:', err);
  process.exit(1);
}); 