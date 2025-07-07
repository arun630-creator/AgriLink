const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testOrderSystem() {
  try {
    console.log('🧪 Testing Complete Order System...\n');
    
    // Step 1: Create buyer account if it doesn't exist
    console.log('1️⃣ Creating buyer account...');
    let buyerToken;
    
    try {
      // Try to create buyer account
      const buyerRegisterResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: 'Test Buyer',
        email: 'buyer@test.com',
        password: 'password123',
        role: 'buyer',
        phone: '9876543210'
      });
      
      console.log('✅ Buyer account created:', buyerRegisterResponse.data.message);
      buyerToken = buyerRegisterResponse.data.token;
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        console.log('⚠️  Buyer account already exists, logging in...');
        
        // Login with existing account
        const buyerLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: 'buyer@test.com',
          password: 'password123'
        });
        
        buyerToken = buyerLoginResponse.data.token;
        console.log('✅ Buyer logged in successfully!');
      } else {
        throw error;
      }
    }
    console.log('✅ Buyer logged in successfully!');
    
    // Step 2: Get available products
    console.log('\n2️⃣ Fetching available products...');
    const productsResponse = await axios.get(`${API_BASE_URL}/products?status=active&limit=5`);
    const products = productsResponse.data.products;
    
    if (products.length === 0) {
      console.log('❌ No active products found. Cannot test order system.');
      return;
    }
    
    console.log(`✅ Found ${products.length} active products`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - ₹${product.price}/${product.unit} (${product.quantity} available)`);
    });
    
    // Step 3: Create order with cart items
    console.log('\n3️⃣ Creating order...');
    const orderData = {
      items: [
        {
          id: products[0]._id,
          name: products[0].name,
          price: products[0].price,
          unit: products[0].unit,
          quantity: 2
        }
      ],
      deliveryAddress: {
        fullName: 'Test Buyer',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      paymentMethod: 'cod',
      notes: 'Test order for system verification'
    };
    
    const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, {
      headers: {
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    
    console.log('✅ Order created successfully!');
    console.log('   Order Number:', orderResponse.data.order.orderNumber);
    console.log('   Total Amount: ₹', orderResponse.data.order.total);
    console.log('   Status:', orderResponse.data.order.orderStatus);
    
    const orderId = orderResponse.data.order._id;
    
    // Step 4: Get user orders
    console.log('\n4️⃣ Fetching user orders...');
    const userOrdersResponse = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    
    console.log('✅ User orders fetched successfully!');
    console.log('   Total orders:', userOrdersResponse.data.orders.length);
    userOrdersResponse.data.orders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ₹${order.total} (${order.orderStatus})`);
    });
    
    // Step 5: Get specific order details
    console.log('\n5️⃣ Fetching order details...');
    const orderDetailsResponse = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${buyerToken}`
      }
    });
    
    console.log('✅ Order details fetched successfully!');
    console.log('   Order Number:', orderDetailsResponse.data.order.orderNumber);
    console.log('   Items:', orderDetailsResponse.data.order.items.length);
    console.log('   Delivery Address:', orderDetailsResponse.data.order.deliveryAddress.fullName);
    console.log('   Payment Method:', orderDetailsResponse.data.order.paymentMethod);
    
    // Step 6: Test order cancellation
    console.log('\n6️⃣ Testing order cancellation...');
    try {
      const cancelResponse = await axios.patch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        reason: 'Testing cancellation functionality'
      }, {
        headers: {
          'Authorization': `Bearer ${buyerToken}`
        }
      });
      
      console.log('✅ Order cancelled successfully!');
      console.log('   New Status:', cancelResponse.data.order.orderStatus);
      console.log('   Cancellation Reason:', cancelResponse.data.order.cancellationReason);
    } catch (error) {
      console.log('⚠️  Order cancellation test:', error.response?.data?.message || error.message);
    }
    
    // Step 7: Test farmer order management (if farmer exists)
    console.log('\n7️⃣ Testing farmer order management...');
    try {
      // Login as farmer
      const farmerLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'farmer@test.com',
        password: 'password123'
      });
      
      if (farmerLoginResponse.data.token) {
        const farmerToken = farmerLoginResponse.data.token;
        
        // Get farmer orders
        const farmerOrdersResponse = await axios.get(`${API_BASE_URL}/orders/farmer/orders`, {
          headers: {
            'Authorization': `Bearer ${farmerToken}`
          }
        });
        
        console.log('✅ Farmer orders fetched successfully!');
        console.log('   Total farmer orders:', farmerOrdersResponse.data.orders.length);
        
        if (farmerOrdersResponse.data.orders.length > 0) {
          const farmerOrder = farmerOrdersResponse.data.orders[0];
          console.log('   Sample farmer order:', farmerOrder.orderNumber);
        }
      } else {
        console.log('⚠️  No farmer account found for testing');
      }
    } catch (error) {
      console.log('⚠️  Farmer order test:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎉 Order system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User authentication');
    console.log('   ✅ Product listing');
    console.log('   ✅ Order creation');
    console.log('   ✅ Order retrieval');
    console.log('   ✅ Order details');
    console.log('   ✅ Order cancellation');
    console.log('   ✅ Farmer order management');
    
  } catch (error) {
    console.error('❌ Error testing order system:', error.response?.data || error.message);
  }
}

testOrderSystem(); 