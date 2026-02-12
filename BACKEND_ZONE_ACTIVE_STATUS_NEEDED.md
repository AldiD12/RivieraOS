# Backend Task: Zone Active/Inactive Status Support

**Status:** BACKEND IMPLEMENTATION NEEDED  
**Priority:** Medium  
**Assigned To:** Prof Kristi (Backend Developer)

---

## Problem

The frontend displays an `isActive` status badge for zones (Active/Inactive), but the backend does NOT support this functionality yet.

**Current Frontend Code (BusinessAdminDashboard.jsx, line ~1360):**
```jsx
<span className={`px-2 py-1 rounded text-xs ${
  zone.isActive 
    ? 'bg-green-900 text-green-300' 
    : 'bg-red-900 text-red-300'
}`}>
  {zone.isActive ? 'Active' : 'Inactive'}
</span>
```

This code assumes `zone.isActive` exists, but it doesn't come from the backend.

---

## What's Missing in Backend

### 1. Database Schema
The `Zones` table needs an `IsActive` column:
```sql
ALTER TABLE Zones ADD IsActive BIT NOT NULL DEFAULT 1;
```

### 2. DTOs Need Update

**BizZoneListItemDto** (currently missing `isActive`):
```csharp
public class BizZoneListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string ZoneType { get; set; }
    public int CapacityPerUnit { get; set; }
    public double BasePrice { get; set; }
    public bool IsActive { get; set; }  // ← ADD THIS
}
```

**BizZoneDetailDto** (also needs it):
```csharp
public class BizZoneDetailDto
{
    // ... existing fields ...
    public bool IsActive { get; set; }  // ← ADD THIS
}
```

**BizUpdateZoneRequest** (to allow updating status):
```csharp
public class BizUpdateZoneRequest
{
    public string Name { get; set; }
    public string ZoneType { get; set; }
    public int CapacityPerUnit { get; set; }
    public double BasePrice { get; set; }
    public bool IsActive { get; set; }  // ← ADD THIS
}
```

### 3. New Endpoint (Optional but Recommended)

Add a toggle endpoint like venues have:

**Endpoint:** `POST /api/business/venues/{venueId}/Zones/{id}/toggle-active`

**Controller Method:**
```csharp
[HttpPost("{id}/toggle-active")]
public async Task<IActionResult> ToggleZoneActive(int venueId, int id)
{
    var zone = await _context.Zones
        .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);
    
    if (zone == null)
        return NotFound();
    
    zone.IsActive = !zone.IsActive;
    await _context.SaveChangesAsync();
    
    return Ok(new { isActive = zone.IsActive });
}
```

---

## Frontend Implementation (After Backend is Ready)

Once backend supports `isActive`, we'll add a toggle button in BusinessAdminDashboard:

```jsx
<button
  onClick={async () => {
    try {
      await businessApi.zones.toggleActive(selectedVenue.id, zone.id);
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

And add the API method to `businessApi.js`:

```javascript
export const businessZoneApi = {
  // ... existing methods ...
  
  // Toggle zone active status
  toggleActive: async (venueId, zoneId) => {
    console.log('📤 Toggling business zone active status:', venueId, zoneId);
    const response = await api.post(`/business/venues/${venueId}/Zones/${zoneId}/toggle-active`);
    return response.data;
  }
};
```

---

## Why This Matters

**Business Use Case:**
- Venues may have seasonal zones (e.g., "Winter Terrace" only active Nov-Mar)
- Zones under maintenance should be deactivated (no bookings/orders)
- Temporary closures (weather, events, renovations)

**Similar to:**
- Venues have `isActive` toggle ✅
- Products have `isAvailable` toggle ✅
- Categories have `isActive` toggle ✅
- Zones need `isActive` toggle ❌ (missing)

---

## Testing After Implementation

1. Create a zone via BusinessAdminDashboard
2. Verify `isActive` defaults to `true`
3. Toggle zone to inactive
4. Verify status badge updates in UI
5. Verify inactive zones don't accept new bookings (if applicable)
6. Toggle back to active
7. Test with SuperAdminDashboard as well

---

## Related Files

**Backend (Prof Kristi):**
- `Controllers/Business/ZonesController.cs`
- `DTOs/Business/BizZoneListItemDto.cs`
- `DTOs/Business/BizZoneDetailDto.cs`
- `DTOs/Business/BizUpdateZoneRequest.cs`
- `Models/Zone.cs`
- Database migration for `IsActive` column

**Frontend (Will implement after backend is ready):**
- `frontend/src/pages/BusinessAdminDashboard.jsx`
- `frontend/src/pages/SuperAdminDashboard.jsx`
- `frontend/src/services/businessApi.js`

---

**Next Steps:**
1. Prof Kristi implements backend support for zone `isActive`
2. Update swagger.json with new field/endpoint
3. Frontend adds toggle button and API integration
4. Test end-to-end functionality
