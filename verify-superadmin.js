// Script to verify SuperAdmin user exists in Azure database
const axios = require('axios');

const AZURE_BASE_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

async function testSuperAdminLogin() {
  console.log('🔐 Testing SuperAdmin authentication...');
  
  try {
    const response = await axios.post(`${AZURE_BASE_URL}/Auth/login`, {
      email: 'superadmin@rivieraos.com',
      password: 'RivieraOS2024!'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SuperAdmin login successful!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.token) {
      console.log('✅ JWT token received');
      
      // Test authenticated endpoint
      const businessResponse = await axios.get(`${AZURE_BASE_URL}/Businesses`, {
        headers: {
          'Authorization': `Bearer ${response.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Authenticated API call successful');
      console.log('Businesses found:', businessResponse.data.length);
    }
    
  } catch (error) {
    console.error('❌ SuperAdmin login failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Error Message:', error.message);
    
    if (error.response?.status === 401) {
      console.log('🔍 This suggests the SuperAdmin user does not exist or password is incorrect');
    }
  }
}

async function testRegularUserLogin() {
  console.log('\n🔐 Testing regular user authentication...');
  
  try {
    const response = await axios.post(`${AZURE_BASE_URL}/Auth/login`, {
      email: 'marco@hotelcoral.al',
      password: '111111'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Regular user login successful!');
    console.log('Response status:', response.status);
    console.log('User data:', JSON.stringify(response.data.user, null, 2));
    
  } catch (error) {
    console.error('❌ Regular user login failed:');
    console.error('Status:', error.response?.status);
    console.error('Error Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Run tests
testSuperAdminLogin().then(() => {
  return testRegularUserLogin();
}).catch(console.error);