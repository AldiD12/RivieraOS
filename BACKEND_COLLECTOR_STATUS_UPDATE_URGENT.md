# 🔴 URGENT: Collector Status Update Endpoint Missing

## Current Status

✅ `GET /api/collector/units` - **WORKS PERFECTLY**  
❌ `PUT /api/collector/units/{id}/status` - **MISSING** (returns 400 Bad Request)

## Console Evidence

```
✅ Collector API success: GET /collector/units
📦 Venue data received: {venueId: 18, venueName: 'BEACH', zones: [...]}

❌ PUT https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/collector/units/97/status
   400 (Bad Request)
```

## What's Needed

Add the status update endpoint to the **same controller** where you implemented `GET /api/collector/units`.

### Endpoint Specification

**Route:** `PUT /api/collector/units/{id}/status`  
**Authorization:** `[Authorize(Policy = "Collector")]`

**Request Body:**
```json
{
  "status": "Occupied"
}
```

**Valid Status Values:**
- `"Available"`
- `"Reserved"`
- `"Occupied"`
- `"Maintenance"`

**Response:** `204 No Content` on success

### Implementation

Add this method to your Collector controller (wherever `GET /api/collector/units` is):

```csharp
[HttpPut("units/{id}/status")]
[Authorize(Policy = "Collector")]
public async Task<IActionResult> UpdateUnitStatus(int id, [FromBody] UpdateUnitStatusRequest request)
{
    // Get collector's venue from token
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
    var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
    
    if (user?.VenueId == null)
    {
        return StatusCode(403, new { error = "Collector not assigned to a venue" });
    }

    // Get the unit
    var unit = await _context.ZoneUnits
        .Include(zu => zu.VenueZone)
        .FirstOrDefaultAsync(zu => zu.Id == id);

    if (unit == null)
    {
        return NotFound(new { error = "Unit not found" });
    }

    // Verify unit belongs to collector's venue
    if (unit.VenueId != user.VenueId)
    {
        return StatusCode(403, new { error = "Unit does not belong to your venue" });
    }

    // Validate status
    var validStatuses = new[] { "Available", "Reserved", "Occupied", "Maintenance" };
    if (!validStatuses.Contains(request.Status))
    {
        return BadRequest(new { error = $"Invalid status. Must be one of: {string.Join(", ", validStatuses)}" });
    }

    // Update status
    unit.Status = request.Status;
    await _context.SaveChangesAsync();

    // Optional: Trigger SignalR notification
    try
    {
        await _hubContext.Clients.All.SendAsync("UnitStatusChanged", new
        {
            unitId = unit.Id,
            unitCode = unit.UnitCode,
            status = unit.Status,
            venueId = unit.VenueId,
            zoneId = unit.VenueZoneId
        });
    }
    catch (Exception ex)
    {
        _logger.LogWarning(ex, "Failed to send SignalR notification");
        // Don't fail the request if SignalR fails
    }

    return NoContent();
}
```

### DTO Required

If `UpdateUnitStatusRequest` doesn't exist, create it:

```csharp
public class UpdateUnitStatusRequest
{
    [Required]
    [RegularExpression("^(Available|Reserved|Occupied|Maintenance)$",
        ErrorMessage = "Status must be Available, Reserved, Occupied, or Maintenance")]
    public string Status { get; set; } = string.Empty;
}
```

## Testing After Deployment

```bash
# 1. Login as collector
POST /api/auth/login
{
  "email": "collector@beach.com",
  "password": "Test123!"
}

# 2. Update unit status
PUT /api/collector/units/97/status
Authorization: Bearer {token}
{
  "status": "Occupied"
}

# Expected: 204 No Content

# 3. Verify with GET
GET /api/collector/units
Authorization: Bearer {token}
# Should show unit 97 with status "Occupied"
```

## Frontend is Ready

The frontend is already configured and waiting for this endpoint:

```javascript
// frontend/src/services/collectorApi.js
updateUnitStatus: async (unitId, statusData) => {
  const response = await api.put(`/collector/units/${unitId}/status`, statusData);
  return response.data;
}

// frontend/src/pages/CollectorDashboard.jsx
await collectorApi.updateUnitStatus(unitId, { status: newStatus });
```

## Priority

🔴 **CRITICAL** - Collectors cannot manage units without this endpoint. The dashboard loads perfectly but status updates fail.

## Estimated Time

- 15 minutes to add the endpoint
- 10 minutes to test
- **Total: 25 minutes**

---

**Note:** The GET endpoint works great! Just need to add the PUT endpoint to the same controller.
