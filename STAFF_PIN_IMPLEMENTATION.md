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
Add PIN column to users table:
```sql
ALTER TABLE users ADD COLUMN pin VARCHAR(4);
-- Add unique constraint for PIN within business scope
ALTER TABLE users ADD CONSTRAINT unique_business_pin UNIQUE (business_id, pin);
```

### 2. API Endpoint Updates

#### Update User Creation Endpoint
**POST /api/superadmin/businesses/{businessId}/Users**

Current request body:
```json
{
  "email": "string",
  "password": "string", 
  "fullName": "string",
  "phoneNumber": "string",
  "role": "string"
}
```

**Add PIN field:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string", 
  "phoneNumber": "string",
  "role": "string",
  "pin": "string"  // ← ADD THIS
}
```

#### Update User Update Endpoint
**PUT /api/superadmin/businesses/{businessId}/Users/{id}**

Add PIN field to UpdateUserRequest schema.

#### Update User Response DTOs
Add PIN field to UserSummaryDto and UserDetailDto:
```json
{
  "id": 1,
  "email": "string",
  "fullName": "string",
  "phoneNumber": "string", 
  "role": "string",
  "pin": "string",  // ← ADD THIS
  "isActive": true
}
```

### 3. PIN Validation Rules
- **Length**: Exactly 4 digits
- **Format**: Numeric only (0000-9999)
- **Uniqueness**: PIN must be unique within each business
- **Required**: PIN is mandatory for staff creation

### 4. Login System Update
Update the regular staff login to support PIN-based authentication:

**Current hardcoded system:**
```javascript
const waiterMap = {
  '1111': { email: 'marco@hotelcoral.al', password: '111111' },
  '2222': { email: 'sofia@hotelcoral.al', password: '222222' },
  '3333': { email: 'luca@hotelcoral.al', password: '333333' }
};
```

**Should become dynamic lookup:**
```javascript
// Look up user by PIN in database
const user = await getUserByPin(pin);
if (user && user.isActive) {
  // Authenticate with user's actual credentials
  return authenticateUser(user.email, user.password);
}
```

### 5. Business Context
Since we have multiple businesses, PIN lookup should consider business context:
- Option A: PINs unique globally across all businesses
- Option B: PINs unique per business (recommended)

If Option B, the login system needs to know which business the PIN belongs to.

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

**Next Steps:**
1. Backend developer adds PIN column to database
2. Backend developer updates API endpoints to handle PIN
3. Backend developer updates login system for dynamic PIN lookup
4. Test PIN creation and login functionality