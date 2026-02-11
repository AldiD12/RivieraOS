# Venue Type Filtering - Status Check

**Date:** February 11, 2026  
**Feature:** Context-aware QR pages based on venue type

---

## Expected Behavior

### BEACH/POOL Venues (QR Page):
- ✅ Show full menu
- ✅ Show "Add to Cart" buttons
- ✅ Show cart sidebar
- ✅ Show "Place Order" button
- ✅ Show "Reserve Table" button (future - not implemented yet)
- ✅ Show "Leave Review" modal

### RESTAURANT Venues (QR Page):
- ✅ Show full menu (read-only)
- ❌ NO "Add to Cart" buttons
- ❌ NO cart sidebar
- ❌ NO "Place Order" button
- ❌ NO "Reserve Table" button
- ✅ Show "Leave Review" modal

---

## Current Implementation Status

### Code Status: ✅ IMPLEMENTED

**File:** `frontend/src/pages/SpotPage.jsx`

**Logic:**
```javascript
// Line 189-191
const canOrder = venue?.type === 'BEACH' || venue?.type === 'POOL';
const canReserve = venue?.type === 'BEACH' || venue?.type === 'POOL';
```

**What it does:**
- Fetches venue type from backend
- Sets `canOrder` and `canReserve` flags
- Conditionally renders cart/order UI based on flags

---

## Issue: Venue Type Not Being Detected

### Problem:
The venue type might not be set correctly in the database, causing all venues to default to "OTHER" which hides the ordering features.

### How to Check:

1. **Check Database:**
   - Go to SuperAdmin Dashboard
   - Click on "Venues & Zones" tab
   - Select a business
   - Look at each venue
   - Check if "Type" field shows: BEACH, POOL, or RESTAURANT

2. **Check Browser Console:**
   - Scan a QR code
   - Open DevTools (F12)
   - Look for log: `✅ Venue type loaded from backend:`
   - Should show: BEACH, POOL, or RESTAURANT
   - If it shows: OTHER or undefined → Problem!

3. **Check Backend Response:**
   - Open Network tab in DevTools
   - Scan QR code
   - Look for request to: `/api/public/Reservations/zones?venueId=X`
   - Check response includes: `venue: { id, name, type }`

---

## How to Fix

### Option 1: Set Venue Type in SuperAdmin Dashboard

1. Login as SuperAdmin
2. Go to "Venues & Zones" tab
3. Select business
4. Click "Edit" on each venue
5. Set "Type" dropdown to:
   - BEACH (for beach venues)
   - POOL (for pool venues)
   - RESTAURANT (for restaurant venues)
6. Save

### Option 2: Update Database Directly (SQL)

```sql
-- Check current venue types
SELECT Id, Name, Type FROM Venues;

-- Update venue types
UPDATE Venues SET Type = 'BEACH' WHERE Id = 10;
UPDATE Venues SET Type = 'POOL' WHERE Id = 11;
UPDATE Venues SET Type = 'RESTAURANT' WHERE Id = 12;
```

---

## Testing Checklist

### Test BEACH Venue:
- [ ] Scan QR code from beach venue
- [ ] Menu displays correctly
- [ ] "Add to Cart" buttons visible
- [ ] Cart sidebar visible on right
- [ ] Can add items to cart
- [ ] "Place Order" button works
- [ ] Console shows: `✅ Venue type loaded from backend: BEACH`

### Test POOL Venue:
- [ ] Scan QR code from pool venue
- [ ] Menu displays correctly
- [ ] "Add to Cart" buttons visible
- [ ] Cart sidebar visible on right
- [ ] Can add items to cart
- [ ] "Place Order" button works
- [ ] Console shows: `✅ Venue type loaded from backend: POOL`

### Test RESTAURANT Venue:
- [ ] Scan QR code from restaurant venue
- [ ] Menu displays correctly (full width, no sidebar)
- [ ] NO "Add to Cart" buttons
- [ ] NO cart sidebar
- [ ] NO "Place Order" button
- [ ] Can only browse menu
- [ ] Console shows: `✅ Venue type loaded from backend: RESTAURANT`

---

## Backend Requirement

**Endpoint:** `GET /api/public/Reservations/zones?venueId={id}`

**Must return:**
```json
[
  {
    "id": 6,
    "name": "VIP Section",
    "venue": {
      "id": 10,
      "name": "Hotel Coral Beach - Main Beach",
      "type": "BEACH"  // ← This is critical!
    }
  }
]
```

If `venue.type` is missing or null, the frontend defaults to "OTHER" and hides ordering features.

---

## Next Steps

1. **Verify venue types are set** in SuperAdmin dashboard
2. **Test with real QR codes** from each venue type
3. **Check browser console** for venue type logs
4. **If still not working:** Check backend is returning venue type in zones endpoint

---

**Status:** ⚠️ NEEDS VERIFICATION

The code is correct, but venue types might not be set in the database.
