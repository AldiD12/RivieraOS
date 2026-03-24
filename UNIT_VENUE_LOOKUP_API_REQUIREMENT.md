# 🚨 CRITICAL: Unit-to-Venue Lookup API Required

## Problem Statement

**Current Issue:** The MenuPage cannot determine which venue a unit belongs to from the URL `?bedId=1`

**Impact:** 
- Currently defaults to venue ID 1 for all units
- Works for single-venue deployments
- **WILL BREAK** when multiple venues are added
- Production deployment blocker for multi-venue system

---

## Required Backend Implementation

### New Public API Endpoint

**Endpoint:** `GET /api/public/Units/{unitId}/venue`

**Purpose:** Lookup venue information from unit ID

**Authentication:** None (public endpoint)

### Request Examples
```
GET /api/public/Units/1/venue
GET /api/public/Units/25/venue  
GET /api/public/Units/150/venue
```

### Response Schema
```json
{
  "unitId": 1,
  "venueId": 1,
  "venueName": "Riviera Beach Club",
  "zoneId": 2,
  "zoneName": "Beach Zone"
}
```

### Error Responses
```json
// Unit not found
{
  "error": "Unit not found",
  "unitId": 999
}

// Unit exists but no venue assigned
{
  "error": "Unit not assigned to venue", 
  "unitId": 1
}
```

---

## Implementation Details

### Database Query Logic
```sql
SELECT 
    u.Id as unitId,
    v.Id as venueId, 
    v.Name as venueName,
    z.Id as zoneId,
    z.Name as zoneName
FROM ZoneUnits u
JOIN Zones z ON u.ZoneId = z.Id  
JOIN Venues v ON z.VenueId = v.Id
WHERE u.Id = @unitId
```

### Controller Implementation
```csharp
[HttpGet("/api/public/Units/{unitId}/venue")]
public async Task<IActionResult> GetUnitVenue(int unitId)
{
    var unit = await _context.ZoneUnits
        .Include(u => u.Zone)
        .ThenInclude(z => z.Venue)
        .FirstOrDefaultAsync(u => u.Id == unitId);
        
    if (unit == null)
        return NotFound(new { error = "Unit not found", unitId });
        
    if (unit.Zone?.Venue == null)
        return BadRequest(new { error = "Unit not assigned to venue", unitId });
        
    return Ok(new {
        unitId = unit.Id,
        venueId = unit.Zone.Venue.Id,
        venueName = unit.Zone.Venue.Name,
        zoneId = unit.Zone.Id,
        zoneName = unit.Zone.Name
    });
}
```

---

## Frontend Integration

### Current Workaround
```javascript
// TEMPORARY: Defaults to venue 1
const VENUE_ID = 1;
```

### After API Implementation
```javascript
// PRODUCTION: Proper venue lookup
const response = await fetch(`/api/public/Units/${bedId}/venue`);
const { venueId } = await response.json();
const VENUE_ID = venueId;
```

---

## Alternative Solutions

### Option 1: API Endpoint (Recommended)
- ✅ Clean URLs: `?bedId=1`
- ✅ Scalable architecture
- ✅ Single source of truth
- ❌ Requires backend development

### Option 2: Update QR Codes (Quick Fix)
- ✅ No backend changes needed
- ✅ Immediate solution
- ❌ Requires regenerating all QR codes
- ❌ Longer URLs: `?bedId=1&venueId=1`

### Option 3: Use SpotPage URL Format
- ✅ Consistent with existing SpotPage
- ✅ No backend changes
- ❌ Requires QR code updates
- ❌ Different URL format: `?v=1&u=1`

---

## Priority & Timeline

**Priority:** HIGH 🔴
- Required before multi-venue deployment
- Production blocker for scaling

**Estimated Development:** 2-4 hours
- Database query: 30 minutes
- Controller implementation: 1 hour  
- Testing: 1-2 hours
- Documentation: 30 minutes

**Testing Requirements:**
- Unit exists and has venue → Returns venue info
- Unit exists but no venue → Returns error
- Unit doesn't exist → Returns 404
- Performance test with large unit counts

---

## Acceptance Criteria

- [ ] Endpoint returns correct venue for valid unit IDs
- [ ] Handles non-existent units gracefully
- [ ] Handles units without venue assignment
- [ ] Response time < 200ms for typical queries
- [ ] Frontend integration tested and working
- [ ] Multi-venue scenario tested

---

## Notes

- This is a **production blocker** for multi-venue deployments
- Frontend is already prepared to handle the API response
- Current system works for single venue but will break with multiple venues
- Recommend implementing Option 1 (API endpoint) for best long-term solution

---

**Created:** March 13, 2026  
**Status:** Pending Implementation  
**Assigned:** Kristi (Backend Developer)