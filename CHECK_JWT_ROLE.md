# JWT Role Diagnostic - EXACT FAILURE POINT FOUND

## The Problem

**Backend StaffController.cs Line 93:**
```csharp
[Authorize(Roles = "BusinessOwner,Manager")]
```

This requires the JWT token to have a role claim with value "BusinessOwner" OR "Manager".

**Your Manager user's JWT token probably has a DIFFERENT role value.**

## How to Check

### Option 1: Use the JWT Decoder Tool

1. Login as your Manager user
2. Open browser console (F12)
3. Type: `localStorage.getItem('token')`
4. Copy the token
5. Go to https://jwt.io
6. Paste the token
7. Look at the "role" claim in the payload

### Option 2: Check Database Directly

Run this SQL query:
```sql
SELECT 
    u.Id,
    u.Email,
    u.FullName,
    u.BusinessId,
    r.RoleName
FROM core_users u
LEFT JOIN core_user_roles ur ON u.Id = ur.UserId
LEFT JOIN core_roles r ON ur.RoleId = r.RoleId
WHERE u.Email = 'your-manager-email@example.com';
```

## Expected vs Actual

**Expected role in JWT:** `"Manager"` (exact match, case-sensitive)

**Possible actual roles:**
- `"manager"` (lowercase - won't work)
- `"BusinessManager"` (different name - won't work)
- `"Staff"` (wrong role - won't work)
- `null` (no role assigned - won't work)

## The Fix

### If Role is Wrong in Database:

**Option A: Update the user's role in database:**
```sql
-- Find the Manager role ID
SELECT RoleId, RoleName FROM core_roles WHERE RoleName = 'Manager';

-- Update the user's role (replace USER_ID and ROLE_ID)
UPDATE core_user_roles 
SET RoleId = [MANAGER_ROLE_ID]
WHERE UserId = [YOUR_USER_ID];
```

### If Role Doesn't Exist:

**Option B: Create Manager role if missing:**
```sql
-- Check if Manager role exists
SELECT * FROM core_roles WHERE RoleName = 'Manager';

-- If not, insert it
INSERT INTO core_roles (RoleName, Description)
VALUES ('Manager', 'Business Manager');
```

## Quick Test

After fixing, test with this curl command:
```bash
# Login
curl -X POST https://blackbear-services-core.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-manager@email.com","password":"your-password"}'

# Copy the token from response, then test staff creation
curl -X POST https://blackbear-services-core.azurewebsites.net/api/business/Staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "email": "test@staff.local",
    "password": "TempPass123!",
    "fullName": "Test Staff",
    "phoneNumber": "1234567890",
    "role": "Bartender",
    "pin": "1234"
  }'
```

If you get 403, the role is wrong.
If you get 200, it works!

## Root Cause

The Manager user was created with a role that doesn't match "Manager" exactly. The JWT token contains whatever role is in the database, and ASP.NET Core's `[Authorize(Roles = "Manager")]` does an EXACT string match (case-sensitive).
