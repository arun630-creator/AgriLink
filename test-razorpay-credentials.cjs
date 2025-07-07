const Razorpay = require('razorpay');

// Test different credential combinations
const testCredentials = [
  {
    name: 'Official Test Credentials',
    key_id: 'rzp_test_1DP5mmOlF5G5ag',
    key_secret: 'thisismysecretkey'
  },
  {
    name: 'Alternative Test Credentials',
    key_id: 'rzp_test_1DP5mmOlF5G5ag',
    key_secret: 'test_secret_key'
  },
  {
    name: 'Sample Test Credentials',
    key_id: 'rzp_test_1DP5mmOlF5G5ag',
    key_secret: 'sample_secret_key'
  }
];

async function testRazorpayCredentials() {
  console.log('🧪 Testing Razorpay Credentials...\n');

  for (const cred of testCredentials) {
    try {
      console.log(`Testing: ${cred.name}`);
      console.log(`Key ID: ${cred.key_id}`);
      
      const razorpay = new Razorpay({
        key_id: cred.key_id,
        key_secret: cred.key_secret
      });

      // Try to create a simple order
      const order = await razorpay.orders.create({
        amount: 50000, // ₹500 in paise
        currency: 'INR',
        receipt: 'test_receipt_123'
      });

      console.log('✅ SUCCESS! Order created:', order.id);
      console.log('These credentials work!\n');
      
      // Use these credentials
      console.log('📝 Use these credentials in your payment controller:');
      console.log(`key_id: '${cred.key_id}'`);
      console.log(`key_secret: '${cred.key_secret}'`);
      return cred;
      
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      console.log('');
    }
  }

  console.log('❌ None of the test credentials worked.');
  console.log('');
  console.log('🔍 Troubleshooting:');
  console.log('1. Check if you have a valid Razorpay test account');
  console.log('2. Verify the credentials in your Razorpay dashboard');
  console.log('3. Make sure you\'re using test mode credentials, not live mode');
  console.log('4. Check if your Razorpay account is active');
}

testRazorpayCredentials(); 