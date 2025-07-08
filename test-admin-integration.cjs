const axios = require('axios');
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5001/api';
let adminToken = '';

// Test data
const testAdmin = {
  email: 'admin@example.com',
  password: 'admin123'
};

// Helper function to make authenticated requests
const makeAuthRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testAdminLogin = async () => {
  console.log('\n🔐 Testing Admin Login...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testAdmin);
    if (response.data.token) {
      adminToken = response.data.token;
      console.log('✅ Admin login successful');
      return true;
    }
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    return false;
  }
};

const testDashboardStats = async () => {
  console.log('\n📊 Testing Dashboard Stats...');
  const stats = await makeAuthRequest('GET', '/admin/analytics/dashboard-stats');
  if (stats && stats.success) {
    console.log('✅ Dashboard stats retrieved:', {
      users: stats.data.users,
      products: stats.data.products,
      orders: stats.data.orders,
      quality: stats.data.quality
    });
    return true;
  }
  console.log('❌ Failed to get dashboard stats');
  return false;
};

const testSystemHealth = async () => {
  console.log('\n🏥 Testing System Health...');
  const health = await makeAuthRequest('GET', '/admin/analytics/system-health');
  if (health && health.success) {
    console.log('✅ System health retrieved:', {
      database: health.data.database.status,
      memory: `${health.data.memory.heapUsed}MB used`,
      uptime: `${Math.round(health.data.uptime.process / 60)} minutes`
    });
    return true;
  }
  console.log('❌ Failed to get system health');
  return false;
};

const testPendingProducts = async () => {
  console.log('\n📦 Testing Pending Products...');
  const products = await makeAuthRequest('GET', '/admin/produce/pending');
  if (products && products.success) {
    console.log(`✅ Found ${products.data.docs?.length || 0} pending products`);
    return true;
  }
  console.log('❌ Failed to get pending products');
  return false;
};

const testUserActivity = async () => {
  console.log('\n👥 Testing User Activity...');
  const activity = await makeAuthRequest('GET', '/admin/analytics/user-activity?period=24h');
  if (activity && activity.success) {
    console.log(`✅ Retrieved ${activity.data?.length || 0} recent activities`);
    return true;
  }
  console.log('❌ Failed to get user activity');
  return false;
};

const testTopProducts = async () => {
  console.log('\n🏆 Testing Top Products...');
  const products = await makeAuthRequest('GET', '/admin/analytics/top-products?limit=5');
  if (products && products.success) {
    console.log(`✅ Retrieved ${products.data?.length || 0} top products`);
    return true;
  }
  console.log('❌ Failed to get top products');
  return false;
};

const testNotifications = async () => {
  console.log('\n🔔 Testing Notifications...');
  const notifications = await makeAuthRequest('GET', '/admin/communication/notifications');
  if (notifications && notifications.success) {
    console.log(`✅ Retrieved ${notifications.data?.length || 0} notifications`);
    return true;
  }
  console.log('❌ Failed to get notifications');
  return false;
};

const testCustomerManagement = async () => {
  console.log('\n👤 Testing Customer Management...');
  const customers = await makeAuthRequest('GET', '/admin/customers?page=1&limit=10');
  if (customers && customers.success) {
    console.log(`✅ Retrieved ${customers.data.docs?.length || 0} customers`);
    return true;
  }
  console.log('❌ Failed to get customers');
  return false;
};

const testFarmerManagement = async () => {
  console.log('\n👨‍🌾 Testing Farmer Management...');
  const farmers = await makeAuthRequest('GET', '/admin/farmers?page=1&limit=10');
  if (farmers && farmers.success) {
    console.log(`✅ Retrieved ${farmers.data.docs?.length || 0} farmers`);
    return true;
  }
  console.log('❌ Failed to get farmers');
  return false;
};

const testOrderManagement = async () => {
  console.log('\n📋 Testing Order Management...');
  const orders = await makeAuthRequest('GET', '/admin/orders?page=1&limit=10');
  if (orders && orders.success) {
    console.log(`✅ Retrieved ${orders.data.docs?.length || 0} orders`);
    return true;
  }
  console.log('❌ Failed to get orders');
  return false;
};

const API_URL = 'http://localhost:5000/api/admin/produce/686a07e5055b16157e906204/approve';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NmI0OTQwNDE5OTJjZjdhMjAxOWI5YyIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MTg3NTQyMSwiZXhwIjoxNzUyNDgwMjIxfQ.hWyVgcnNpZ-DlRdEKv2SAPV-ofmwt3n_PcIWhJI0Opo'; // Replace with your valid token

async function testApproveProduct() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes: 'Approved by admin (test script)',
        qualityScore: 8
      })
    });
    const data = await response.json().catch(() => ({}));
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Test script error:', err);
  }
}

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Admin Dashboard Integration Tests...\n');
  
  const tests = [
    { name: 'Admin Login', fn: testAdminLogin },
    { name: 'Dashboard Stats', fn: testDashboardStats },
    { name: 'System Health', fn: testSystemHealth },
    { name: 'Pending Products', fn: testPendingProducts },
    { name: 'User Activity', fn: testUserActivity },
    { name: 'Top Products', fn: testTopProducts },
    { name: 'Notifications', fn: testNotifications },
    { name: 'Customer Management', fn: testCustomerManagement },
    { name: 'Farmer Management', fn: testFarmerManagement },
    { name: 'Order Management', fn: testOrderManagement },
    { name: 'Approve Product', fn: testApproveProduct }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n📈 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Admin dashboard integration is working perfectly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the backend endpoints and ensure all models are properly set up.');
  }
};

// Run the tests
runAllTests().catch(console.error); 