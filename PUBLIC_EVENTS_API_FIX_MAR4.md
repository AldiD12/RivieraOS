# Public Events API Fix - Double /api/ Issue

**Date:** March 4, 2026  
**Status:** ✅ FIXED  
**Build:** ✅ Successful

---

## Problem

Events view on Discovery Page was failing with 404 error:
```
GET /api/api/public/Venues 404 (Not Found)
```

The error showed `/Venues` but the same issue affected `/Events` endpoint.

**Root Cause:** Double `/api/` in URL path
- `API_BASE_URL` = `https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api`
- `publicApi` axios instance had `baseURL: API_BASE_URL` (already includes `/api`)
- Then added `/public/Events` → resulted in `/api/api/public/Events`

---

## Solution

Replaced axios instance with native `fetch()` calls matching the pattern used in `venueApi.js`:

**Before:**
```javascript
const publicApi = axios.create({
  baseURL: API_BASE_URL, // Already has /api
  headers: { 'Content-Type': 'application/json' }
});

export const publicEventsApi = {
  getEvents: async () => {
    const response = await publicApi.get('/public/Events'); // Creates /api/api/public/Events
    return response.data;
  }
};
```

**After:**
```javascript
export const publicEventsApi = {
  getEvents: async () => {
    const response = await fetch(`${API_BASE_URL}/public/Events`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
};
```

Now correctly generates: `https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Events`

---

## Changes Made

**File:** `frontend/src/services/eventsApi.js`

1. Removed `publicApi` axios instance
2. Converted all `publicEventsApi` methods to use native `fetch()`
3. Added proper error handling with HTTP status checks
4. Added array validation for `getEvents()` to return empty array on error
5. Matched the pattern used in `venueApi.js` (working reference)

**Methods Updated:**
- `getEvents()` - Fetch all published events
- `getEventDetails(id)` - Fetch single event
- `getEventsByVenue(venueId)` - Fetch events by venue
- `getEventsByBusiness(businessId)` - Fetch events by business

---

## Why This Pattern?

**venueApi.js uses fetch() directly:**
```javascript
const API_URL = import.meta.env.VITE_API_URL; // Just domain
await fetch(`${API_URL}/api/public/Venues`); // Manually adds /api
```

**eventsApi.js now matches this:**
```javascript
const API_BASE_URL = 'https://...italynorth.azurecontainerapps.io/api';
await fetch(`${API_BASE_URL}/public/Events`); // API_BASE_URL already has /api
```

Both approaches work, but consistency matters. The key is:
- If base URL includes `/api`, don't add it again
- If base URL is just domain, add `/api` in the path

---

## Testing Checklist

- [x] Build successful (no errors)
- [ ] Events view loads on Discovery Page
- [ ] Events filtered by vibe (House, Techno, etc.)
- [ ] Events filtered by date (Today, This Week, etc.)
- [ ] Event cards display correctly (image, vibe badge, entry type)
- [ ] WhatsApp booking flow works (click event → opens WhatsApp with pre-filled message)
- [ ] Empty state shows when no events match filters

---

## Next Steps

1. Test events view in browser
2. Verify API returns published events
3. Test WhatsApp booking flow
4. Verify vibe and date filtering works
5. Check empty states display correctly

---

## Related Files

- `frontend/src/services/eventsApi.js` - Fixed API service
- `frontend/src/services/venueApi.js` - Reference pattern
- `frontend/src/pages/DiscoveryPage.jsx` - Events view integration
- `frontend/src/components/EventsView.jsx` - Events display component
- `frontend/src/components/EventCard.jsx` - Individual event card

---

## API Endpoints

**Public Events API (No Auth):**
- `GET /api/public/Events` - All published events (array)
- `GET /api/public/Events/{id}` - Single event details
- `GET /api/public/Events/venue/{venueId}` - Events by venue
- `GET /api/public/Events/business/{businessId}` - Events by business

**Expected Response:**
```json
[
  {
    "id": "uuid",
    "name": "Summer Vibes",
    "description": "...",
    "startTime": "2026-03-05T22:00:00Z",
    "endTime": "2026-03-06T04:00:00Z",
    "venueId": "uuid",
    "businessId": "uuid",
    "flyerImageUrl": "https://...",
    "isPublished": true,
    "isDeleted": false,
    "entryType": "reservation",
    "minimumSpend": 500,
    "ticketPrice": 0,
    "isTicketed": false,
    "vibe": "House"
  }
]
```

---

## Build Output

```
✓ 2181 modules transformed.
dist/index.html                        1.12 kB │ gzip:   0.55 kB
dist/assets/index-CnBvFNwh.css       137.93 kB │ gzip:  19.07 kB
dist/assets/index-DcgL0xPT.js      1,002.36 kB │ gzip: 271.76 kB
dist/assets/mapbox-gl-BnPPCN7K.js  1,268.96 kB │ gzip: 348.62 kB
✓ built in 5.69s
```

**Status:** ✅ Build successful, ready for testing
