# SuperAdmin Login Success → Dashboard Error Analysis

**Date:** February 18, 2026  
**Status:** NEW DISCOVERY - Error happens AFTER successful login

---

## CORRECTED UNDERSTANDING

### What User Reported
"I'm trying to get directly to `/superadmin/login` with URL, I login with the DB account I created, and IT DOES IT (login succeeds), but then I get the JavaScript error."

### This Changes Everything

**Previous Analysis:** Assumed user was accessing dashboard WITHOUT logging in  
**Actual Situation:** User DOES login successfully, but dashboard crashes when loading

---

## ACTUAL ERROR FLOW

```
User → /superadmin/login
  ↓
Enter credentials (DB account)
  ↓
Click "Access System"
  ↓
✅ POST /api/Auth/login → 200 OK
  ↓
✅ Token stored in localStorage
  ↓
✅ Role set to "SuperAdmin"
  ↓
✅ navigate('/superadmin') called
  ↓
✅ ProtectedRoute checks auth → PASSES
  ↓
✅ SuperAdminDashboard mounts
  ↓
✅ useEffect runs authentication check → PASSES
  ↓
✅ userInfo state is set
  ↓
✅ Second useEffect triggers fetchBusinesses()
  ↓
❌ GET /api/Businesses → 401 Unauthorized
  ↓
❌ Error handler runs
  ↓
❌ JavaScript error: "Cannot access 'qt' before initialization"
  ↓
💥 Dashboard crashes
```

---

## THE REAL PROBLEM

### Token is Valid BUT API Call Still Fails with 401

**Possible Causes:**

1. **Token Format Issue**
   - Token is stored but in wrong format
   - Backend expects different token structure
   - Token missing required claims

2. **Authorization Header Not Added**
   - Axios interceptor not working
   - Token not being sent with request
   - Header format incorrect

3. **Token Expired Immediately**
   - Token has very short expiration
   - Clock skew between client/server
   - Token invalid right after login

4. **Wrong API Endpoint**
   - SuperAdminDashboard calls `/api/Businesses`
   - But token might not have permission for this endpoint
   - Need different endpoint for SuperAdmin

5. **CORS or Network Issue**
   - Preflight request fails
   - Token stripped by proxy
   - Network interceptor issue

---

## INVESTIGATION STEPS

### Step 1: Check Token Storage

After successful login, check browser console:

```javascript
// What's stored?
console.log('token:', localStorage.getItem('token'));
console.log('azure_jwt_token:', localStorage.getItem('azure_jwt_token'));
console.log('role:', localStorage.getItem('role'));
console.log('userId:', localStorage.getItem('userId'));
```

**Expected:**
- `token` or `azure_jwt_token` should have JWT string
- `role` should be "SuperAdmin"
- `userId` should be your user ID

### Step 2: Check Token Format

```javascript
// Decode JWT (paste in browser console)
const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
if (token) {
  const parts = token.split('.');
  console.log('Token parts:', parts.length); // Should be 3
  
  if (parts.length === 3) {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload:', payload);
    console.log('Token expiration:', new Date(payload.exp * 1000));
    console.log('Token issued at:', new Date(payload.iat * 1000));
  }
}
```

**Expected:**
- Token should have 3 parts (header.payload.signature)
- Payload should contain user info and role
- Expiration should be in the future

### Step 3: Check Network Request

Open browser DevTools → Network tab:

1. Login successfully
2. Watch for `/api/Businesses` request
3. Check request headers:
   - Should have `Authorization: Bearer <token>`
4. Check response:
   - Status code (401 means auth failed)
   - Response body (error message)

### Step 4: Check Axios Interceptor

The interceptor in `azureApi.js` should add the token:

```javascript
azureApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Added Authorization header to API call:', config.url);
  } else {
    console.log('⚠️ No token found for API call:', config.url);
  }
  return config;
});
```

**Check console logs:**
- Should see "✅ Added Authorization header" message
- If you see "⚠️ No token found", that's the problem

---

## LIKELY ROOT CAUSES

### Cause 1: SuperAdminDashboard Uses Wrong API Service

**File:** `frontend/src/pages/SuperAdminDashboard.jsx` (Line 4)

