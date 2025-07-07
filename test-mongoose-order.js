const mongoose = require('mongoose');
require('dotenv').config();

// Import the Order model
const Order = require('./backend/models/Order');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test');

  // Create a minimal order document
  const order = new Order({
    buyer: new mongoose.Types.ObjectId(),
    items: [{
      product: new mongoose.Types.ObjectId(),
      name: 'Test Product',
      price: 10,
      unit: 'kg',
      quantity: 2,
      total: 20,
      farmer: new mongoose.Types.ObjectId(),
      farmerName: 'Test Farmer'
    }],
    deliveryAddress: {
      fullName: 'Test User',
      phone: '9999999999',
      address: '123 Test Lane',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456'
    },
    paymentMethod: 'cod',
    subtotal: 20,
    deliveryFee: 0,
    total: 20
  });

  await order.save();
  console.log('Order saved:', order);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 