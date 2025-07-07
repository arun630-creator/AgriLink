const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test user credentials (replace with actual test user)
const testUser = {
  email: 'buyer@test.com',
  password: 'password123'
};

async function testPaymentIntegration() {
  try {
    console.log('🧪 Testing Payment Integration...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get available payment methods
    console.log('2. Getting available payment methods...');
    const paymentMethodsResponse = await axios.get(`${API_BASE_URL}/payment/available-methods`);
    console.log('✅ Payment methods:', paymentMethodsResponse.data.data);
    console.log('');

    // Step 3: Create a test order (you'll need to have items in cart)
    console.log('3. Testing payment order creation...');
    console.log('⚠️  Note: This test requires an existing order ID');
    console.log('   Please create an order through the frontend first');
    console.log('   Then replace the orderId below with the actual order ID\n');

    // Example order ID (replace with actual order ID from frontend)
    const testOrderId = 'YOUR_ORDER_ID_HERE';
    const testAmount = 500; // ₹500

    if (testOrderId === 'YOUR_ORDER_ID_HERE') {
      console.log('❌ Please replace testOrderId with an actual order ID');
      console.log('   Create an order through the frontend and use that order ID');
      return;
    }

    const paymentOrderResponse = await axios.post(
      `${API_BASE_URL}/payment/create-order`,
      {
        amount: testAmount,
        currency: 'INR',
        orderId: testOrderId,
        description: 'Test payment order'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment order created successfully');
    console.log('Payment order data:', paymentOrderResponse.data.data);
    console.log('');

    // Step 4: Test payment status
    console.log('4. Testing payment status...');
    const paymentStatusResponse = await axios.get(
      `${API_BASE_URL}/payment/status/${testOrderId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Payment status retrieved');
    console.log('Payment status:', paymentStatusResponse.data.data);
    console.log('');

    console.log('🎉 Payment integration test completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Use the payment order data in the Razorpay frontend component');
    console.log('2. Test the complete payment flow through the UI');
    console.log('3. Verify payment verification works correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('');
      console.log('🔍 Troubleshooting:');
      console.log('- Make sure the order belongs to the logged-in user');
      console.log('- Check if the order ID is correct');
      console.log('- Verify the user is properly authenticated');
    }
  }
}

// Run the test
testPaymentIntegration(); 