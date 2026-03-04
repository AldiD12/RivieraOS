# Events System - Backend Task for Prof. Kristi

**Date:** March 4, 2026  
**Status:** Frontend Complete, Backend Permissions Needed  
**Priority:** Medium (Phase 2 feature)

---

## Current Status

### ✅ Frontend Implementation Complete
- Business Admin Events tab fully implemented
- Event modals (Create/Edit/Delete) working
- Event cards with flyer images, status badges, actions
- Error handling and graceful degradation
- Code deployed to production

### ❌ Backend Issue: 404 Not Found
**Error:** `POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/Events 404`

**Root Cause:** The Events API endpoints exist in swagger but return 404 in production.

---

## Backend APIs Needed

According to `swagger.json`, these endpoints should exist but are returning 404:

### Business Admin Endpoints
```
GET    /api/business/Events
POST   /api/business/Events
GET    /api/business/Events/{id}
PUT    /api/business/Events/{id}
DELETE /api/business/Events/{id}
POST   /api/business/Events/{id}/publish
POST   /api/business/Events/{id}/unpublish
```

### Super Admin Endpoints
```
GET    /api/superadmin/Events (paginated)
POST   /api/superadmin/Events
GET    /api/superadmin/Events/{id}
PUT    /api/superadmin/Events/{id}
DELETE /api/superadmin/Events/{id}
POST   /api/superadmin/Events/{id}/publish
POST   /api/superadmin/Events/{id}/unpublish
POST   /api/superadmin/Events/{id}/restore
```

### Public Endpoints
```
GET /api/public/Events
GET /api/public/Events/{id}
GET /api/public/Events/venue/{venueId}
GET /api/public/Events/business/{businessId}
```

---

## What Prof. Kristi Needs to Do

### 1. Deploy Events Controller
The Events controller exists in swagger but isn't deployed to production.

**Check:**
- Is `EventsController.cs` deployed to Azure?
- Are the routes registered correctly?
- Is the controller in the correct namespace?

### 2. Add Role Permissions
Business Admin users need permission to access `/api/business/Events` endpoints.

**Current Issue:** Business Admin role may not have Events permissions configured.

**Fix:** Add Events permissions to Business Admin role in the authorization policy.

### 3. Verify Database Tables
Ensure the Events table exists with these fields (from swagger):
```csharp
- Id (int)
- BusinessId (int)
- VenueId (int, nullable)
- Title (string)
- Description (string)
- FlyerImageUrl (string)
- StartTime (DateTime)
- EndTime (DateTime)
- TicketPrice (decimal, nullable)
- TicketLink (string, nullable)
- IsPublished (bool)
- IsDeleted (bool)
- CreatedAt (DateTime)
- UpdatedAt (DateTime)
```

---

## Testing After Backend Fix

Once Prof. Kristi deploys the Events endpoints:

1. Login as Business Admin
2. Go to Events tab
3. Click "Create Event"
4. Fill form and submit
5. Should see event card appear
6. Test Publish/Unpublish toggle
7. Test Edit and Delete

---

## Frontend Implementation Details

### Files Created/Modified
- `frontend/src/services/eventsApi.js` - API service layer
- `frontend/src/components/dashboard/modals/EventModals.jsx` - Create/Edit/Delete modals
- `frontend/src/pages/BusinessAdminDashboard.jsx` - Events tab integration

### Design System
- Industrial minimalist (black/zinc theme)
- Event cards with flyer images
- Status badges (Published/Draft/Upcoming/Past)
- Publish toggle switch
- Edit/Delete actions

### Event Booking Flow
- Events use WhatsApp booking (same as venue bookings)
- "Get Tickets" button → WhatsApp with pre-filled message
- Business confirms manually, updates booking stats

---

## Next Steps (After Backend Fix)

### Phase 2: Super Admin Events Tab (2-3 hours)
- Add Events tab to SuperAdminDashboard
- Reuse EventModals with businessId field
- Add restore functionality
- Add business/venue filtering

### Phase 3: Discovery Page Events (4-5 hours)
- Add "EVENTS" filter to night mode
- Create EventBottomSheet component
- Display events with flyer images
- Event markers on map with 🪩 icon
- "Get Tickets" → WhatsApp

---

## Summary

The frontend is 100% ready. We just need Prof. Kristi to:
1. Deploy the Events controller to production
2. Add Business Admin role permissions for Events endpoints
3. Verify Events database table exists

Once that's done, the Events system will work immediately.
