# 🔍 Complete Backend Analysis - BlackBear Services

## Architecture Overview

### **System Design:**
- **Multi-tenant SaaS** with business isolation
- **JWT authentication** with role-based authorization  
- **Entity Framework Core** with SQL Server
- **Soft delete** + query filters for data protection
- **Hierarchical role system** with policy-based authorization

### **Database Schema:**
```
core_users (id, email, password_hash, phone_number, pin_hash, business_id, is_active)
core_roles (id, role_name, description)  
core_user_roles (user_id, role_id) -- Many-to-many
core_businesses (id, name, ...)
```

## Role System Analysis

### **Available Roles (from migrations):**
1. **SuperAdmin** - System administrator (no businessId)
2. **BusinessOwner** - Business owner (has businessId)
3. **Manager** - Business manager (has businessId)
4. **Staff** - General staff (has businessId)
5. **Guest** - Public users (no businessId)
6. **Barman** - Bar staff (has businessId)
7. **Caderman** - Beach/pool staff (has businessId)

### **Authorization Policies (Program.cs):**
```csharp
"SuperAdmin" -> RequireRole("SuperAdmin")
"BusinessOwner" -> RequireRole("SuperAdmin", "BusinessOwner")  
"Manager" -> RequireRole("SuperAdmin", "BusinessOwner", "Manager")
"Staff" -> RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Staff")
"Barman" -> RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Barman")
"Caderman" -> RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Caderman")
```

### **PIN Login Validation:**
```csharp
// AuthController.cs line 173-175
if (roleName != "Staff" && roleName != "Barman" && roleName != "Manager" && roleName != "Caderman")
{
    return Unauthorized("PIN login is only available for staff members.");
}
```

## Staff Creation Analysis

### **Business Staff Creation (POST /api/business/Staff):**

**Authorization Required:**
```csharp
[Authorize(Policy = "BusinessOwner")]  // ⚠️ CRITICAL: Requires BusinessOwner policy
```

**Allowed Roles:**
```csharp
var allowedRoles = new[] { "Staff", "Manager", "Barman", "Caderman" };
```

**Business Context Required:**
```csharp
var businessId = _currentUserService.BusinessId;  // From JWT businessId claim
if (!businessId.HasValue) {
    return StatusCode(403, "User is not associated with a business");
}
```

**Request Format (BizCreateStaffRequest):**
```json
{
  "email": "required, unique",
  "password": "required, min 6 chars", 
  "fullName": "optional",
  "phoneNumber": "optional",
  "pin": "optional, exactly 4 digits",
  "role": "required, one of: Staff|Manager|Barman|Caderman"
}
```

## 🚨 Identified Issues

### **Issue 1: Authorization Policy Mismatch**
```csharp
[Authorize(Policy = "BusinessOwner")]  // Staff creation endpoint
```
**Problem:** Manager role might not satisfy BusinessOwner policy
**Solution:** Check if Manager login has BusinessOwner in JWT role claim

### **Issue 2: Phone Number Format Mismatch**
```csharp
// Backend normalizes phone numbers
var normalizedPhone = NormalizePhoneNumber(request.PhoneNumber);
// Removes: spaces, dashes, parentheses, plus signs
```
**Problem:** Frontend sends "+1234567890", backend stores "1234567890"
**Solution:** Frontend should normalize before sending OR backend should normalize on storage

### **Issue 3: Business Context Missing**
```csharp
var businessId = _currentUserService.BusinessId;  // From JWT businessId claim
```
**Problem:** JWT token might not contain businessId claim
**Solution:** Verify JWT token contains businessId claim

### **Issue 4: Role Name Exact Match**
```csharp
if (roleName != "Staff" && roleName != "Barman" && roleName != "Manager" && roleName != "Caderman")
```
**Problem:** Case-sensitive exact string matching
**Solution:** Ensure frontend sends exact role names

## Debugging Steps

### **Step 1: Verify JWT Token**
```javascript
// Check JWT token contains required claims
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT Claims:', payload);
// Should contain: businessId, role, sub (userId)
```

### **Step 2: Test Authorization**
```javascript
// Test if Manager can access BusinessOwner endpoints
fetch('/api/business/Staff', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => console.log('Auth test:', r.status))
```

### **Step 3: Test Staff Creation**
```javascript
// Test exact payload format
const staffData = {
  email: "test@example.com",
  password: "password123", 
  fullName: "Test User",
  phoneNumber: "1234567890",  // Normalized format
  pin: "1234",
  role: "Staff"  // Exact case
};
```

### **Step 4: Test PIN Login**
```javascript
// Test with normalized phone number
const loginData = {
  phoneNumber: "1234567890",  // Same format as stored
  pin: "1234"
};
```

## Expected Frontend Fixes

### **1. Role Mapping (DONE):**
```javascript
// Frontend display -> Backend value
"Manager" -> "Manager" ✅
"Bartender" -> "Barman" ✅  
"Staff" -> "Staff" ✅
```

### **2. Phone Number Normalization:**
```javascript
// Normalize phone before sending
const normalizePhone = (phone) => 
  phone.replace(/[\s\-\(\)\+]/g, '');
```

### **3. Authorization Check:**
```javascript
// Verify Manager role has BusinessOwner policy access
// OR change backend to allow Manager for staff creation
```

## Next Steps

1. **Test JWT token contents** - verify businessId and role claims
2. **Test authorization** - check if Manager can access BusinessOwner endpoints  
3. **Test phone normalization** - ensure consistent format
4. **Test exact role names** - verify case-sensitive matching
5. **Check backend logs** - look for specific error messages

## Backend Developer Tasks

If frontend is correct, backend might need:

1. **Change staff creation authorization:**
```csharp
[Authorize(Policy = "Manager")]  // Instead of BusinessOwner
```

2. **Add phone normalization on storage:**
```csharp
user.PhoneNumber = NormalizePhoneNumber(request.PhoneNumber);
```

3. **Add case-insensitive role matching:**
```csharp
if (!allowedRoles.Contains(request.Role, StringComparer.OrdinalIgnoreCase))
```