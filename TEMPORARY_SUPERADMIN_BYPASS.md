# Temporary SuperAdmin Bypass - FOR TESTING ONLY

**Date:** February 18, 2026  
**Status:** TEMPORARY WORKAROUND ACTIVE ⚠️

---

## WHAT WAS CHANGED

Added temporary hardcoded bypass to SuperAdminLogin so you can test the dashboard without fixing the backend role issue.

---

## HOW TO USE

### Login Credentials (Hardcoded)

Go to: `http://localhost:5173/superadmin/login`

**Email:** `superadmin@rivieraos.com`  
**Password:** `admin123`

Click "Access System" and you'll be logged in with a fake token.

---

## WHAT HAPPENS

1. ✅ Login page accepts hardcoded credentials
2. ✅ Stores fake JWT token in localStorage
3. ✅ Sets role to "SuperAdmin"
4. ✅ Redirects to dashboard
5. ✅ Dashboard loads with mock data if API fails
6. ⚠️ Shows warning: "TEST MODE: Using mock data"

---

## WHAT YOU CAN TEST

With this bypass, you can now test:

- ✅ Dashboard UI and layout
- ✅ Navigation between tabs
- ✅ Modal forms (create/edit)
- ✅ UI interactions
- ✅ Frontend logic
- ❌ Real API calls (will use mock data)
- ❌ Real data persistence

---

## MOCK DATA PROVIDED

When API calls fail (401), the dashboard will show:

**Businesses:**
- Test Business Ltd (id: 1)
- Brand: Test Brand
- Email: test@business.com
- Status: Active

You can click on this business and test the UI, but data won't be saved.

---

## FILES MODIFIED

### 1. SuperAdminLogin.jsx

**Added:** Hardcoded bypass at the top of `handleSubmit`

```javascript
// TEMPORARY HARDCODED BYPASS FOR TESTING
const TEMP_BYPASS_EMAIL = 'superadmin@rivieraos.com';
const TEMP_BYPASS_PASSWORD = 'admin123';

if (credentials.email === TEMP_BYPASS_EMAIL && credentials.password === TEMP_BYPASS_PASSWORD) {
  // Bypass authentication and use fake token
  navigate('/superadmin');
  return;
}
```

### 2. SuperAdminDashboard.jsx

**Modified:** `fetchBusinesses` function to use mock data on 401

```javascript
if (err.response?.status === 401) {
  // Use mock data instead of redirecting to login
  setBusinesses([{ /* mock business */ }]);
  setError('⚠️ TEST MODE: Using mock data');
}
```

---

## IMPORTANT WARNINGS

⚠️ **THIS IS FOR TESTING ONLY**

- Do NOT deploy this to production
- Do NOT commit this to main branch
- Do NOT share these credentials
- Do NOT rely on this for real testing

⚠️ **SECURITY RISK**

- Anyone can login with these credentials
- No real authentication happening
- Fake token has no backend validation

⚠️ **DATA LIMITATIONS**

- API calls will fail with 401
- Mock data is used as fallback
- No real data persistence
- Cannot test backend integration

---

## WHEN TO REMOVE

Remove this bypass when:

1. ✅ Backend role is fixed (database has "SuperAdmin" not "Superadmin")
2. ✅ JWT tokens include correct role claim
3. ✅ Backend authorization works correctly

---

## HOW TO REMOVE

### Step 1: Revert SuperAdminLogin.jsx

Remove the hardcoded bypass section (lines 18-35):

```javascript
// DELETE THIS ENTIRE SECTION:
const TEMP_BYPASS_EMAIL = 'superadmin@rivieraos.com';
const TEMP_BYPASS_PASSWORD = 'admin123';

if (credentials.email === TEMP_BYPASS_EMAIL && credentials.password === TEMP_BYPASS_PASSWORD) {
  // ... bypass code ...
  return;
}
```

### Step 2: Revert SuperAdminDashboard.jsx

Change back to redirect on 401:

```javascript
// CHANGE FROM:
if (err.response?.status === 401) {
  setBusinesses([{ /* mock data */ }]);
  setError('⚠️ TEST MODE: Using mock data');
}

// BACK TO:
if (err.response?.status === 401) {
  localStorage.clear();
  window.location.href = '/superadmin/login';
}
```

### Step 3: Test Real Authentication

1. Clear localStorage
2. Go to `/superadmin/login`
3. Login with real database credentials
4. Verify dashboard loads with real data

---

## TESTING CHECKLIST

With the bypass active, test these features:

- [ ] Dashboard loads without crashing
- [ ] Can navigate between tabs (Overview, Businesses, Staff, Menu, Venues)
- [ ] Can click on mock business
- [ ] Can open create/edit modals
- [ ] Forms render correctly
- [ ] UI looks good (no layout issues)
- [ ] No JavaScript errors in console (except 401s)
- [ ] Can logout and login again

---

## KNOWN ISSUES

1. **401 Errors in Console**
   - Expected behavior
   - API calls fail because token is fake
   - Mock data is used as fallback

2. **Warning Message**
   - "TEST MODE: Using mock data"
   - Shown at top of dashboard
   - Reminds you this is temporary

3. **Limited Functionality**
   - Can't create real businesses
   - Can't add real staff
   - Can't save any data
   - Only UI testing possible

---

## NEXT STEPS

After testing the UI:

1. Ask Professor Kristi to fix database role name
2. Remove this bypass
3. Test with real authentication
4. Verify full functionality works

---

**REMEMBER: This is a temporary workaround for UI testing only. Remove it before production deployment!**
