# Backend Deployment - February 17, 2026 ✅

**Deployed by:** Prof Kristi  
**Environment:** Azure Container Apps  
**Status:** All 3 tasks deployed and live  
**Health Check:** 200 OK

---

## Task 1: Zone IsActive Field - DTO & Controller Update ✅

### Problem
The Zone.IsActive field existed in the database (migration 20260209224824) but wasn't exposed through the API layer.

### Changes

**DTOs Updated:**
- `DTOs/Business/ZoneDtos.cs` - Added IsActive to BizZoneListItemDto, BizZoneDetailDto, BizCreateZoneRequest, BizUpdateZoneRequest
- `DTOs/SuperAdmin/ZoneDtos.cs` - Added IsActive to ZoneListItemDto, ZoneDetailDto, CreateZoneRequest, UpdateZoneRequest

**Controllers Updated:**
- `Controllers/Business/ZonesController.cs` - Mapped IsActive in GET list, GET detail, POST create, PUT update. Added POST {id}/toggle-active endpoint
- `Controllers/SuperAdmin/ZonesController.cs` - Same mappings + toggle endpoint

### New Endpoints
- `POST /api/business/venues/{venueId}/zones/{id}/toggle-active`
- `POST /api/superadmin/venues/{venueId}/zones/{id}/toggle-active`

---

## Task 2: Collector Venue Assignment ✅

### Problem
Collectors couldn't use CollectorDashboard because they had no way to know which venue they're assigned to. Login response didn't include venue info, and /api/business/venues returned 403 for Collector role.

### Changes

**Database:**
- Migration: `AddUserVenueAndDigitalOrdering`
- Added `venue_id` (int, nullable, FK) to `core_users`
- Added `is_digital_ordering_enabled` (bit, nullable) to `catalog_venues`

**Entities:**
- `Entities/User.cs` - Added nullable VenueId FK + Venue navigation property
- `Data/BlackBearDbContext.cs` - Configured User ↔ Venue relationship (OnDelete: NoAction)

**DTOs:**
- `DTOs/LoginResponse.cs` - Added VenueId and VenueName
- `DTOs/Business/StaffDtos.cs` - Added VenueId/VenueName to list & detail DTOs, VenueId to create & update requests

**Controllers:**
- `Controllers/AuthController.cs` - Both email/password and PIN login now `.Include(u => u.Venue)` and return venueId + venueName
- `Controllers/Business/StaffController.cs` - Added GET /api/business/staff/me endpoint (Collector/Bartender/Manager/BusinessOwner). Updated all staff CRUD to map and validate VenueId

### New Endpoints
- `GET /api/business/staff/me` - Returns current user's profile with venue assignment

### Logic
- Login returns `venueId` and `venueName`
- Staff can be assigned to a venue during creation/update
- Collectors use assigned venue for their dashboard

---

## Task 3: Venue Type-Based Digital Ordering Logic ✅

### Problem
Restaurants should default to view-only menus (no QR ordering), while Beach/Pool/Bar venues should allow ordering. There was no automatic behavior - everything had to be set manually.

### Changes

**Entity:**
- `Entities/Venue.cs` - Added nullable `IsDigitalOrderingEnabled` (DB column) + `AllowsDigitalOrdering` computed property ([NotMapped])

**Computed Property Logic:**
```csharp
public bool AllowsDigitalOrdering => 
    IsDigitalOrderingEnabled.HasValue 
        ? IsDigitalOrderingEnabled.Value 
        : (Type != null && Type.ToLower() == "restaurant" ? false : true);
```

**DTOs:**
- `DTOs/Business/VenueDtos.cs` - Added IsDigitalOrderingEnabled + AllowsDigitalOrdering to list & detail DTOs
- `DTOs/SuperAdmin/VenueDtos.cs` - Same fields on list & detail DTOs
- `DTOs/Public/ZoneUnitDtos.cs` - Added AllowsDigitalOrdering to PublicVenueDetailDto

**Controllers:**
- `Controllers/Business/VenuesController.cs` - Mapped in GET list, GET detail, POST create
- `Controllers/SuperAdmin/VenuesController.cs` - Mapped in GET list, GET detail, POST create
- `Controllers/Public/VenuesController.cs` - Mapped in GET detail

### Logic Table

| IsDigitalOrderingEnabled | Venue Type | AllowsDigitalOrdering |
|-------------------------|------------|----------------------|
| true | any | true (manual override) |
| false | any | false (manual override) |
| null | Restaurant | false (auto: view-only) |
| null | Beach/Pool/Bar/etc | true (auto: ordering) |
| null | null | true (safe default) |

---

## Database Migration

All three tasks were combined into a single migration: `AddUserVenueAndDigitalOrdering`

**Changes:**
- Added `venue_id` (int, nullable, FK) to `core_users`
- Added `is_digital_ordering_enabled` (bit, nullable) to `catalog_venues`

---

## Deployment

- Migration applied to Azure SQL (srv-blackbear-main)
- Docker image built and pushed to `blackbearapiark.azurecr.io/blackbear-api:latest`
- Container App updated - revision `blackbear-api--0000012`
- Health check: 200 OK

---

## Frontend Integration Status

### ✅ Completed
1. Zone Active/Inactive Toggle - Integrated and deployed
2. Azure Blob Image Upload - Working

### 🔄 In Progress
3. Collector Venue Assignment - Need to integrate
4. Digital Ordering Toggle - Need to integrate

---

## Next Steps for Frontend

### 1. Collector Venue Assignment Integration
- Update login flow to store `venueId` and `venueName` in localStorage
- Update CollectorDashboard to use assigned venue from localStorage
- Add venue dropdown to staff creation/edit modals
- Show assigned venue in staff list

### 2. Digital Ordering Toggle Integration
- Update SpotPage to check `allowsDigitalOrdering` instead of venue type
- Add digital ordering toggle to venue forms (BusinessAdmin & SuperAdmin)
- Update venue list to show digital ordering status
- Show appropriate UI (view-only menu vs ordering enabled)

### 3. Testing
- Test collector login → verify venueId stored
- Test CollectorDashboard with assigned venue
- Test restaurant venue → verify view-only menu
- Test beach venue → verify ordering enabled
- Test manual override toggle

---

## API Endpoints Summary

### Zone Management
- `POST /api/business/venues/{venueId}/zones/{id}/toggle-active`
- `POST /api/superadmin/venues/{venueId}/zones/{id}/toggle-active`

### Staff Management
- `GET /api/business/staff/me` - Get current user profile with venue

### Venue Management
- All venue endpoints now return `isDigitalOrderingEnabled` and `allowsDigitalOrdering`

---

## Files to Update (Frontend)

**Collector Venue Assignment:**
- `frontend/src/pages/LoginPage.jsx` - Store venueId/venueName
- `frontend/src/pages/CollectorDashboard.jsx` - Use assigned venue
- `frontend/src/components/dashboard/modals/StaffModals.jsx` - Add venue dropdown

**Digital Ordering:**
- `frontend/src/pages/SpotPage.jsx` - Check allowsDigitalOrdering
- `frontend/src/components/dashboard/modals/VenueModals.jsx` - Add toggle
- `frontend/src/pages/BusinessAdminDashboard.jsx` - Show status
- `frontend/src/pages/SuperAdminDashboard.jsx` - Show status
