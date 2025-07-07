const API_BASE_URL = 'http://localhost:5000/api';

// Login and get token
async function reset2FA() {
  try {
    console.log('🔄 Resetting 2FA for clean start...\n');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'farmer@test.com',
        password: 'password123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');

    // Step 2: Setup 2FA
    console.log('2. Setting up new 2FA...');
    const setupResponse = await fetch(`${API_BASE_URL}/auth/2fa/setup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!setupResponse.ok) {
      throw new Error('2FA setup failed');
    }

    const setupData = await setupResponse.json();
    console.log('✅ 2FA setup successful');
    console.log('📱 QR Code generated');
    console.log('🔑 Backup codes generated:', setupData.backupCodes.length);
    console.log('🔐 Secret:', setupData.secret.substring(0, 10) + '...');
    
    console.log('\n🎉 2FA has been reset successfully!');
    console.log('📱 Now scan the QR code with your authenticator app');
    console.log('🔢 Enter the 6-digit code from your app to enable 2FA');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the reset
reset2FA(); 