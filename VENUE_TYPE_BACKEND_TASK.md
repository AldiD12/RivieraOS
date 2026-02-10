# Venue Type Backend Task for Prof Kristi

## Problem
The frontend cannot determine if a venue is a restaurant or beach/pool, so it cannot show the correct interface when customers scan QR codes.

## Current Situation
- ✅ Venue entity has `type` field in database
- ✅ Frontend has dropdown to set venue type (BEACH, POOL, RESTAURANT, BAR, CAFE, OTHER)
- ❌ Public API doesn't return venue type
- ❌ All QR codes show restaurant behavior (menu only, no ordering)

## What Needs to Be Done

### Option 1: Add Venue Info to Zones Endpoint (RECOMMENDED)

**Endpoint:** `GET /api/public/Reservations/zones?venueId={venueId}`

**Current Response:**
```json
[
  {
    "id": 12,
    "name": "vipsecti",
    "zoneType": "cabana",
    "basePrice": 20,
    "capacityPerUnit": 4,
    "units": [...]
  }
]
```

**Needed Response:**
```json
[
  {
    "id": 12,
    "name": "vipsecti",
    "zoneType": "cabana",
    "basePrice": 20,
    "capacityPerUnit": 4,
    "units": [...],
    "venue": {
      "id": 16,
      "name": "Hotel Coral Beach",
      "type": "BEACH"    ← ADD THIS
    }
  }
]
```

**Implementation:**
1. In the zones query, include the parent Venue entity
2. Add venue.type to the response DTO
3. Test with Postman: `GET /api/public/Reservations/zones?venueId=16`

### Option 2: Create New Public Venue Endpoint

**Endpoint:** `GET /api/public/Venues/{venueId}`

**Response:**
```json
{
  "id": 16,
  "name": "Hotel Coral Beach",
  "type": "BEACH",
  "description": "Beautiful beach resort",
  "address": "Durres, Albania",
  "imageUrl": "https://...",
  "orderingEnabled": true
}
```

**Implementation:**
1. Create new controller: `PublicVenuesController`
2. Add GET endpoint that returns venue details
3. No authentication required (public endpoint)

## Frontend Logic (Already Implemented)

```javascript
// SpotPage.jsx checks venue type:
const canOrder = venue?.type === 'BEACH' || venue?.type === 'POOL';
const canReserve = venue?.type === 'BEACH' || venue?.type === 'POOL';

// If venue.type === 'RESTAURANT':
//   - Show menu only
//   - No "Add" buttons
//   - No cart
//   - No reserve button

// If venue.type === 'BEACH' or 'POOL':
//   - Show menu with "Add" buttons
//   - Show shopping cart
//   - Show "Reserve Table" button
//   - Allow ordering and reservations
```

## Testing After Implementation

1. **Create test venues:**
   - Venue A: type = "RESTAURANT"
   - Venue B: type = "BEACH"

2. **Generate QR codes for both**

3. **Scan Restaurant QR:**
   - Should show menu only
   - No "Add" buttons
   - No cart sidebar
   - No "Reserve Table" button

4. **Scan Beach QR:**
   - Should show menu with "Add" buttons
   - Should show cart sidebar
   - Should show "Reserve Table" button in header
   - Can place orders and make reservations

## Priority
**HIGH** - Blocking customer QR code functionality

## Current Workaround
None - all venues show restaurant behavior until backend returns venue type.

## Files to Check
- Frontend: `frontend/src/pages/SpotPage.jsx` (lines 188-190)
- Backend: Need to modify zones endpoint or create new venue endpoint
