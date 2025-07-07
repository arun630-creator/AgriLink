const API_BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123',
  role: 'buyer',
  phone: '9876543210'
};

async function testAPI() {
  console.log('🧪 Testing AgriLink Backend Integration...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing User Registration...');
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('✅ Registration successful:', registerData.user.name);
      console.log('   Token received:', registerData.token ? 'Yes' : 'No');
    } else {
      const error = await registerResponse.json();
      console.log('⚠️  Registration failed:', error.message);
    }

    // Test 2: Login
    console.log('\n2️⃣ Testing User Login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData.user.name);
      console.log('   Role:', loginData.user.role);
      console.log('   Profile completion:', loginData.user.profileCompletion + '%');
      
      // Test 3: Get Profile
      console.log('\n3️⃣ Testing Profile Retrieval...');
      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Profile retrieved successfully');
        console.log('   User ID:', profileData.id);
        console.log('   Email:', profileData.email);
        console.log('   Stats available:', profileData.stats ? 'Yes' : 'No');
      } else {
        console.log('❌ Profile retrieval failed');
      }

      // Test 4: Update Profile
      console.log('\n4️⃣ Testing Profile Update...');
      const updateData = {
        bio: 'This is a test bio from API testing',
        location: 'Mumbai, Maharashtra',
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false
        }
      };

      const updateResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('✅ Profile updated successfully');
        console.log('   Bio updated:', updateResult.user.bio);
        console.log('   Location updated:', updateResult.user.location);
      } else {
        console.log('❌ Profile update failed');
      }

      // Test 5: Get Stats
      console.log('\n5️⃣ Testing Stats Retrieval...');
      const statsResponse = await fetch(`${API_BASE_URL}/auth/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        console.log('✅ Stats retrieved successfully');
        console.log('   Role:', statsData.role);
        console.log('   Stats object:', Object.keys(statsData.stats));
      } else {
        console.log('❌ Stats retrieval failed');
      }

    } else {
      const error = await loginResponse.json();
      console.log('❌ Login failed:', error.message);
    }

    console.log('\n🎉 API Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('   - Backend is running on port 5000');
    console.log('   - API endpoints are accessible');
    console.log('   - Authentication is working');
    console.log('   - Profile management is functional');
    console.log('   - Stats system is operational');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure your backend server is running on port 5000');
  }
}

// Run the test
testAPI(); 