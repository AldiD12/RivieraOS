-- SuperAdmin Database Setup for Azure SQL Database
-- Run these commands in your Azure SQL Database to create the SuperAdmin user

-- 1. Insert SuperAdmin user into core_users table
-- Password: 'RivieraOS2024!' (will be hashed by the API when first used)
-- Note: You'll need to hash the password properly. For now, using a placeholder.

INSERT INTO core_users (
    email,
    password_hash,
    full_name,
    phone_number,
    user_type,
    is_active,
    created_at,
    business_id
) VALUES (
    'superadmin@rivieraos.com',
    '$2a$10$placeholder_hash_will_be_generated_by_api',  -- This will be replaced when user first logs in
    'Super Administrator',
    '+355-000-000-000',
    'SuperAdmin',
    1,
    GETUTCDATE(),
    NULL  -- SuperAdmin is not tied to any specific business
);

-- 2. Alternative: If you want to use a different email
-- UPDATE the email in the INSERT statement above to your preferred SuperAdmin email

-- 3. Verify the user was created
SELECT 
    user_id,
    email,
    full_name,
    user_type,
    is_active,
    created_at
FROM core_users 
WHERE user_type = 'SuperAdmin';

-- 4. IMPORTANT: Password Setup Instructions
-- Since password hashing is handled by the API, you have two options:
-- 
-- Option A: Use the API to register the SuperAdmin user (recommended)
-- - Use the /Auth/register endpoint with the SuperAdmin details
-- - This will properly hash the password
--
-- Option B: Manually hash the password (advanced)
-- - Generate a proper PBKDF2 hash for 'RivieraOS2024!'
-- - Update the password_hash field with the generated hash

-- 5. Grant SuperAdmin permissions (if you have a roles system)
-- This depends on your role-based access control implementation
-- You may need to add entries to user_roles table if it exists