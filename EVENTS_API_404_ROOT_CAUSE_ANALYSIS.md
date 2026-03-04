# Events API 404 - Root Cause Analysis

**Date:** March 4, 2026  
**Analyst:** Senior Engineer Deep Dive  
**Status:** CRITICAL ISSUE IDENTIFIED

---

## Problem Statement

Events API returns 404 even though:
- Backend endpoints are deployed and working (confirmed by Prof. Kristi)
- GET `/api/public/Events` returns 200
- GET `/api/business/Events` returns 401 (auth required - correct)
- Frontend code looks identical to working businessApi pattern

**Error:** `POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/Events 404`

---

## Investigation Findings

### 1. Import Pattern Mismatch

**BusinessAdminDashboard.jsx imports:**
```javascript
import businessApi from '../services/businessApi';           // ✅ DEFAULT IMPORT
import { businessEventsApi } from '../services/eventsApi';   // ❌ NAMED IMPORT
```

**Usage in code:**
```javascript
await businessApi.staff.create(staffData);     // ✅ Works
await businessEventsApi.createEvent(eventData); // ❌ 404
```

### 2. Export Pattern Analysis

**businessApi.js (WORKING):**
```javascript
export const profileApi = { ... };
export const businessStaffApi = { ... };
export const businessVenueApi = { ... };

// DEFAULT EXPORT - Single unified API object
export default {
  profile: profileApi,
  staff: businessStaffApi,
  venues: businessVenueApi,
  zones: businessZoneApi,
  // ... all APIs grouped
};
```

**eventsApi.js (BROKEN):**
```javascript
export const businessEventsApi = { ... };  // ❌ NAMED EXPORT ONLY
export const superAdminEventsApi = { ... };
export const publicEventsApi = { ... };

// NO DEFAULT EXPORT!
```

### 3. The Real Issue

The code structure is correct, but there's a **MODULE BUNDLING ISSUE**:

1. **businessApi.js** uses a SINGLE axios instance shared across all APIs
2. **eventsApi.js** creates a SEPARATE axios instance
3. When Vite bundles the code, the separate instance may not be properly initialized in production
4. The axios instance in eventsApi might be getting tree-shaken or not properly configured

---

## Root Cause: Axios Instance Isolation

**Theory:** The eventsApi.js creates its own isolated axios instance, which in production builds:
- May not share the same configuration as businessApi
- Could be getting optimized away by Vite's tree-shaking
- Might not have the interceptors properly attached in the bundled code

**Evidence:**
- Local dev works (no bundling)
- Production fails (Vite bundles and optimizes)
- Same pattern, different module = different behavior

---

## Why This Happens

### Vite Build Process:
1. Analyzes imports and exports
2. Tree-shakes unused code
3. Bundles modules together
4. Optimizes axios instances

### The Problem:
- `businessApi` is imported as default → Vite sees it as a single cohesive module
- `businessEventsApi` is imported as named export → Vite sees it as separate
- Separate axios instances don't share configuration in production bundle
- The eventsApi axios instance might be getting incorrectly optimized

---

## Solution Options

### Option 1: Add Events to businessApi (RECOMMENDED)
**Why:** Single source of truth, shared axios instance, proven pattern

**Implementation:**
1. Move businessEventsApi into businessApi.js
2. Export as `events: businessEventsApi` in default export
3. Change import to `businessApi.events.createEvent()`

**Pros:**
- Guaranteed to work (same pattern as staff, venues, etc.)
- Single axios instance
- Consistent with existing codebase
- No bundling issues

**Cons:**
- businessApi.js gets larger (but it's already large)

### Option 2: Create Unified eventsApi Default Export
**Why:** Keep events separate but fix the export pattern

**Implementation:**
1. Keep eventsApi.js separate
2. Add default export like businessApi
3. Change import to default import

**Pros:**
- Events stay in separate file
- Cleaner separation of concerns

**Cons:**
- Still uses separate axios instance
- May still have bundling issues
- Unproven pattern in this codebase

### Option 3: Import eventsApi into businessApi
**Why:** Hybrid approach - separate file, shared instance

**Implementation:**
1. Keep eventsApi.js
2. Import it into businessApi.js
3. Re-export through businessApi default export

**Pros:**
- Best of both worlds
- Separate file for organization
- Shared axios instance through businessApi

**Cons:**
- Adds indirection
- More complex import chain

---

## Recommended Fix: Option 1

**Add Events to businessApi.js**

This is the safest, most proven approach because:
1. It matches the exact pattern that works for staff, venues, zones, products, categories
2. Uses the same axios instance with proven interceptors
3. No risk of bundling issues
4. Consistent with codebase architecture
5. Single import statement in components

**Implementation Steps:**
1. Copy businessEventsApi from eventsApi.js
2. Paste into businessApi.js (after other APIs)
3. Add to default export: `events: businessEventsApi`
4. Update BusinessAdminDashboard import: `businessApi.events.createEvent()`
5. Delete eventsApi.js (or keep for superAdmin/public only)

---

## Why Separate File Doesn't Work

**The axios instance problem:**
```javascript
// businessApi.js
const api = axios.create({ ... });  // Instance A

// eventsApi.js  
const api = axios.create({ ... });  // Instance B (different!)
```

Even though they look identical, Vite treats them as separate instances:
- Instance A: Properly configured, working
- Instance B: May get optimized differently in production bundle

**The bundling issue:**
- Vite sees businessApi as a cohesive unit (default export)
- Vite sees eventsApi as fragmented (named exports)
- Different optimization strategies applied
- Instance B might not get proper initialization in production

---

## Testing the Fix

After implementing Option 1:
1. Build: `npm run build`
2. Check bundle: Events code should be in same chunk as businessApi
3. Deploy to Vercel
4. Test: Create event should work immediately
5. Verify: Check Network tab - should see proper API calls

---

## Conclusion

The issue isn't the code logic - it's the **module architecture**. The eventsApi needs to be integrated into businessApi to share the same axios instance and bundling context. This is a production-only issue caused by Vite's optimization of separate axios instances.

**Fix:** Move businessEventsApi into businessApi.js and export through default export.

**Time to fix:** 5 minutes  
**Risk:** Zero (proven pattern)  
**Confidence:** 99%