```javascript
import { businessApi, staffApi, venueApi, zoneApi, categoryApi, productApi, unitApi } from '../services/superAdminApi.js';
```

**Check:** Does `superAdminApi.js` use the correct axios instance?

**File:** `frontend/src/services/superAdminApi.js`

If it creates its own axios instance WITHOUT the interceptor, that's the problem!

### Cause 2: Token Stored in Wrong Key

**SuperAdminLogin stores:**
```javascript
localStorage.setItem('token', result.token);
localStorage.setItem('azure_jwt_token', result.token);
```

**Axios interceptor reads:**
```javascript
const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
```

**SuperAdminDashboard checks:**
```javascript
const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
```

This should work, but verify both keys are set.

### Cause 3: Circular Dependency in API Services

**Potential circular import:**
```
superAdminApi.js → imports azureApi.js
azureApi.js → imports apiConfig.js
apiConfig.js → imports something that imports superAdminApi.js
```

During initialization, one module tries to use something from another before it's ready.

---

## THE FIX

### Fix 1: Ensure superAdminApi Uses Correct Axios Instance

**Check:** `frontend/src/services/superAdminApi.js`

It should either:
1. Import and use `azureApi` from `azureApi.js` (which has the interceptor)
2. OR create its own instance with the same interceptor

**If it creates its own instance without interceptor:**

```javascript
// BAD - No interceptor
const api = axios.create({
  baseURL: 'https://blackbear-api...',
});

// GOOD - With interceptor
const api = axios.create({
  baseURL: 'https://blackbear-api...',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Fix 2: Add Better Error Handling

**Update:** `frontend/src/pages/SuperAdminDashboard.jsx`

In the `fetchBusinesses` function, add more detailed logging:

```javascript
const fetchBusinesses = useCallback(async () => {
  try {
    setLoading(true);
    
    // Check token before making request
    const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');
    console.log('🔍 Token exists:', !!token);
    console.log('🔍 Token preview:', token ? token.substring(0, 20) + '...' : 'none');
    
    const data = await businessApi.superAdmin.getAll();
    const businessesArray = Array.isArray(data) ? data : data?.items || [];
    setBusinesses(businessesArray);
    setError('');
  } catch (err) {
    console.error('❌ Error fetching businesses:', err);
    console.error('❌ Error response:', err.response);
    console.error('❌ Error status:', err.response?.status);
    console.error('❌ Error data:', err.response?.data);
    
    if (err.response?.status === 401) {
      console.error('❌ 401 Unauthorized - Token invalid or missing');
      localStorage.clear();
      window.location.href = '/superadmin/login';
    } else {
      setError('Failed to fetch businesses: ' + (err.response?.data?.message || err.message));
    }
  } finally {
    setLoading(false);
  }
}, []);
```

### Fix 3: Add Delay Before Fetching Data

Give the token time to be properly stored:

```javascript
useEffect(() => {
  if (userInfo) {
    // Add small delay to ensure token is fully stored
    setTimeout(() => {
      fetchBusinesses();
    }, 100);
  }
}, [userInfo]);
```

---

## TESTING PLAN

### Test 1: Check Token After Login

1. Open browser DevTools → Console
2. Go to `/superadmin/login`
3. Login with credentials
4. Immediately run in console:
   ```javascript
   console.log('Token:', localStorage.getItem('azure_jwt_token'));
   console.log('Role:', localStorage.getItem('role'));
   ```
5. Verify token exists and role is "SuperAdmin"

### Test 2: Check Network Request

1. Open DevTools → Network tab
2. Login successfully
3. Watch for `/api/Businesses` request
4. Click on the request
5. Check "Headers" tab → "Request Headers"
6. Verify `Authorization: Bearer <token>` is present

### Test 3: Manual API Call

After login, try manual API call in console:

```javascript
const token = localStorage.getItem('azure_jwt_token');
fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/Businesses', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

If this works, the token is valid and the problem is in the axios setup.

---

## NEXT STEPS

1. **Check superAdminApi.js** - Verify it has the interceptor
2. **Add console logs** - See what's happening during the API call
3. **Check Network tab** - Verify Authorization header is sent
4. **Test manual fetch** - Confirm token works outside axios

Once we identify which step fails, we can fix it.

---

**END OF ANALYSIS**
