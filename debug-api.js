// Debug script to identify 400 Bad Request errors
const API_BASE_URL = 'http://localhost:5000/api';

// Generate unique test data
const timestamp = Date.now();
const testUser = {
  name: `Debug User ${timestamp}`,
  email: `debug${timestamp}@example.com`,
  password: 'DebugPass123',
  role: 'buyer',
  phone: `98765${timestamp.toString().slice(-5)}` // Use last 5 digits of timestamp
};

// Enhanced fetch with detailed logging
async function debugFetch(url, options = {}) {
  console.log(`🔍 Making API call to: ${url}`);
  console.log(`📤 Request method: ${options.method || 'GET'}`);
  console.log(`📤 Request headers:`, options.headers);
  if (options.body) {
    console.log(`📤 Request body:`, JSON.parse(options.body));
  }

  try {
    const response = await fetch(url, options);
    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
    
    if (!response.ok) {
      console.error(`❌ API Error (${response.status}):`, responseData);
      console.error(`🔍 Full response:`, responseText);
    } else {
      console.log(`✅ API Success:`, responseData);
    }
    
    return response;
  } catch (error) {
    console.error(`💥 Network Error:`, error);
    throw error;
  }
}

// Test all API endpoints
async function testAllEndpoints() {
  console.log('🧪 Testing all API endpoints with unique data...\n');
  console.log('📋 Test user data:', testUser);

  // Test 1: Register
  console.log('\n1️⃣ Testing Registration...');
  const registerResponse = await debugFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });

  let token = null;
  if (registerResponse.ok) {
    const registerData = await registerResponse.json();
    token = registerData.token;
  } else {
    // If registration fails, try to login with existing user
    console.log('\n🔄 Registration failed, trying login with existing user...');
    const loginResponse = await debugFetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Use existing test user
        password: 'TestPass123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
    }
  }

  if (token) {
    // Test 3: Get Profile
    console.log('\n3️⃣ Testing Get Profile...');
    await debugFetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Test 4: Get Stats
    console.log('\n4️⃣ Testing Get Stats...');
    await debugFetch(`${API_BASE_URL}/auth/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Test 5: Update Profile
    console.log('\n5️⃣ Testing Update Profile...');
    await debugFetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bio: 'Debug bio update',
        location: 'Debug Location'
      })
    });

    // Test 6: 2FA Setup
    console.log('\n6️⃣ Testing 2FA Setup...');
    await debugFetch(`${API_BASE_URL}/auth/2fa/setup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Test 7: 2FA Status
    console.log('\n7️⃣ Testing 2FA Status...');
    await debugFetch(`${API_BASE_URL}/auth/2fa/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } else {
    console.log('❌ Could not obtain authentication token. Skipping authenticated endpoints.');
  }
}

// Run the tests
testAllEndpoints().catch(console.error); 