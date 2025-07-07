const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testUserRole() {
  try {
    // Get the token from localStorage (you'll need to copy this from your browser)
    console.log('Please copy your authentication token from the browser console and paste it here:');
    console.log('You can get it by running: localStorage.getItem("token") in your browser console');
    
    // For testing, let's try to get the profile first
    console.log('\n1. Testing profile endpoint...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${process.argv[2] || 'your-token-here'}`
      }
    });
    
    console.log('Profile response:', JSON.stringify(profileResponse.data, null, 2));
    
    // Test product creation endpoint
    console.log('\n2. Testing product creation endpoint...');
    const productData = {
      name: 'Test Product',
      description: 'This is a test product',
      category: 'Vegetables',
      price: 50,
      unit: 'kg',
      quantity: 100,
      harvestDate: new Date().toISOString(),
      organic: false,
      qualityGrade: 'Standard'
    };
    
    const productResponse = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: {
        'Authorization': `Bearer ${process.argv[2] || 'your-token-here'}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Product creation response:', JSON.stringify(productResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\nThe user does not have farmer role. You need to:');
      console.log('1. Register a new user with farmer role, or');
      console.log('2. Update an existing user to have farmer role');
    }
  }
}

testUserRole(); 