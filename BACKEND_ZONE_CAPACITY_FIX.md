# Backend Fix Required: Zone Capacity & Venue Capacity Not Saving

## Issue 1: Zone Capacity Not Saving
When creating zones via SuperAdmin, the capacity and type are not being saved.

## Evidence from Logs

**Frontend sends (POST /superadmin/venues/11/Zones):**
```json
{
  "name": "FAMILY",
  "type": "Dining",
  "capacity": 23,
  "description": "",
  "sortOrder": 0,
  "isActive": true
}
```

**Backend returns:**
```json
{
  "id": 6,
  "name": "FAMILY",
  "zoneType": null,        // ❌ Should be "Dining"
  "capacityPerUnit": 0,    // ❌ Should be 23
  "basePrice": 0
}
```

## Root Cause
The SuperAdmin zone creation endpoint is not mapping the request fields correctly:
- Frontend sends: `capacity` → Backend expects: `capacityPerUnit`
- Frontend sends: `type` → Backend expects: `zoneType`

## Required Fix for Zones

### Option 1: Update Backend to Accept Frontend Field Names
**File:** `BlackBear.Services.Core/Controllers/SuperAdmin/ZonesController.cs`

Update the POST endpoint to map the fields:

```csharp
[HttpPost]
public async Task<ActionResult<ZoneDto>> CreateZone(int venueId, [FromBody] CreateZoneRequest request)
{
    var zone = new VenueZone
    {
        VenueId = venueId,
        Name = request.Name,
        ZoneType = request.Type,              // Map 'type' to 'ZoneType'
        CapacityPerUnit = request.Capacity,   // Map 'capacity' to 'CapacityPerUnit'
        Description = request.Description,
        SortOrder = request.SortOrder,
        IsActive = request.IsActive,
        CreatedAt = DateTime.UtcNow
    };
    
    _context.VenueZones.Add(zone);
    await _context.SaveChangesAsync();
    
    return Ok(MapToDto(zone));
}
```

---

## Issue 2: Venue Capacity Field Missing

Venues currently don't have a capacity field. We need to add it to track total venue capacity.

## Required Changes for Venue Capacity

### 1. Add Capacity Column to Database
**Migration needed:**

```sql
ALTER TABLE catalog_venues 
ADD COLUMN capacity INTEGER DEFAULT 0;
```

### 2. Update Venue Entity
**File:** `BlackBear.Services.Core/Entities/Venue.cs`

Add the capacity property:

```csharp
[Column("capacity")]
public int Capacity { get; set; } = 0;
```

### 3. Update Venue DTOs
**File:** `BlackBear.Services.Core/DTOs/SuperAdmin/VenueDtos.cs`

Add capacity to both DTOs:

```csharp
public class VenueListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; }
    public bool OrderingEnabled { get; set; }
    public int Capacity { get; set; }  // ✅ ADD THIS
}

public class VenueDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? ImageUrl { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public bool IsActive { get; set; }
    public bool OrderingEnabled { get; set; }
    public int Capacity { get; set; }  // ✅ ADD THIS
    public DateTime CreatedAt { get; set; }
}
```

### 4. Update Venue Controllers
**File:** `BlackBear.Services.Core/Controllers/SuperAdmin/VenuesController.cs`

Update the GET endpoints to include capacity:

```csharp
// GET: api/superadmin/businesses/{businessId}/Venues
[HttpGet]
public async Task<ActionResult<List<VenueListItemDto>>> GetVenues(int businessId)
{
    var venues = await _context.Venues
        .Where(v => v.BusinessId == businessId && !v.IsDeleted)
        .Select(v => new VenueListItemDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Address = v.Address,
            IsActive = v.IsActive,
            OrderingEnabled = v.OrderingEnabled,
            Capacity = v.Capacity  // ✅ ADD THIS
        })
        .ToListAsync();
    
    return Ok(venues);
}
```

Update POST/PUT endpoints to accept and save capacity:

```csharp
// POST: api/superadmin/businesses/{businessId}/Venues
[HttpPost]
public async Task<ActionResult<VenueDetailDto>> CreateVenue(int businessId, [FromBody] CreateVenueRequest request)
{
    var venue = new Venue
    {
        BusinessId = businessId,
        Name = request.Name,
        Type = request.Type,
        Description = request.Description,
        Address = request.Address,
        ImageUrl = request.ImageUrl,
        Latitude = request.Latitude,
        Longitude = request.Longitude,
        OrderingEnabled = request.OrderingEnabled,
        Capacity = request.Capacity,  // ✅ ADD THIS
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
    
    _context.Venues.Add(venue);
    await _context.SaveChangesAsync();
    
    return Ok(MapToDetailDto(venue));
}
```

---

## Testing

### Zone Capacity Test:
1. Create a zone with capacity = 23 and type = "Dining"
2. Verify the response shows:
   ```json
   {
     "capacityPerUnit": 23,
     "zoneType": "Dining"
   }
   ```
3. Refresh the page and verify the zone still shows capacity = 23

### Venue Capacity Test:
1. Create a venue with capacity = 100
2. Verify the response includes `"capacity": 100`
3. Verify the venue list displays the capacity
4. Edit the venue and change capacity to 150
5. Verify the update persists

---

## Frontend Display

Once backend is fixed, the frontend will automatically display:
- **Zones:** "Capacity: 23 | Price: €0" (already implemented)
- **Venues:** Will show capacity in venue cards (needs frontend update after backend is ready)

## Priority
1. **Zone capacity** - High (currently broken)
2. **Venue capacity** - Medium (new feature)
