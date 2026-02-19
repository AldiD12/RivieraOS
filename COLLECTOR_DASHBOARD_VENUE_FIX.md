# Collector Dashboard - Venue & Zone Display Fix

## Current Issue

CollectorDashboard is getting 403 Forbidden errors when trying to fetch zones because it's using business admin endpoints that collectors don't have permission to access.

**Error:**
```
GET /api/business/venues/18/Zones 403 (Forbidden)
```

## Root Cause

1. ✅ Backend now includes `VenueId` and `VenueName` in login response (Prof Kristi's changes)
2. ✅ CollectorDashboard receives venue data: "Collector assigned to venue: 18 BEACH"
3. ❌ CollectorDashboard tries to fetch zones using `businessApi.zones.list()` 
4. ❌ This calls `/business/venues/{venueId}/Zones` which requires business admin permissions
5. ❌ Collectors don't have permission → 403 Forbidden

## Solution Options

### Option 1: Use Collector-Specific Endpoints (RECOMMENDED)

If Prof Kristi has created collector-specific endpoints, use those:
- `GET /api/collector/zones` - Get zones for collector's assigned venue
- `GET /api/collector/bookings` - Get bookings for collector's zones

**Pros:**
- Proper role-based access control
- Backend validates collector can only see their venue
- More secure

**Cons:**
- Requires backend endpoints (need to check if they exist)

### Option 2: Grant Collectors Read Access to Business Endpoints

Modify backend permissions to allow collectors to read zones for their assigned venue.

**Pros:**
- Quick fix
- Reuses existing endpoints

**Cons:**
- Less secure (collectors might access other venues' data)
- Not following principle of least privilege

### Option 3: Remove Zone Selection from Collector Dashboard

Collectors are assigned to a venue, and the backend already knows which zones belong to that venue. The collector doesn't need to select zones - they should see ALL bookings for their venue.

**Pros:**
- Simplest solution
- Matches the business logic (1 collector = 1 venue = all zones)
- No permission issues

**Cons:**
- Changes UX (removes zone dropdown)

## Recommended Implementation

**Use Option 3** - Remove zone selection, show all bookings for the collector's assigned venue.

### Changes Needed in CollectorDashboard.jsx:

1. Remove zone fetching logic
2. Remove zone dropdown UI
3. Fetch bookings directly for the venue (not filtered by zone)
4. Backend should return all bookings for the collector's assigned venue

### Code Changes:

```javascript
// REMOVE:
const fetchZones = async () => {
  const data = await businessApi.zones.list(selectedVenue.id);
  setZones(data);
};

// REMOVE zone dropdown from UI

// CHANGE booking fetch to use venue-level endpoint:
const fetchBookings = async () => {
  // Use collector-specific endpoint or venue-level endpoint
  const data = await collectorApi.bookings.list(venueId);
  setBookings(data);
};
```

## Backend Task for Prof Kristi

**Option A: Create Collector Endpoints (Recommended)**

```csharp
// Controllers/Collector/CollectorController.cs

[HttpGet("bookings")]
[Authorize(Roles = "Collector")]
public async Task<IActionResult> GetMyBookings()
{
    var userId = User.GetUserId();
    var user = await _context.Users
        .Include(u => u.Venue)
        .FirstOrDefaultAsync(u => u.Id == userId);
    
    if (user.VenueId == null)
        return BadRequest("Collector not assigned to venue");
    
    var bookings = await _context.Bookings
        .Where(b => b.Zone.VenueId == user.VenueId)
        .Include(b => b.Zone)
        .Include(b => b.ZoneUnit)
        .ToListAsync();
    
    return Ok(bookings);
}
```

**Option B: Modify Business Endpoints Permissions**

Allow collectors to read zones/bookings for their assigned venue only.

## Testing

After fix:
1. Login as collector
2. Should see venue name at top: "BEACH"
3. Should see all bookings for that venue
4. No 403 errors in console
5. Can check-in/check-out guests

## Status

- ✅ Backend: VenueId/VenueName added to login response
- ✅ Frontend: Venue assignment working
- ❌ Frontend: Zone fetching fails (403)
- ⏳ Waiting for: Decision on which option to implement
