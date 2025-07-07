const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testProductCreation() {
  try {
    console.log('🧪 Testing Product Creation API...');
    
    // Login with farmer account
    console.log('\n1️⃣ Logging in with farmer@test.com...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'farmer@test.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.token;
    
    // Test product creation
    console.log('\n2️⃣ Creating test product...');
    const productData = {
      name: 'Fresh Organic Tomatoes',
      description: 'Fresh, organic tomatoes grown without pesticides. Perfect for salads and cooking.',
      category: 'Vegetables',
      subcategory: 'Tomatoes',
      price: 80,
      unit: 'kg',
      minOrderQuantity: 1,
      maxOrderQuantity: 50,
      quantity: 100,
      organic: true,
      certifications: ['Organic', 'FSSAI'],
      qualityGrade: 'Premium',
      harvestDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      shelfLife: 7,
      farmName: 'Test Farm',
      farmLocation: 'Mumbai, Maharashtra',
      availableLocations: ['Mumbai', 'Pune', 'Thane'],
      deliveryRadius: 100,
      deliveryTime: 24,
      isFeatured: false,
      isSeasonal: false,
      tags: ['organic', 'fresh', 'local'],
      searchKeywords: ['tomatoes', 'organic', 'fresh vegetables']
    };
    
    const productResponse = await axios.post(`${API_BASE_URL}/products`, productData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Product created successfully!');
    console.log(`   Product ID: ${productResponse.data.product._id}`);
    console.log(`   Name: ${productResponse.data.product.name}`);
    console.log(`   Status: ${productResponse.data.product.status}`);
    
    // Test fetching products
    console.log('\n3️⃣ Fetching products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products`);
    
    console.log('✅ Products fetched successfully!');
    console.log(`   Total products: ${productsResponse.data.products.length}`);
    
    if (productsResponse.data.products.length > 0) {
      console.log(`   Latest product: ${productsResponse.data.products[0].name}`);
    }
    
    console.log('\n🎉 All tests passed! Product creation is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n🔒 Permission error: Make sure you are logged in as a farmer.');
    }
    
    if (error.response?.status === 400 && error.response?.data?.errors) {
      console.log('\n📋 Validation errors:');
      error.response.data.errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.field}: ${err.message}`);
      });
    }
  }
}

testProductCreation(); 