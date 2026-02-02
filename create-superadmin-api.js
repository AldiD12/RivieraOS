// Create New SuperAdmin User via API
// Run this in Node.js or browser console

const AZURE_API_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';

async function createSuperAdminUser() {
    console.log('🔧 Creating new SuperAdmin user...');
    
    try {
        // Step 1: Register new SuperAdmin user
        console.log('📝 Step 1: Registering user via API...');
        
        const registerResponse = await fetch(`${AZURE_API_URL}/Auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'superadmin@rivieraos.com',
                password: 'RivieraOS2024!',
                fullName: 'Super Administrator',
                phoneNumber: '+355-69-000-0001'
            })
        });

        const registerData = await registerResponse.json();
        
        if (registerResponse.ok) {
            console.log('✅ User registered successfully!');
            console.log('User ID:', registerData.userId);
            console.log('Email:', registerData.email);
            console.log('Token:', registerData.token ? 'Generated' : 'Missing');
            
            // Step 2: Now your professor needs to update the role in database
            console.log('\n🔧 Step 2: Professor needs to run this SQL:');
            console.log(`
UPDATE core_users 
SET 
    userType = 'SuperAdmin',
    role = 'SuperAdmin',
    businessId = NULL,
    isActive = 1
WHERE email = 'superadmin@rivieraos.com' AND id = ${registerData.userId};
            `);
            
            return {
                success: true,
                userId: registerData.userId,
                email: registerData.email,
                message: 'User created - needs role update in database'
            };
            
        } else {
            console.error('❌ Registration failed:', registerData);
            
            if (registerData.message && registerData.message.includes('already exists')) {
                console.log('\n🔧 User already exists. Professor should update existing user role:');
                console.log(`
UPDATE core_users 
SET 
    userType = 'SuperAdmin',
    role = 'SuperAdmin',
    businessId = NULL,
    isActive = 1
WHERE email = 'superadmin@rivieraos.com';
                `);
            }
            
            return {
                success: false,
                error: registerData.message || 'Registration failed'
            };
        }
        
    } catch (error) {
        console.error('❌ Network error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test the new SuperAdmin login
async function testSuperAdminLogin() {
    console.log('\n🧪 Testing SuperAdmin login...');
    
    try {
        const loginResponse = await fetch(`${AZURE_API_URL}/Auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'superadmin@rivieraos.com',
                password: 'RivieraOS2024!'
            })
        });

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok) {
            console.log('✅ Login successful!');
            console.log('User ID:', loginData.userId);
            console.log('Email:', loginData.email);
            console.log('Full Name:', loginData.fullName);
            console.log('User Type:', loginData.userType || 'Not provided');
            
            if (loginData.userType === 'SuperAdmin') {
                console.log('🎉 SUCCESS: User has SuperAdmin role!');
                return { success: true, userType: loginData.userType };
            } else {
                console.log('⚠️ WARNING: User type is not SuperAdmin:', loginData.userType);
                console.log('Professor still needs to update the role in database.');
                return { success: false, userType: loginData.userType };
            }
            
        } else {
            console.error('❌ Login failed:', loginData);
            return { success: false, error: loginData.message };
        }
        
    } catch (error) {
        console.error('❌ Login test failed:', error);
        return { success: false, error: error.message };
    }
}

// Run the complete process
async function createAndTestSuperAdmin() {
    console.log('🚀 Starting SuperAdmin creation process...\n');
    
    // Step 1: Create user
    const createResult = await createSuperAdminUser();
    
    if (createResult.success) {
        console.log('\n⏳ Waiting 2 seconds before testing login...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 2: Test login
        const testResult = await testSuperAdminLogin();
        
        if (testResult.success) {
            console.log('\n🎉 COMPLETE SUCCESS: SuperAdmin user is ready!');
        } else {
            console.log('\n⚠️ User created but role needs database update.');
            console.log('Current user type:', testResult.userType);
        }
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('1. User registration:', createResult.success ? '✅ Success' : '❌ Failed');
    console.log('2. Role verification: Needs professor to update database');
    console.log('3. Next step: Professor runs SQL UPDATE command');
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createAndTestSuperAdmin, createSuperAdminUser, testSuperAdminLogin };
} else {
    // Browser environment - make functions available globally
    window.createAndTestSuperAdmin = createAndTestSuperAdmin;
    window.createSuperAdminUser = createSuperAdminUser;
    window.testSuperAdminLogin = testSuperAdminLogin;
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    console.log('🌐 Browser environment detected. Run: createAndTestSuperAdmin()');
}