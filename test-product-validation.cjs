const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testProductValidation() {
  try {
    console.log('Testing product validation with different scenarios...');
    
    // Login with farmer account
    console.log('\n1. Logging in with farmer@test.com...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'farmer@test.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    const token = loginResponse.data.token;
    
    // Test scenarios
    const testScenarios = [
      {
        name: 'Valid Product',
        data: {
          name: 'Fresh Apples',
          description: 'Sweet and juicy organic apples from our farm.',
          category: 'Fruits',
          subcategory: 'Apples',
          price: 120,
          unit: 'kg',
          quantity: 50,
          organic: true,
          certifications: ['Organic'],
          qualityGrade: 'Premium',
          harvestDate: new Date().toISOString(),
          farmName: 'Apple Farm',
          farmLocation: 'Himachal Pradesh'
        }
      },
      {
        name: 'Invalid Certification',
        data: {
          name: 'Test Product',
          description: 'Test description for validation.',
          category: 'Vegetables',
          price: 50,
          unit: 'kg',
          quantity: 10,
          certifications: ['InvalidCert'], // This will fail
          harvestDate: new Date().toISOString()
        }
      },
      {
        name: 'Invalid Category',
        data: {
          name: 'Test Product',
          description: 'Test description for validation.',
          category: 'InvalidCategory', // This will fail
          price: 50,
          unit: 'kg',
          quantity: 10,
          harvestDate: new Date().toISOString()
        }
      },
      {
        name: 'Missing Required Fields',
        data: {
          name: 'Test Product',
          // Missing description, category, price, unit, quantity, harvestDate
        }
      }
    ];
    
    for (const scenario of testScenarios) {
      console.log(`\n--- Testing: ${scenario.name} ---`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/products`, scenario.data, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Success!');
        console.log('Product ID:', response.data.product._id);
        
      } catch (error) {
        console.log('❌ Failed');
        
        if (error.response?.status === 400 && error.response?.data?.errors) {
          console.log('Validation Errors:');
          error.response.data.errors.forEach((err, index) => {
            console.log(`  ${index + 1}. ${err.field}: ${err.message}`);
          });
        } else {
          console.log('Error:', error.response?.data?.message || error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Login Error:', error.response?.data || error.message);
  }
}

testProductValidation(); 