const Razorpay = require('razorpay');

// Test credentials from Razorpay documentation
const credentials = [
  {
    name: 'Your Test Credentials',
    key_id: 'rzp_test_rfZeI7lhyLf0bh',
    key_secret: 'oijVr3PDz4kRenw0oXfeTbzK'
  },
  {
    name: 'Official Test Credentials (Fallback)',
    key_id: 'rzp_test_1DP5mmOlF5G5ag',
    key_secret: 'thisissecret'
  }
];

async function testCredentials() {
  console.log('Testing Razorpay credentials...\n');
  
  for (const cred of credentials) {
    console.log(`Testing: ${cred.name}`);
    console.log(`Key ID: ${cred.key_id}`);
    
    try {
      const razorpay = new Razorpay({
        key_id: cred.key_id,
        key_secret: cred.key_secret
      });
      
      // Test API call
      const response = await razorpay.orders.create({
        amount: 50000, // 500 INR in paise
        currency: 'INR',
        receipt: 'test_receipt_' + Date.now()
      });
      
      console.log('✅ SUCCESS: Credentials work!');
      console.log('Order ID:', response.id);
      console.log('Amount:', response.amount);
      console.log('Currency:', response.currency);
      console.log('---\n');
      
      // Use these credentials
      console.log('🎉 Use these credentials in your payment controller:');
      console.log(`key_id: '${cred.key_id}'`);
      console.log(`key_secret: '${cred.key_secret}'`);
      return;
      
    } catch (error) {
      console.log('❌ FAILED:', error.message);
      if (error.error) {
        console.log('Error details:', error.error.description || error.error);
      }
      console.log('---\n');
    }
  }
  
  console.log('❌ All credentials failed. Please check your Razorpay account.');
}

testCredentials().catch(console.error); 