// Script to create SuperAdmin user in Azure database
// Run this with: node create-superadmin.js

const axios = require('axios');

const AZURE_API_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

async function createSuperAdmin() {
  try {
    console.log('Creating SuperAdmin user...');
    
    const superAdminData = {
      email: 'superadmin@rivieraos.com',
      password: 'RivieraOS2024!',
      fullName: 'Super Administrator',
      phoneNumber: '+355-000-000-000',
      userType: 'SuperAdmin'
    };

    const response = await axios.post(`${AZURE_API_URL}/Auth/register`, superAdminData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200 || response.status === 201) {
      console.log('✅ SuperAdmin user created successfully!');
      console.log('📧 Email: superadmin@rivieraos.com');
      console.log('🔑 Password: RivieraOS2024!');
      console.log('🎯 Role: SuperAdmin');
      console.log('\nYou can now login at /superadmin/login');
    } else {
      console.log('❌ Failed to create SuperAdmin user');
      console.log('Response:', response.data);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status);
      console.log('Message:', error.response.data);
      
      if (error.response.status === 400 && error.response.data.includes('already exists')) {
        console.log('\n✅ SuperAdmin user already exists!');
        console.log('📧 Email: superadmin@rivieraos.com');
        console.log('🔑 Password: RivieraOS2024!');
        console.log('You can login at /superadmin/login');
      }
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
}

// Run the script
createSuperAdmin();