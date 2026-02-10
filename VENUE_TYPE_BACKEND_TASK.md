# Venue Type Backend Task for Prof Kristi

## Overview
We need the venue `type` field to be returned in the public API so customers can see the correct booking interface.

## Current Status
- ✅ Venue entity already has `type` field (confirmed in swagger)
- ✅ Frontend now has dropdown for venue type (BEACH, POOL, RESTAURANT, BAR, CAFE, OTHER)
- ❌ Public API doesn't return venue type yet

## What Needs to Be Done

### 1. Update Public Reservations Zones Endpoint
**Endpoint:** `GET /api/public/Reservations/zones?venueId={venueId}`

**Current Response:**
```json
[
  {
    "id": 1,
    "name": "Zone A",
    "zoneType": "SUNBED",
    "capacity": 20
  }
]
```

**Needed Response:**
```json
[
  {
    "id": 1,
    "name": "Zone A",
    "zoneType": "SUNBED",
    "capacity": 20,
    "venue": {
      "id": 14,
      "name": "Hotel Coral Beach",
      "type": "BEACH"
    }
  }
]
```

### 2. Alternative: Create New Public Venue Endpoint
If modifying zones endpoint is complex, create:

**Endpoint:** `GET /api/public/Venues/{venueId}`

**Response:**
```json
{
  "id": 14,
  "name": "Hotel Coral Beach",
  "type": "BEACH",
  "description": "Beautiful beach resort",
  "address": "Durres, Albania",
  "imageUrl": "https://...",
  "orderingEnabled": true
}
```

## Why This Matters

**Restaurant venues:**
- Should ONLY show menu/ordering
- NO booking tab
- NO popup

**Beach/Pool venues:**
- Show popup asking "Order or Book?"
- Both tabs available

**Current Problem:**
Frontend can't determine venue type, so it defaults to showing booking for all venues.

## Priority
**HIGH** - This affects customer experience directly

## Testing
After implementation:
1. Create a venue with type "RESTAURANT"
2. Generate QR code for that venue
3. Scan QR → Should only show Order tab
4. Create a venue with type "BEACH"
5. Generate QR code
6. Scan QR → Should show popup with Order/Book choice
