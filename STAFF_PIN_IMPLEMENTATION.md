# Staff PIN Implementation - Backend Requirements

## Overview
Added PIN field to SuperAdmin staff creation/editing to enable PIN-based login for multiple businesses.

## Frontend Changes Made ✅
- ✅ Added PIN field to CreateStaffModal
- ✅ Added PIN field to EditStaffModal  
- ✅ Added PIN to staffForm state
- ✅ Added PIN display in staff cards (masked as ****X)
- ✅ Added PIN validation (4 digits only)
- ✅ Added PIN to resetStaffForm function
- ✅ Added PIN to openEditStaffModal function

## Backend Requirements Needed

### 1. Database Schema Update
**NO SCHEMA CHANGES NEEDED!** 

Use the existing `password_hash` field to store the hashed PIN. This is much cleaner because:
- ✅ No database migration required
- ✅ Uses existing PBKDF2 security infrastructure  
- ✅ Maintains current authentication flow
- ✅ Simpler implementation

### 2. API Endpoint Updates

#### Update User Creation Endpoint
**POST /api/superadmin/businesses/{businessId}/Users**

**Instead of adding a PIN field, hash the PIN and store it as the password:**

Frontend sends:
```json
{
  "email": "marco@hotelcoral.al",
  "password": "1111",  // ← PIN goes here (will be hashed)
  "fullName": "Marco Rossi",
  "phoneNumber": "+355123456789",
  "role": "Staff"
}
```

Backend should:
1. Validate PIN format (exactly 4 digits)
2. Hash the PIN using existing PBKDF2 method
3. Store hashed PIN in `password_hash` field
4. Validate PIN uniqueness within business scope

#### Update User Update Endpoint
**PUT /api/superadmin/businesses/{businessId}/Users/{id}**

When updating a user's PIN:
1. Frontend sends new PIN in `password` field
2. Backend validates PIN format (4 digits)
3. Backend hashes PIN and updates `password_hash`
4. Backend validates PIN uniqueness within business

#### Update User Response DTOs
**No changes needed to response DTOs** - the PIN should never be returned in API responses for security. Frontend will display PIN as masked (****X) based on what it sent.

### 3. PIN Validation Rules
- **Length**: Exactly 4 digits
- **Format**: Numeric only (0000-9999)  
- **Uniqueness**: PIN must be unique within each business (check before hashing)
- **Required**: PIN is mandatory for staff creation
- **Storage**: Hash PIN using existing PBKDF2 method and store in `password_hash` field

### 4. Login System Update
Update the regular staff login to support PIN-based authentication using existing password field:

**Current hardcoded system:**
```javascript
const waiterMap = {
  '1111': { email: 'marco@hotelcoral.al', password: '111111' },
  '2222': { email: 'sofia@hotelcoral.al', password: '222222' },
  '3333': { email: 'luca@hotelcoral.al', password: '333333' }
};
```

**Should become dynamic lookup using existing auth system:**
```javascript
// When user enters PIN "1111":
// 1. Look up user by email (marco@hotelcoral.al) 
// 2. Verify PIN "1111" against stored password_hash using existing hash verification
// 3. If valid, authenticate user normally

// The PIN is essentially the user's password now
const loginResult = await authenticateUser(userEmail, enteredPIN);
```

**Implementation approach:**
1. Keep the PIN→email mapping for now (1111→marco@hotelcoral.al)
2. Use existing `/api/Auth/login` endpoint with email + PIN
3. Backend verifies PIN against `password_hash` using existing verification logic

### 5. Business Context & PIN Uniqueness
Since we have multiple businesses, PIN uniqueness should be enforced per business:

**Recommended approach:**
- PINs unique per business (not globally)
- Before hashing PIN, check if PIN already exists for that business
- Return validation error if PIN already exists

**Implementation:**
```sql
-- Check PIN uniqueness before creating/updating user
SELECT COUNT(*) FROM core_users 
WHERE business_id = @businessId 
AND id != @userId  -- Exclude current user when updating
AND EXISTS (
  -- Check if any user in this business has this PIN
  -- This requires checking the hashed PIN, which is complex
  -- Alternative: maintain a separate PIN lookup table
);
```

**Alternative simpler approach:**
Add a `pin_plaintext` column temporarily for uniqueness checking, but still store hashed PIN in `password_hash` for authentication.

## Testing Checklist
After backend implementation:

1. ✅ Create staff with PIN through SuperAdmin
2. ✅ Verify PIN appears in staff list (masked)
3. ✅ Edit staff and change PIN
4. ✅ Verify PIN uniqueness validation
5. ✅ Test staff login with new PIN
6. ✅ Test PIN login routes to correct dashboard
7. ✅ Test multiple businesses with same PIN (should fail)

## Priority
**HIGH** - This enables proper staff management for multiple businesses.

## Current Status
- **Frontend**: ✅ Complete - PIN fields added to all forms
- **Backend**: ❌ Pending - Database and API updates needed
- **Login System**: ❌ Pending - Dynamic PIN lookup needed

---

**Next Steps for Backend Developer:**
1. ✅ **No database changes needed** - use existing `password_hash` field
2. Update user creation/update endpoints to:
   - Validate PIN format (4 digits only)
   - Check PIN uniqueness within business before hashing
   - Hash PIN using existing PBKDF2 method
   - Store hashed PIN in `password_hash` field
3. Update login system to use existing auth flow with PIN as password
4. Test PIN creation, uniqueness validation, and login functionality

**This approach is much simpler and cleaner than adding a new PIN column!**