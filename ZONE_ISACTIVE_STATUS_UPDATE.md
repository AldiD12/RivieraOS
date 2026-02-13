# Zone IsActive Field - Status Update ✅

**Date:** February 13, 2026  
**Backend Commit:** 3f19c05  
**Status:** Partially Complete (Database ✅, DTOs ❌, Frontend ✅)

## Summary

Backend added `Zone.IsActive` field to database (commit 3f19c05), but DTOs and controllers haven't been updated yet. Frontend already displays the field and is ready to use it once backend DTOs are updated.

---

## What's Complete

### ✅ Database Schema
**File:** `Entities/VenueZone.cs`

```csharp
[Column("is_active")]
public bool IsActive { get; set; } = true;
```

**Migration:** `20260209224824_AddZoneIsActive.cs`

The database field exists and defaults to `true`.

### ✅ Frontend Display
**Files:** 
- `frontend/src/pages/BusinessAdminDashboard.jsx` (line ~1360)
- `frontend/src/pages/SuperAdminDashboard.jsx`

```jsx
<span className={`px-2 py-1 rounded text-xs ${
  zone.isActive 
    ? 'bg-green-900 text-green-300' 
    : 'bg-red-900 text-red-300'
}`}>
  {zone.isActive ? 'Active' : 'Inactive'}
</span>
```

Frontend is ready and waiting for backend to send `isActive` in API responses.

---

## What's Missing (Backend Task for Prof Kristi)

### ❌ DTOs Don't Include IsActive

**File:** `DTOs/Business/ZoneDtos.cs`

**BizZoneListItemDto** (currently missing):
```csharp
public class BizZoneListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ZoneType { get; set; }
    public int CapacityPerUnit { get; set; }
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; }  // ← ADD THIS
}
```

**BizZoneDetailDto** (currently missing):
```csharp
public class BizZoneDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ZoneType { get; set; }
    public int CapacityPerUnit { get; set; }
    public decimal BasePrice { get; set; }
    public int VenueId { get; set; }
    public string? VenueName { get; set; }
    public bool IsActive { get; set; }  // ← ADD THIS
}
```

**BizUpdateZoneRequest** (currently missing):
```csharp
public class BizUpdateZoneRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? ZoneType { get; set; }

    public int CapacityPerUnit { get; set; } = 1;

    public decimal BasePrice { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;  // ← ADD THIS
}
```

### ❌ SuperAdmin DTOs Also Need Update

**File:** `DTOs/SuperAdmin/ZoneDtos.cs`

Same fields need to be added to:
- `ZoneListItemDto`
- `ZoneDetailDto`
- `UpdateZoneRequest`

### ❌ Controllers Need to Map IsActive

**Files:**
- `Controllers/Business/ZonesController.cs`
- `Controllers/SuperAdmin/ZonesController.cs`

When mapping from `VenueZone` entity to DTOs, include `IsActive`:

```csharp
// Example in GET endpoint
var zones = await _context.VenueZones
    .Where(z => z.VenueId == venueId && !z.IsDeleted)
    .Select(z => new BizZoneListItemDto
    {
        Id = z.Id,
        Name = z.Name,
        ZoneType = z.ZoneType,
        CapacityPerUnit = z.CapacityPerUnit,
        BasePrice = z.BasePrice,
        IsActive = z.IsActive  // ← ADD THIS
    })
    .ToListAsync();
```

### ❌ Optional: Toggle Endpoint

Add a dedicated toggle endpoint (like venues have):

**Endpoint:** `POST /api/business/venues/{venueId}/Zones/{id}/toggle-active`

```csharp
[HttpPost("{id}/toggle-active")]
public async Task<IActionResult> ToggleZoneActive(int venueId, int id)
{
    var zone = await _context.VenueZones
        .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId && !z.IsDeleted);
    
    if (zone == null)
        return NotFound();
    
    zone.IsActive = !zone.IsActive;
    await _context.SaveChangesAsync();
    
    return Ok(new { isActive = zone.IsActive });
}
```

---

## Frontend Implementation (After Backend DTOs Updated)

Once backend sends `isActive` in API responses, the frontend will automatically display it (already implemented).

### Optional: Add Toggle Button

We can add a toggle button in the dashboards:

```jsx
<button
  onClick={async () => {
    try {
      // Option 1: Use toggle endpoint (if backend adds it)
      await businessApi.zones.toggleActive(selectedVenue.id, zone.id);
      
      // Option 2: Use update endpoint with current values
      await businessApi.zones.update(selectedVenue.id, zone.id, {
        ...zone,
        isActive: !zone.isActive
      });
      
      // Refresh zones list
      fetchZones(selectedVenue.id);
    } catch (error) {
      console.error('Failed to toggle zone status:', error);
    }
  }}
  className="text-yellow-400 hover:text-yellow-300 text-sm"
>
  {zone.isActive ? 'Deactivate' : 'Activate'}
</button>
```

---

## Business Use Cases

Why zones need active/inactive status:

1. **Seasonal Zones:** "Winter Terrace" only active Nov-Mar
2. **Maintenance:** Zone under repair, no bookings allowed
3. **Weather:** Outdoor zones closed during bad weather
4. **Events:** Zone reserved for private event
5. **Capacity Management:** Temporarily close zones during low season

---

## Testing Checklist (After Backend Update)

1. ✅ Database has `is_active` column (defaults to true)
2. ❌ GET zones API returns `isActive` field
3. ❌ POST/PUT zones API accepts `isActive` field
4. ✅ Frontend displays Active/Inactive badge
5. ❌ Can update zone status via dashboard
6. ❌ Inactive zones don't accept new bookings (if applicable)

---

## Next Steps

**For Prof Kristi (Backend):**
1. Add `IsActive` to all Zone DTOs (Business and SuperAdmin)
2. Update controllers to map `IsActive` field
3. Test GET/POST/PUT endpoints return/accept `isActive`
4. Optional: Add `/toggle-active` endpoint
5. Update swagger.json

**For Frontend (After Backend Complete):**
1. Verify `isActive` appears in API responses
2. Add toggle button to dashboards (optional)
3. Add API method for toggle (if endpoint added)
4. Test end-to-end functionality

---

## Related Documentation

- `BACKEND_ZONE_ACTIVE_STATUS_NEEDED.md` - Original issue documentation
- Backend commit: `3f19c05` - Added Zone.IsActive field
- Migration: `20260209224824_AddZoneIsActive.cs`

---

## Conclusion

The database field exists, but the API layer (DTOs and controllers) needs to be updated to expose it. Frontend is ready and waiting. This is a quick backend task - just add the field to DTOs and map it in controllers.
