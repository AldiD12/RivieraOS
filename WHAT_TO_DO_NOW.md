# What To Do Now - SuperAdmin Error Fix

**Date:** February 18, 2026

---

## THE SITUATION

✅ You CAN login at `/superadmin/login`  
✅ Login succeeds and stores token  
❌ Dashboard loads but crashes with JavaScript error  
❌ API call to `/api/superadmin/Businesses` returns 401 Unauthorized

---

## THE PROBLEM

The JWT token you get after login is either:
1. Missing the "SuperAdmin" role claim
2. Has wrong role name (e.g., "Superadmin" vs "SuperAdmin")
3. Backend doesn't recognize the token

---

## WHAT TO DO RIGHT NOW

### Step 1: Run Diagnostics (2 minutes)

1. Login at `/superadmin/login`
2. Open browser console (F12)
3. Paste this code and press Enter:

```javascript
// Check what's stored
console.log('=== STORED DATA ===');
console.log('Token exists:', !!localStorage.getItem('azure_jwt_token'));
console.log('Role:', localStorage.getItem('role'));

// Decode token
const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('=== TOKEN PAYLOAD ===');
  console.log(JSON.stringify(payload, null, 2));
  console.log('=== EXPIRATION ===');
  console.log('Expires:', new Date(payload.exp * 1000));
  console.log('Now:', new Date());
  console.log('Expired?', new Date() > new Date(payload.exp * 1000));
}
```

4. Copy the entire console output
5. Send it to me

### Step 2: Check Network Tab (1 minute)

1. Open DevTools → Network tab
2. Refresh the page
3. Find the request to `/api/superadmin/Businesses`
4. Click on it
5. Take screenshot of:
   - Request Headers (especially Authorization)
   - Response (status code and body)
6. Send screenshots to me

### Step 3: Check Database (Ask Professor Kristi)

Ask Professor Kristi to run this query:

```sql
SELECT Id, Email, Role, IsActive, CreatedAt
FROM Users
WHERE Email = 'your-email-here@example.com';
```

**What to check:**
- `Role` column should be exactly "SuperAdmin" (check capitalization)
- `IsActive` should be `true` or `1`

---

## QUICK FIXES TO TRY

### Fix 1: Case-Insensitive Role Check (Already Done)

We already fixed SuperAdminLogin.jsx to accept any case:
```javascript
const userTypeUpper = (userType || '').toUpperCase();
const isSuperAdmin = 
  userTypeUpper === 'SUPERADMIN' || 
  userTypeUpper === 'SYSTEMADMIN';
```

This should work regardless of database capitalization.

### Fix 2: Check Backend Role Name

The backend might expect a different role name. Common variations:
- "SuperAdmin"
- "Superadmin"
- "SystemAdmin"
- "Admin"

Ask Professor Kristi what role name the backend expects for `/api/superadmin/*` endpoints.

### Fix 3: Verify Backend Endpoint Exists

The endpoint `/api/superadmin/Businesses` might not exist or might require different authentication.

Try this in console after login:

```javascript
// Test different endpoints
const token = localStorage.getItem('azure_jwt_token');

// Try regular endpoint
fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/Businesses', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => console.log('/api/Businesses:', r.status))
.catch(e => console.error('/api/Businesses error:', e));

// Try superadmin endpoint
fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/Businesses', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => console.log('/api/superadmin/Businesses:', r.status))
.catch(e => console.error('/api/superadmin/Businesses error:', e));
```

---

## MOST LIKELY SOLUTION

Based on similar issues, the problem is usually:

**The backend JWT doesn't include the role claim, or includes it with a different name.**

### Backend Fix Needed (Ask Professor Kristi)

The backend login endpoint (`/api/Auth/login`) needs to:

1. Check user's role in database
2. Include role in JWT token claims
3. Use correct claim name (e.g., "role" or "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")

**Example backend code (C#):**
```csharp
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Email, user.Email),
    new Claim(ClaimTypes.Role, user.Role), // ← This is critical!
    new Claim("userType", user.Role)
};
```

---

## TEMPORARY WORKAROUND

If you need to test the dashboard NOW while waiting for backend fix:

### Option 1: Use Regular Business Endpoint

Change SuperAdminDashboard to use `/api/Businesses` instead of `/api/superadmin/Businesses`:

**File:** `frontend/src/pages/SuperAdminDashboard.jsx` (Line 682)

```javascript
// Change from:
const data = await businessApi.superAdmin.getAll();

// To:
const data = await businessApi.getAll();
```

This might work if the regular endpoint doesn't require SuperAdmin role.

### Option 2: Mock Data for Testing

Add mock data fallback:

```javascript
const fetchBusinesses = useCallback(async () => {
  try {
    setLoading(true);
    const data = await businessApi.superAdmin.getAll();
    const businessesArray = Array.isArray(data) ? data : data?.items || [];
    setBusinesses(businessesArray);
    setError('');
  } catch (err) {
    console.error('Error fetching businesses:', err);
    if (err.response?.status === 401) {
      // Use mock data for testing
      console.log('⚠️ Using mock data for testing');
      setBusinesses([
        {
          id: 1,
          registeredName: 'Test Business',
          brandName: 'Test Brand',
          contactEmail: 'test@example.com',
          isActive: true
        }
      ]);
      setError('Using mock data - backend authentication needs configuration');
    }
  } finally {
    setLoading(false);
  }
}, []);
```

---

## SEND ME THIS INFO

To help you fix this, I need:

1. ✅ Console output from Step 1 (token payload)
2. ✅ Screenshot from Step 2 (network request)
3. ✅ Database query result from Step 3 (user role)
4. ✅ Console output from Fix 3 test (endpoint status codes)

With this info, I can tell you exactly what's wrong and how to fix it!

---

**TL;DR:** Run the diagnostic code in browser console after login and send me the output. The issue is almost certainly that the JWT token doesn't have the correct role claim.
