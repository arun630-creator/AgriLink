const API_BASE_URL = 'http://localhost:5000/api';

// Test data for creating products
const sampleProducts = [
  {
    name: "Organic Tomatoes",
    description: "Fresh organic tomatoes grown without pesticides. Perfect for salads and cooking. Harvested daily for maximum freshness.",
    category: "Vegetables",
    subcategory: "Tomatoes",
    price: 45,
    unit: "kg",
    minOrderQuantity: 1,
    maxOrderQuantity: 50,
    quantity: 150,
    organic: true,
    certifications: ["Organic", "GAP"],
    qualityGrade: "Premium",
    harvestDate: "2024-01-15",
    expiryDate: "2024-01-22",
    shelfLife: 7,
    farmName: "Green Valley Farm",
    farmLocation: "Maharashtra",
    availableLocations: ["Mumbai", "Pune", "Nashik"],
    deliveryRadius: 100,
    deliveryTime: 24,
    isFeatured: true,
    isSeasonal: false,
    tags: ["organic", "fresh", "local"],
    searchKeywords: ["tomatoes", "organic", "fresh", "vegetables"]
  },
  {
    name: "Fresh Spinach",
    description: "Crisp and fresh spinach leaves packed with nutrients. Perfect for salads, smoothies, and cooking.",
    category: "Vegetables",
    subcategory: "Spinach",
    price: 30,
    unit: "kg",
    minOrderQuantity: 0.5,
    maxOrderQuantity: 20,
    quantity: 80,
    organic: false,
    certifications: ["GAP"],
    qualityGrade: "Grade A",
    harvestDate: "2024-01-14",
    expiryDate: "2024-01-18",
    shelfLife: 4,
    farmName: "Leafy Greens Co",
    farmLocation: "Karnataka",
    availableLocations: ["Bangalore", "Mysore"],
    deliveryRadius: 80,
    deliveryTime: 12,
    isFeatured: false,
    isSeasonal: false,
    tags: ["fresh", "nutritious", "leafy"],
    searchKeywords: ["spinach", "fresh", "leafy", "vegetables"]
  },
  {
    name: "Premium Basmati Rice",
    description: "Aromatic basmati rice directly from Punjab fields. Aged for perfect texture and flavor.",
    category: "Grains",
    subcategory: "Rice",
    price: 85,
    unit: "kg",
    minOrderQuantity: 5,
    maxOrderQuantity: 100,
    quantity: 500,
    organic: false,
    certifications: ["FSSAI"],
    qualityGrade: "Premium",
    harvestDate: "2024-01-08",
    expiryDate: "2025-01-08",
    shelfLife: 365,
    farmName: "Golden Fields",
    farmLocation: "Punjab",
    availableLocations: ["Amritsar", "Ludhiana", "Chandigarh"],
    deliveryRadius: 200,
    deliveryTime: 48,
    isFeatured: true,
    isSeasonal: false,
    tags: ["basmati", "premium", "aromatic"],
    searchKeywords: ["rice", "basmati", "premium", "grains"]
  }
];

// Function to test product creation
async function testProductCreation() {
  console.log('🚀 Testing Product Management System...\n');

  // First, we need to get a farmer token (you'll need to create a farmer account first)
  console.log('⚠️  Note: You need to create a farmer account first and get the token');
  console.log('   You can use the registration endpoint: POST /api/auth/register');
  console.log('   Then login to get the token: POST /api/auth/login\n');

  // Test public endpoints (no auth required)
  console.log('📋 Testing Public Endpoints...\n');

  try {
    // Test getting all products
    console.log('1. Testing GET /api/products...');
    const productsResponse = await fetch(`${API_BASE_URL}/products?limit=5`);
    const productsData = await productsResponse.json();
    console.log('✅ Products endpoint working:', productsData.success ? 'Success' : 'Failed');
    console.log(`   Found ${productsData.products?.length || 0} products\n`);

    // Test getting featured products
    console.log('2. Testing GET /api/products/featured...');
    const featuredResponse = await fetch(`${API_BASE_URL}/products/featured?limit=3`);
    const featuredData = await featuredResponse.json();
    console.log('✅ Featured products endpoint working:', featuredData.success ? 'Success' : 'Failed');
    console.log(`   Found ${featuredData.products?.length || 0} featured products\n`);

    // Test search products
    console.log('3. Testing GET /api/products/search...');
    const searchResponse = await fetch(`${API_BASE_URL}/products/search?q=tomatoes`);
    const searchData = await searchResponse.json();
    console.log('✅ Search endpoint working:', searchData.success ? 'Success' : 'Failed');
    console.log(`   Found ${searchData.products?.length || 0} products for "tomatoes"\n`);

  } catch (error) {
    console.error('❌ Error testing public endpoints:', error.message);
  }

  console.log('🔐 Testing Protected Endpoints...\n');
  console.log('⚠️  Note: Protected endpoints require authentication');
  console.log('   To test these, you need to:');
  console.log('   1. Register a farmer account');
  console.log('   2. Login to get a token');
  console.log('   3. Use the token in Authorization header\n');

  // Example of how to create a product (commented out since we need auth)
  console.log('📝 Example of creating a product:');
  console.log('POST /api/products');
  console.log('Headers: {');
  console.log('  "Authorization": "Bearer YOUR_TOKEN_HERE",');
  console.log('  "Content-Type": "application/json"');
  console.log('}');
  console.log('Body:', JSON.stringify(sampleProducts[0], null, 2));

  console.log('\n🎯 Next Steps:');
  console.log('1. Create a farmer account using the registration form');
  console.log('2. Login to get your authentication token');
  console.log('3. Use the Add Product form in the frontend');
  console.log('4. Or test the API directly with the token');
}

// Function to test with authentication (requires token)
async function testWithAuth(token) {
  console.log('🔐 Testing with authentication...\n');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test creating a product
    console.log('1. Testing POST /api/products...');
    const createResponse = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(sampleProducts[0])
    });
    const createData = await createResponse.json();
    
    if (createData.success) {
      console.log('✅ Product created successfully!');
      console.log('   Product ID:', createData.product.id);
      console.log('   Product Name:', createData.product.name);
      
      // Test getting the created product
      console.log('\n2. Testing GET /api/products/:id...');
      const getResponse = await fetch(`${API_BASE_URL}/products/${createData.product.id}`);
      const getData = await getResponse.json();
      console.log('✅ Product retrieved successfully:', getData.success ? 'Yes' : 'No');
      
      // Test updating the product
      console.log('\n3. Testing PUT /api/products/:id...');
      const updateResponse = await fetch(`${API_BASE_URL}/products/${createData.product.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ price: 50 })
      });
      const updateData = await updateResponse.json();
      console.log('✅ Product updated successfully:', updateData.success ? 'Yes' : 'No');
      
    } else {
      console.log('❌ Failed to create product:', createData.message);
    }

  } catch (error) {
    console.error('❌ Error testing with auth:', error.message);
  }
}

// Run the test
testProductCreation();

// Export for manual testing
module.exports = {
  testProductCreation,
  testWithAuth,
  sampleProducts
}; 