const axios = require('axios');

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
  console.log('🔐 Testing admin login...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, testAdmin);
    if (response.data.token) {
      adminToken = response.data.token;
      console.log('✅ Admin login successful');
      return true;
    } else {
      console.log('❌ Admin login failed: No token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Admin login error:', error.response?.data?.message || error.message);
    return false;
  }
};

const testDashboardStats = async () => {
  console.log('📊 Testing dashboard stats...');
  const result = await makeAuthRequest('GET', '/admin/analytics/dashboard-stats');
  if (result && result.success) {
    console.log('✅ Dashboard stats:', result.data);
    return true;
  } else {
    console.log('❌ Dashboard stats failed');
    return false;
  }
};

const testSystemHealth = async () => {
  console.log('🏥 Testing system health...');
  const result = await makeAuthRequest('GET', '/admin/analytics/system-health');
  if (result && result.success) {
    console.log('✅ System health:', result.data);
    return true;
  } else {
    console.log('❌ System health failed');
    return false;
  }
};

const testUserManagement = async () => {
  console.log('👥 Testing user management...');
  
  // Test farmers
  const farmersResult = await makeAuthRequest('GET', '/admin/farmers?page=1&limit=10');
  if (farmersResult && farmersResult.success) {
    console.log('✅ Farmers fetched:', farmersResult.data.docs?.length || 0, 'farmers');
  } else {
    console.log('❌ Farmers fetch failed');
  }
  
  // Test customers
  const customersResult = await makeAuthRequest('GET', '/admin/customers?page=1&limit=10');
  if (customersResult && customersResult.success) {
    console.log('✅ Customers fetched:', customersResult.data.docs?.length || 0, 'customers');
  } else {
    console.log('❌ Customers fetch failed');
  }
  
  return true;
};

const testOrderManagement = async () => {
  console.log('📦 Testing order management...');
  const result = await makeAuthRequest('GET', '/admin/orders?page=1&limit=10');
  if (result && result.success) {
    console.log('✅ Orders fetched:', result.data.docs?.length || 0, 'orders');
    return true;
  } else {
    console.log('❌ Orders fetch failed');
    return false;
  }
};

const testQualityControl = async () => {
  console.log('🛡️ Testing quality control...');
  
  // Test flagged products
  const flagsResult = await makeAuthRequest('GET', '/admin/produce/flags?status=pending');
  if (flagsResult && flagsResult.success) {
    console.log('✅ Flagged products fetched:', flagsResult.data.docs?.length || 0, 'flags');
  } else {
    console.log('❌ Flagged products fetch failed');
  }
  
  // Test refund requests
  const refundsResult = await makeAuthRequest('GET', '/admin/orders/refunds?status=pending');
  if (refundsResult && refundsResult.success) {
    console.log('✅ Refund requests fetched:', refundsResult.data.docs?.length || 0, 'refunds');
  } else {
    console.log('❌ Refund requests fetch failed');
  }
  
  return true;
};

const testCommunication = async () => {
  console.log('💬 Testing communication...');
  
  // Test announcements
  const announcementsResult = await makeAuthRequest('GET', '/admin/communication/announcements');
  if (announcementsResult && announcementsResult.success) {
    console.log('✅ Announcements fetched:', announcementsResult.data.docs?.length || 0, 'announcements');
  } else {
    console.log('❌ Announcements fetch failed');
  }
  
  // Test notifications
  const notificationsResult = await makeAuthRequest('GET', '/admin/communication/notifications');
  if (notificationsResult && notificationsResult.success) {
    console.log('✅ Notifications fetched:', notificationsResult.data?.length || 0, 'notifications');
  } else {
    console.log('❌ Notifications fetch failed');
  }
  
  return true;
};

const testAnalytics = async () => {
  console.log('📈 Testing analytics...');
  
  // Test top products
  const topProductsResult = await makeAuthRequest('GET', '/admin/analytics/top-products?limit=10');
  if (topProductsResult && topProductsResult.success) {
    console.log('✅ Top products fetched:', topProductsResult.data?.length || 0, 'products');
  } else {
    console.log('❌ Top products fetch failed');
  }
  
  // Test crop seasons
  const cropSeasonsResult = await makeAuthRequest('GET', '/admin/analytics/crop-seasons');
  if (cropSeasonsResult && cropSeasonsResult.success) {
    console.log('✅ Crop seasons fetched:', cropSeasonsResult.data?.length || 0, 'seasons');
  } else {
    console.log('❌ Crop seasons fetch failed');
  }
  
  // Test user activity
  const userActivityResult = await makeAuthRequest('GET', '/admin/analytics/user-activity?period=7d');
  if (userActivityResult && userActivityResult.success) {
    console.log('✅ User activity fetched:', userActivityResult.data?.length || 0, 'activities');
  } else {
    console.log('❌ User activity fetch failed');
  }
  
  return true;
};

const testProductApprovals = async () => {
  console.log('✅ Testing product approvals...');
  const result = await makeAuthRequest('GET', '/admin/produce/pending');
  if (result && result.success) {
    console.log('✅ Pending products fetched:', result.data.docs?.length || 0, 'products');
    return true;
  } else {
    console.log('❌ Pending products fetch failed');
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting Admin Dashboard Component Tests...\n');
  
  const tests = [
    { name: 'Admin Login', test: testAdminLogin },
    { name: 'Dashboard Stats', test: testDashboardStats },
    { name: 'System Health', test: testSystemHealth },
    { name: 'User Management', test: testUserManagement },
    { name: 'Order Management', test: testOrderManagement },
    { name: 'Quality Control', test: testQualityControl },
    { name: 'Communication', test: testCommunication },
    { name: 'Analytics', test: testAnalytics },
    { name: 'Product Approvals', test: testProductApprovals }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n--- ${test.name} ---`);
    try {
      const result = await test.test();
      if (result) {
        passedTests++;
        console.log(`✅ ${test.name} passed`);
      } else {
        console.log(`❌ ${test.name} failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} error:`, error.message);
    }
  }
  
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All admin components are working correctly!');
  } else {
    console.log('⚠️ Some tests failed. Check the backend endpoints and data.');
  }
};

// Run tests
runAllTests().catch(console.error); 