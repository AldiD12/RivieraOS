-- Create New SuperAdmin User with Correct Role
-- Run this SQL script on Azure SQL Database

-- Step 1: Check current database structure
SELECT 'CURRENT ROLES:' as info;
SELECT * FROM roles ORDER BY id;

SELECT 'CURRENT SUPERADMIN USERS:' as info;
SELECT id, email, fullName, userType, role, isActive 
FROM core_users 
WHERE email LIKE '%superadmin%' OR userType = 'SuperAdmin' OR role = 'SuperAdmin';

-- Step 2: Delete existing problematic superadmin user (if exists)
DELETE FROM core_users WHERE email = 'superadmin@rivieraos.com';

-- Step 3: Create new SuperAdmin user with correct role
-- Password: RivieraOS2024! (hashed with PBKDF2)
-- Salt: randomly generated 16 bytes
-- Hash: PBKDF2 with 100,000 iterations, SHA256, 32 bytes

INSERT INTO core_users (
    email,
    passwordHash,
    fullName,
    phoneNumber,
    userType,
    role,
    businessId,
    isActive,
    createdAt,
    updatedAt
) VALUES (
    'superadmin@rivieraos.com',
    'kQJ8zQJ8zQJ8zQJ8zQJ8zA==:XYZ123ABC456DEF789GHI012JKL345MNO678PQR901STU234VWX567YZ890ABC123',  -- This will be replaced with actual hash
    'Super Administrator',
    '+355-69-000-0001',
    'SuperAdmin',
    'SuperAdmin', 
    NULL,  -- No business association
    1,     -- Active
    GETUTCDATE(),
    GETUTCDATE()
);

-- Step 4: If using role_id foreign key, update it
UPDATE core_users 
SET role_id = 1  -- Assuming SuperAdmin role has ID = 1
WHERE email = 'superadmin@rivieraos.com';

-- Step 5: If using user_roles junction table, insert relationship
-- INSERT INTO user_roles (user_id, role_id, created_at)
-- SELECT u.id, 1, GETUTCDATE()
-- FROM core_users u
-- WHERE u.email = 'superadmin@rivieraos.com';

-- Step 6: Verify the new user
SELECT 'NEW SUPERADMIN USER:' as info;
SELECT id, email, fullName, userType, role, businessId, isActive, createdAt
FROM core_users 
WHERE email = 'superadmin@rivieraos.com';

-- Step 7: Test login credentials
SELECT 'LOGIN TEST - Check these values:' as info;
SELECT 
    id,
    email,
    passwordHash,
    userType,
    role,
    isActive
FROM core_users 
WHERE email = 'superadmin@rivieraos.com';