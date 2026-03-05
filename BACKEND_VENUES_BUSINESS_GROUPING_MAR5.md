# Backend: Add Business Info to Venues API
## March 5, 2026

---

## Problem

Currently, the map shows individual venue markers. This creates clutter when a business has multiple venues (e.g., "Beach Bar Main", "Beach Bar VIP", "Beach Bar Restaurant").

**Better UX:** Show ONE marker per business, and when clicked, display all venues belonging to that business.

---

## Required Backend Change

### Update Public Venues API Response

**Endpoint:** `GET /api/public/Venues`

**Current Response:**
```json
[
  {
    "id": 16,
    "name": "Beach Bar",
    "type": "Beach",
    "latitude": 40.1234,
    "longitude": 19.5678,
    "availableUnitsCount": 25,
    "imageUrl": "https://...",
    "description": "..."
  }
]
```

**Required Response (ADD 2 FIELDS):**
```json
[
  {
    "id": 16,
    "name": "Beach Bar",
    "type": "Beach",
    "latitude": 40.1234,
    "longitude": 19.5678,
    "availableUnitsCount": 25,
    "imageUrl": "https://...",
    "description": "...",
    "businessId": 9,           // ← ADD THIS
    "businessName": "Black Bear"  // ← ADD THIS
  }
]
```

### Implementation

**Add to Venues Controller:**

```csharp
[HttpGet]
public async Task<IActionResult> GetPublicVenues()
{
    var venues = await _context.Venues
        .Include(v => v.Business) // ← Add this join
        .Where(v => !v.IsDeleted)
        .Select(v => new {
            id = v.Id,
            name = v.Name,
            type = v.Type,
            latitude = v.Latitude,
            longitude = v.Longitude,
            availableUnitsCount = v.AvailableUnitsCount,
            imageUrl = v.ImageUrl,
            description = v.Description,
            businessId = v.BusinessId,           // ← Add this
            businessName = v.Business.Name       // ← Add this
        })
        .ToListAsync();
        
    return Ok(venues);
}
```

---

## Frontend Implementation (After Backend Change)

Once backend adds `businessId` and `businessName`, the frontend will:

1. **Group venues by business**
   - Calculate average coordinates for business marker
   - Sum up total available units across all venues

2. **Show business marker on map**
   - Marker shows total availability across all venues
   - Label shows business name (not individual venue names)

3. **On click, show business bottom sheet**
   - Display business name as header
   - List all venues belonging to that business
   - User can select which venue to book

---

## Example Scenario

**Before (Current):**
- Map shows 3 separate markers:
  - "Beach Bar Main" (10 spots)
  - "Beach Bar VIP" (5 spots)
  - "Beach Bar Restaurant" (8 spots)

**After (Improved):**
- Map shows 1 marker:
  - "Black Bear" (23 spots total)
- Click marker → Bottom sheet shows:
  - **Black Bear**
    - Beach Bar Main (10 spots)
    - Beach Bar VIP (5 spots)
    - Beach Bar Restaurant (8 spots)

---

## Benefits

1. **Cleaner map** - Less visual clutter
2. **Better branding** - Shows business name, not venue names
3. **Easier discovery** - Users find businesses, not individual venues
4. **Accurate availability** - Shows total capacity across all locations

---

## Testing

After backend deployment:

```bash
# Test API response
curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues

# Should return businessId and businessName for each venue
```

---

**Status:** Waiting for backend implementation
**Priority:** MEDIUM - UX improvement
**Estimated Time:** 10 minutes (backend only)
