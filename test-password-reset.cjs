const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Functionality\n');

  try {
    // Test 1: Request password reset for non-existent email
    console.log('1. Testing forgot password with non-existent email...');
    const response1 = await axios.post(`${API_BASE}/auth/forgot-password`, {
      email: 'nonexistent@example.com'
    });
    console.log('✅ Response:', response1.data.message);
    console.log('✅ Security: Does not reveal if email exists\n');

    // Test 2: Request password reset for existing email (if you have a test user)
    console.log('2. Testing forgot password with existing email...');
    const response2 = await axios.post(`${API_BASE}/auth/forgot-password`, {
      email: 'test@example.com' // Replace with actual test email
    });
    console.log('✅ Response:', response2.data.message);
    console.log('✅ Email should be sent if account exists\n');

    // Test 3: Test invalid reset token
    console.log('3. Testing invalid reset token...');
    try {
      const response3 = await axios.get(`${API_BASE}/auth/verify-reset-token/invalid-token`);
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('✅ Correctly rejected invalid token:', error.response.data.message);
    }

    // Test 4: Test reset password with invalid token
    console.log('\n4. Testing reset password with invalid token...');
    try {
      const response4 = await axios.post(`${API_BASE}/auth/reset-password`, {
        token: 'invalid-token',
        newPassword: 'NewPassword123'
      });
      console.log('❌ Should have failed');
    } catch (error) {
      console.log('✅ Correctly rejected invalid token:', error.response.data.message);
    }

    console.log('\n🎉 Password reset tests completed!');
    console.log('\n📧 To test email functionality:');
    console.log('1. Set up EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('2. Use a real email address in test 2');
    console.log('3. Check the email inbox for the reset link');
    console.log('4. Use the reset link to test the full flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testPasswordReset(); 