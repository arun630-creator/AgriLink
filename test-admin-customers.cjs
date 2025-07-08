const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const ADMIN_JWT_TOKEN = process.env.ADMIN_JWT_TOKEN || '<PASTE_YOUR_ADMIN_JWT_TOKEN_HERE>';

console.log('--- Test Script Startup ---');
console.log('API_BASE_URL:', API_BASE_URL);
console.log('ADMIN_JWT_TOKEN:', ADMIN_JWT_TOKEN && ADMIN_JWT_TOKEN.length > 10 ? ADMIN_JWT_TOKEN.slice(0, 10) + '...' : ADMIN_JWT_TOKEN);

if (!ADMIN_JWT_TOKEN || ADMIN_JWT_TOKEN.includes('<PASTE')) {
  console.error('❌ Please set your admin JWT token in the ADMIN_JWT_TOKEN env variable or in the script.');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${ADMIN_JWT_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testListCustomers() {
  console.log('\n➡️  Testing: List Customers');
  const res = await axios.get(`${API_BASE_URL}/admin/customers?page=1&limit=2`, { headers });
  console.log('Status:', res.status);
  console.log('Customers:', res.data.data.docs ? res.data.data.docs.map(u => u.email) : res.data.data.map(u => u.email));
  return res.data.data.docs ? res.data.data.docs : res.data.data;
}

async function testGetCustomerDetails(customerId) {
  console.log(`\n➡️  Testing: Get Customer Details (${customerId})`);
  const res = await axios.get(`${API_BASE_URL}/admin/customers/${customerId}`, { headers });
  console.log('Status:', res.status);
  console.log('Customer:', res.data.data.customer.email);
  return res.data.data.customer;
}

async function testFlagCustomer(customerId) {
  console.log(`\n➡️  Testing: Flag Customer (${customerId})`);
  const res = await axios.post(`${API_BASE_URL}/admin/customers/${customerId}/flag`, { flagged: true, reason: 'Test flag for misconduct' }, { headers });
  console.log('Status:', res.status);
  console.log('Flagged:', res.data.data.flagged, 'Reason:', res.data.data.flagReason);
}

async function testUnflagCustomer(customerId) {
  console.log(`\n➡️  Testing: Unflag Customer (${customerId})`);
  const res = await axios.post(`${API_BASE_URL}/admin/customers/${customerId}/flag`, { flagged: false }, { headers });
  console.log('Status:', res.status);
  console.log('Flagged:', res.data.data.flagged);
}

async function testSuspendCustomer(customerId) {
  console.log(`\n➡️  Testing: Suspend Customer (${customerId})`);
  const res = await axios.post(`${API_BASE_URL}/admin/customers/${customerId}/suspend`, { suspend: true, reason: 'Test suspension' }, { headers });
  console.log('Status:', res.status);
  console.log('Account Status:', res.data.data.accountStatus);
}

async function testUnsuspendCustomer(customerId) {
  console.log(`\n➡️  Testing: Unsuspend Customer (${customerId})`);
  const res = await axios.post(`${API_BASE_URL}/admin/customers/${customerId}/suspend`, { suspend: false }, { headers });
  console.log('Status:', res.status);
  console.log('Account Status:', res.data.data.accountStatus);
}

async function testCustomerSegments() {
  console.log(`\n➡️  Testing: Customer Segments`);
  const res = await axios.get(`${API_BASE_URL}/admin/customers/stats/segments`, { headers });
  console.log('Status:', res.status);
  console.log('Segments:', res.data.data);
}

async function runTests() {
  try {
    console.log('--- Running Customer Management Tests ---');
    const customers = await testListCustomers();
    if (!customers.length) {
      console.log('No customers found to test details/flag/suspend.');
      return;
    }
    const customerId = customers[0]._id;
    await testGetCustomerDetails(customerId);
    await testFlagCustomer(customerId);
    await testUnflagCustomer(customerId);
    await testSuspendCustomer(customerId);
    await testUnsuspendCustomer(customerId);
    await testCustomerSegments();
    console.log('\n✅ All customer management tests completed!');
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Error:', error.message);
      if (error.stack) console.error(error.stack);
    }
  }
}

runTests(); 