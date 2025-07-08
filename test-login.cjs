const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

const testLogin = async () => {
  console.log('🔐 Testing admin login...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log('Token:', response.data.token ? 'Present' : 'Missing');
    } else {
      console.log('❌ Login failed:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Login error:');
    console.log('Status:', error.response?.status);
    console.log('Data:', error.response?.data);
    console.log('Message:', error.message);
  }
};

testLogin(); 