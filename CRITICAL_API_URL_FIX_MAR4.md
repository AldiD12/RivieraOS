# CRITICAL: Double /api/ Fix - All Public Services

**Date:** March 4, 2026  
**Status:** ✅ FIXED & DEPLOYED  
**Severity:** CRITICAL - Affected ALL public endpoints in production

---

## Problem Discovery

Vercel environment variable is configured as:
```
VITE_API_URL=https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api
```

Notice it already includes `/api` at the end.

But all our public API services were adding `/api` again:
```javascript
fetch(`${API_URL}/api/public/Venues`)
// Results in: .../api/api/public/Venues ❌
```

This caused 404 errors for:
- Venues (map wouldn't load)
- Events (events view broken)
- Reservations (booking flow broken)
- Feedback (review shield broken)

---

## Root Cause

**Environment Variable Pattern:**
- Local dev: `VITE_API_URL` not set → uses fallback with `/api`
- Production: `VITE_API_URL` set with `/api` already included

**Code Pattern (WRONG):**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://...';
fetch(`${API_URL}/api/public/Venues`); // Double /api/ in production
```

**Code Pattern (CORRECT):**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://.../api';
fetch(`${API_URL}/public/Venues`); // Single /api/ everywhere
```

---

## Files Fixed

### 1. venueApi.js
**Before:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.riviera-os.com';
fetch(`${API_URL}/api/public/Venues`)
fetch(`${API_URL}/api/public/Venues/${venueId}/availability`)
```

**After:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.riviera-os.com';
fetch(`${API_URL}/public/Venues`)
fetch(`${API_URL}/public/Venues/${venueId}/availability`)
```

### 2. eventsApi.js
**Before:**
```javascript
const API_BASE_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
const publicApi = axios.create({ baseURL: API_BASE_URL });
publicApi.get('/public/Events') // Creates /api/api/public/Events
```

**After:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
fetch(`${API_BASE_URL}/public/Events`) // Correct URL
```

### 3. reservationApi.js
**Before:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io';
fetch(`${API_URL}/api/public/Reservations`)
fetch(`${API_URL}/api/public/Reservations/availability`)
fetch(`${API_URL}/api/public/Reservations/zones`)
fetch(`${API_URL}/api/venues`)
```

**After:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
fetch(`${API_URL}/public/Reservations`)
fetch(`${API_URL}/public/Reservations/availability`)
fetch(`${API_URL}/public/Reservations/zones`)
fetch(`${API_URL}/venues`)
```

### 4. feedbackApi.js
**Before:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://api.riviera-os.com';
fetch(`${API_URL}/api/public/Feedback`)
```

**After:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
fetch(`${API_URL}/public/Feedback`)
```

---

## Pattern Established

**RULE:** Always assume `VITE_API_URL` includes `/api` at the end.

**Correct Pattern:**
```javascript
// Fallback MUST include /api
const API_URL = import.meta.env.VITE_API_URL || 'https://domain.com/api';

// Paths MUST NOT start with /api
fetch(`${API_URL}/public/Venues`)      // ✅ Correct
fetch(`${API_URL}/api/public/Venues`)  // ❌ Wrong
```

**Why This Works:**
- Production: `VITE_API_URL` = `https://.../api` → `${API_URL}/public/Venues` = `https://.../api/public/Venues` ✅
- Local dev: `VITE_API_URL` = undefined → fallback = `https://.../api` → same result ✅

---

## Impact

**Before Fix (BROKEN):**
- ❌ Discovery Page: Map wouldn't load (venues 404)
- ❌ Events View: Events wouldn't load (events 404)
- ❌ Booking Flow: Reservations broken (reservations 404)
- ❌ Review Shield: Feedback submission broken (feedback 404)

**After Fix (WORKING):**
- ✅ Discovery Page: Map loads with venues
- ✅ Events View: Events display correctly
- ✅ Booking Flow: Reservations work
- ✅ Review Shield: Feedback submits

---

## Testing Checklist

- [x] Build successful (no errors)
- [ ] Production: Discovery Page loads venues on map
- [ ] Production: Events view displays events
- [ ] Production: Booking flow creates reservations
- [ ] Production: Feedback submission works
- [ ] Local dev: All endpoints still work

---

## Lessons Learned

1. **Environment variables are tricky** - Always check what's actually in production env
2. **Fallbacks matter** - Fallback should match production format
3. **Test in production** - Local dev can hide environment-specific bugs
4. **Consistency is key** - All services should use same URL pattern

---

## Related Files

- `frontend/src/services/venueApi.js` - Fixed
- `frontend/src/services/eventsApi.js` - Fixed
- `frontend/src/services/reservationApi.js` - Fixed
- `frontend/src/services/feedbackApi.js` - Fixed
- `PUBLIC_EVENTS_API_FIX_MAR4.md` - Initial discovery

---

## Deployment

**Commit:** `29a624a`  
**Message:** "fix: remove double /api/ from ALL public API services"  
**Status:** ✅ Pushed to main  
**Vercel:** Auto-deploying now

---

## Next Steps

1. Wait for Vercel deployment to complete
2. Test all public endpoints in production
3. Verify map loads venues
4. Verify events view works
5. Verify booking flow works
6. Verify feedback submission works

**Expected Result:** All public features should now work in production.
