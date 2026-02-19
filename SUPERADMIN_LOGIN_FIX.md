# SuperAdmin Login Issue - February 19, 2026

## Problem
SuperAdmin login is not working - user cannot access /superadmin dashboard.

## Root Cause Analysis

### Issue 1: Role Validation Logic
**File**: `frontend/src/services/auth.js`
**Function**: `hasRole(requiredRole)`

```javascript
export const hasRole = (requiredRole) => {
  const role = getRole();
  return role === requiredRole;  // EXACT MATCH REQUIRED
};
```

**Problem**: The role must EXACTLY match "SuperAdmin" (case-sensitive).

### Issue 2: Login Response Handling
**File**: `frontend/src/pages/LoginPage.jsx`
**Function**: `handleManagerSubmit()`

The login stores the role from backend response:
```javascript
const role = data.role;
localStorage.setItem('role', role);
```

**Potential Issues**:
1. Backend might return "superadmin" (lowercase) instead of "SuperAdmin"
2. Backend might return "Super Admin" (with space)
3. Backend might return different role name

### Issue 3: Route Protection
**File**: `frontend/src/App.jsx`

```javascript
<ProtectedRoute role="SuperAdmin">
  <SuperAdminDashboard />
</ProtectedRoute>
```

**Requirement**: localStorage role must be EXACTLY "SuperAdmin"

## Diagnostic Steps

### Step 1: Check What Backend Returns
Open browser console and try to login as SuperAdmin. Check the console logs:

```javascript
console.log('✅ Manager login response:', data);
console.log('Role stored:', role);
```

Look for the role value in the response.

### Step 2: Check localStorage After Login
After attempting SuperAdmin login, open browser console and run:

```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));
console.log('UserId:', localStorage.getItem('userId'));
```

### Step 3: Check Backend Role Name
Ask Prof Kristi: "What role name does the backend return for SuperAdmin users?"

Possible values:
- "SuperAdmin" ✅ (correct)
- "superadmin" ❌ (wrong case)
- "Super Admin" ❌ (has space)
- "Admin" ❌ (wrong name)

## Quick Fix Options

### Option 1: Normalize Role in Frontend (RECOMMENDED)
Update LoginPage to normalize the role:

```javascript
// In handleManagerSubmit, after getting role from backend
let normalizedRole = role;

// Normalize common variations
if (role.toLowerCase() === 'superadmin' || role.toLowerCase() === 'super admin') {
  normalizedRole = 'SuperAdmin';
}

localStorage.setItem('role', normalizedRole);
```

### Option 2: Update hasRole to Be Case-Insensitive
Update auth.js:

```javascript
export const hasRole = (requiredRole) => {
  const role = getRole();
  if (!role || !requiredRole) return false;
  return role.toLowerCase() === requiredRole.toLowerCase();
};
```

### Option 3: Ask Backend to Fix Role Name
Ask Prof Kristi to ensure backend returns exactly "SuperAdmin" for super admin users.

## Testing Instructions

### Test 1: Check Console Logs
1. Open https://riviera-os.vercel.app/login
2. Open browser console (F12)
3. Switch to "Manager Login" tab
4. Enter SuperAdmin credentials
5. Click "Sign In"
6. Check console for:
   - "✅ Manager login response:" - see what role is returned
   - "✅ Manager login successful:" - see what role is stored

### Test 2: Check localStorage
After login attempt, run in console:
```javascript
localStorage.getItem('role')
```

Expected: "SuperAdmin"
If different: That's the problem!

### Test 3: Manual Override (Temporary)
If you need immediate access, run in console:
```javascript
localStorage.setItem('role', 'SuperAdmin');
window.location.href = '/superadmin';
```

This will manually set the correct role and redirect.

## Implementation Plan

### If Backend Returns Wrong Role Name:
1. Add role normalization in LoginPage.jsx
2. Map backend role to frontend role
3. Test login again

### If Backend Returns Correct Role:
1. Check for typos in ProtectedRoute
2. Check for case sensitivity issues
3. Check if role is being overwritten somewhere

## Code Fix (If Backend Returns "superadmin")

```javascript
// In LoginPage.jsx, handleManagerSubmit function
// After line: const role = data.role;

// Normalize role name to match ProtectedRoute expectations
const roleMapping = {
  'superadmin': 'SuperAdmin',
  'super admin': 'SuperAdmin',
  'SUPERADMIN': 'SuperAdmin',
  'owner': 'Owner',
  'manager': 'Manager',
  'Manager': 'Manager',
  'bartender': 'Bartender',
  'Bartender': 'Bartender',
  'collector': 'Collector',
  'Collector': 'Collector'
};

const normalizedRole = roleMapping[role.toLowerCase()] || role;

console.log('🔄 Role normalization:', {
  original: role,
  normalized: normalizedRole
});

// Store normalized role
localStorage.setItem('role', normalizedRole);
```

## Next Steps

1. **IMMEDIATE**: Check console logs during login to see what role backend returns
2. **IF WRONG ROLE**: Implement role normalization fix
3. **IF CORRECT ROLE**: Check for other issues (token, userId, etc.)
4. **TEST**: Try login again after fix

## Questions for Prof Kristi

1. What role name does the backend return for SuperAdmin users?
2. Is it case-sensitive? ("SuperAdmin" vs "superadmin")
3. Can you check the JWT token to see what role claim is included?

## Expected Behavior

After fix:
1. SuperAdmin logs in with email/password
2. Backend returns role (any case/format)
3. Frontend normalizes to "SuperAdmin"
4. localStorage stores "SuperAdmin"
5. ProtectedRoute allows access to /superadmin
6. SuperAdminDashboard loads successfully

