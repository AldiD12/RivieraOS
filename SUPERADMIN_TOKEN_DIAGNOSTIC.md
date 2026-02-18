# SuperAdmin Token Diagnostic Guide

**Date:** February 18, 2026  
**Issue:** Login succeeds but dashboard gets 401 error

---

## QUICK DIAGNOSTIC STEPS

### Step 1: Check What's Stored After Login

Right after you login successfully, open browser console (F12) and run:

```javascript
console.log('=== TOKEN CHECK ===');
console.log('token:', localStorage.getItem('token'));
console.log('azure_jwt_token:', localStorage.getItem('azure_jwt_token'));
console.log('role:', localStorage.getItem('role'));
console.log('userId:', localStorage.getItem('userId'));
console.log('userName:', localStorage.getItem('userName'));
console.log('userEmail:', localStorage.getItem('userEmail'));
```

**What to look for:**
- ✅ `azure_jwt_token` should have a long string (JWT)
- ✅ `role` should be "SuperAdmin"
- ✅ `userId` should be your user ID
- ❌ If any are missing, that's the problem

---

### Step 2: Decode the JWT Token

Copy the token from Step 1 and run:

```javascript
const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');

if (token) {
  const parts = token.split('.');
  console.log('=== TOKEN STRUCTURE ===');
  console.log('Token parts:', parts.length, '(should be 3)');
  
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(atob(parts[1]));
      console.log('=== TOKEN PAYLOAD ===');
      console.log(JSON.stringify(payload, null, 2));
      
      console.log('=== TOKEN TIMES ===');
      console.log('Issued at:', new Date(payload.iat * 1000));
      console.log('Expires at:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date());
      console.log('Token expired?', new Date() > new Date(payload.exp * 1000));
      
      console.log('=== TOKEN CLAIMS ===');
      console.log('Role claim:', payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
      console.log('Email claim:', payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']);
      console.log('User ID claim:', payload.sub || payload.nameid);
    } catch (e) {
      console.error('❌ Failed to decode token:', e);
    }
  } else {
    console.error('❌ Invalid token format - should have 3 parts separated by dots');
  }
} else {
  console.error('❌ No token found!');
}
```

**What to look for:**
- ✅ Token should have 3 parts (header.payload.signature)
- ✅ Expiration should be in the FUTURE
- ✅ Role claim should be "SuperAdmin" or "Superadmin"
- ❌ If expired, token is invalid
- ❌ If role is wrong, backend won't authorize

---

### Step 3: Check Network Request

1. Open DevTools → Network tab
2. Clear the network log
3. Refresh the page (or login again)
4. Look for the request to `/api/superadmin/Businesses`
5. Click on it
6. Check the "Headers" tab

**Request Headers - Should see:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Response - If 401:**
```
Status: 401 Unauthorized
```

**Take a screenshot of:**
- Request Headers (especially Authorization header)
- Response body (error message)

---

### Step 4: Manual API Test

After login, test the API directly in console:

```javascript
const token = localStorage.getItem('azure_jwt_token') || localStorage.getItem('token');

console.log('=== MANUAL API TEST ===');
console.log('Token:', token ? token.substring(0, 30) + '...' : 'MISSING');

fetch('https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/Businesses', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  return response.json();
})
.then(data => {
  console.log('✅ API call succeeded!');
  console.log('Data:', data);
})
.catch(error => {
  console.error('❌ API call failed:', error);
});
```

**What to look for:**
- ✅ If status is 200, token is valid!
- ❌ If status is 401, token is invalid or user lacks permission
- ❌ If status is 403, user is authenticated but not authorized

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: Token Has Wrong Role

**Symptom:** Token exists but role claim is not "SuperAdmin"

**Check:**
```javascript
const token = localStorage.getItem('azure_jwt_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Role in token:', payload.role);
```

**Solution:** 
- Check database - user's role must be "Superadmin" or "SuperAdmin"
- Backend must include correct role in JWT when issuing token
- Ask Professor Kristi to verify user role in database

---

### Issue 2: Token Expired Immediately

**Symptom:** Token expires right after login

**Check:**
```javascript
const token = localStorage.getItem('azure_jwt_token');
const payload = JSON.parse(atob(token.split('.')[1]));
const expiresAt = new Date(payload.exp * 1000);
const now = new Date();
console.log('Expires:', expiresAt);
console.log('Now:', now);
console.log('Time until expiry:', (expiresAt - now) / 1000, 'seconds');
```

**Solution:**
- Backend needs to issue tokens with longer expiration
- Check backend JWT configuration
- Typical expiration: 1-24 hours

---

### Issue 3: Backend Doesn't Recognize Token

**Symptom:** Token looks valid but backend returns 401

**Possible causes:**
1. **Wrong signing key** - Backend uses different secret to verify token
2. **Token format mismatch** - Backend expects different claims
3. **Endpoint requires different permission** - `/superadmin/*` endpoints need special permission

**Solution:**
- Check backend logs for JWT validation errors
- Verify backend JWT configuration matches token issuer
- Confirm `/superadmin/Businesses` endpoint allows SuperAdmin role

---

### Issue 4: CORS or Network Issue

**Symptom:** Request doesn't reach backend

**Check browser console for:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
- Backend needs to allow CORS from frontend origin
- Check backend CORS configuration
- Verify API URL is correct

---

## WHAT TO SEND ME

After running the diagnostics, send me:

1. **Console output from Step 1** (what's stored)
2. **Console output from Step 2** (decoded token payload)
3. **Screenshot of Network tab** (Request Headers + Response)
4. **Console output from Step 4** (manual API test result)

With this information, I can tell you exactly what's wrong!

---

## MOST LIKELY ISSUE

Based on the error pattern, the most likely issue is:

**The JWT token doesn't have the correct role claim that the backend expects.**

The backend `/api/superadmin/Businesses` endpoint probably checks:
```csharp
[Authorize(Roles = "SuperAdmin")]
```

But the JWT token might have:
- Role = "Superadmin" (lowercase 'a')
- Role = "Admin" (wrong role)
- No role claim at all

**Quick Fix Test:**

Ask Professor Kristi to check the database:
```sql
SELECT Id, Email, Role, IsActive 
FROM Users 
WHERE Email = 'your-email@example.com';
```

The `Role` column should be exactly "SuperAdmin" (or whatever the backend expects).

Then check if the backend login endpoint includes this role in the JWT token.

---

**END OF DIAGNOSTIC GUIDE**
