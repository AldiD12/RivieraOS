-- Fix SuperAdmin user role in Azure SQL Database
-- This script should be run directly on the Azure SQL Database

-- First, let's see the current database structure
SELECT 'ROLES TABLE:' as info;
SELECT id, name, description FROM roles ORDER BY id;

SELECT 'USERS TABLE:' as info;
SELECT id, email, fullName, userType, role, businessId, isActive 
FROM core_users 
WHERE email = 'superadmin@rivieraos.com';

SELECT 'ALL USERS WITH ROLES:' as info;
SELECT u.id, u.email, u.fullName, u.userType, u.role, r.name as role_name
FROM core_users u
LEFT JOIN roles r ON u.role_id = r.id
ORDER BY u.id;

-- Fix the SuperAdmin user to have proper role
-- Method 1: If using role_id foreign key
UPDATE core_users 
SET 
    role_id = 1,  -- SuperAdmin role ID
    userType = 'SuperAdmin',
    role = 'SuperAdmin',
    businessId = NULL,
    isActive = 1
WHERE email = 'superadmin@rivieraos.com';

-- Method 2: If using direct role field
UPDATE core_users 
SET 
    userType = 'SuperAdmin',
    role = 'SuperAdmin',
    businessId = NULL,
    isActive = 1
WHERE email = 'superadmin@rivieraos.com';

-- Verify the update
SELECT 'AFTER UPDATE:' as info;
SELECT u.id, u.email, u.fullName, u.userType, u.role, r.name as role_name, u.isActive
FROM core_users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'superadmin@rivieraos.com';

-- Check if there are user_roles junction table
SELECT 'USER_ROLES TABLE (if exists):' as info;
-- SELECT ur.user_id, ur.role_id, u.email, r.name 
-- FROM user_roles ur
-- JOIN core_users u ON ur.user_id = u.id
-- JOIN roles r ON ur.role_id = r.id
-- WHERE u.email = 'superadmin@rivieraos.com';