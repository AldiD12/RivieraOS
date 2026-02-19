# Backend Task: Collector API Endpoints

## Overview

Create collector-specific API endpoints so collectors can access their venue's data without needing business admin permissions.

## Current Issue

Collectors are getting 403 Forbidden when trying to access business admin endpoints:
- `GET /api/business/venues/{venueId}/Zones` → 403 Forbidden
- Collectors need their own endpoints that automatically use their assigned venue

## Required Endpoints

### 1. Get Zones for Collector's Venue

**Endpoint:** `GET /api/collector/zones`

**Authorization:** `[Authorize(Roles = "Collector")]`

**Logic:**
- Get collector's `VenueId` from JWT token
- Return all zones for that venue
- Only active zones

**Response:**
```json
[
  {
    "id": 1,
    "name": "VIP Section",
    "zoneType": "Beach",
    "capacityPerUnit": 2,
    "basePrice": 50.00,
    "isActive": true
  }
]
```

**C# Implementation:**
```csharp
[HttpGet("zones")]
[Authorize(Roles = "Collector")]
public async Task<IActionResult> GetMyZones()
{
    var userId = User.GetUserId();
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == userId);
    
    if (user.VenueId == null)
        return BadRequest(new { message = "Collector not assigned to venue" });
    
    var zones = await _context.Zones
        .Where(z => z.VenueId == user.VenueId && z.IsActive)
        .OrderBy(z => z.SortOrder)
        .Select(z => new
        {
            z.Id,
            z.Name,
            z.ZoneType,
            z.CapacityPerUnit,
            z.BasePrice,
            z.IsActive
        })
        .ToListAsync();
    
    return Ok(zones);
}
```

---

### 2. Get Bookings for Collector's Venue

**Endpoint:** `GET /api/collector/bookings`

**Authorization:** `[Authorize(Roles = "Collector")]`

**Query Parameters:**
- `zoneId` (optional) - Filter by specific zone
- `status` (optional) - Filter by status (Pending, CheckedIn, CheckedOut, Cancelled)
- `date` (optional) - Filter by date (default: today)

**Logic:**
- Get collector's `VenueId` from JWT token
- Return bookings for that venue
- Include zone and unit information
- Order by most recent first

**Response:**
```json
[
  {
    "id": 123,
    "guestName": "John Doe",
    "guestPhone": "+355123456789",
    "zoneName": "VIP Section",
    "unitCode": "A1",
    "status": "CheckedIn",
    "checkInTime": "2026-02-19T10:30:00Z",
    "checkOutTime": null,
    "numberOfGuests": 2,
    "notes": "Requested umbrella"
  }
]
```

**C# Implementation:**
```csharp
[HttpGet("bookings")]
[Authorize(Roles = "Collector")]
public async Task<IActionResult> GetMyBookings(
    [FromQuery] int? zoneId = null,
    [FromQuery] string status = null,
    [FromQuery] DateTime? date = null)
{
    var userId = User.GetUserId();
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == userId);
    
    if (user.VenueId == null)
        return BadRequest(new { message = "Collector not assigned to venue" });
    
    var query = _context.Bookings
        .Include(b => b.Zone)
        .Include(b => b.ZoneUnit)
        .Where(b => b.Zone.VenueId == user.VenueId);
    
    // Apply filters
    if (zoneId.HasValue)
        query = query.Where(b => b.ZoneId == zoneId.Value);
    
    if (!string.IsNullOrEmpty(status))
        query = query.Where(b => b.Status == status);
    
    if (date.HasValue)
        query = query.Where(b => b.BookingDate.Date == date.Value.Date);
    else
        query = query.Where(b => b.BookingDate.Date == DateTime.UtcNow.Date);
    
    var bookings = await query
        .OrderByDescending(b => b.CreatedAt)
        .Select(b => new
        {
            b.Id,
            b.GuestName,
            b.GuestPhone,
            ZoneName = b.Zone.Name,
            UnitCode = b.ZoneUnit.UnitCode,
            b.Status,
            b.CheckInTime,
            b.CheckOutTime,
            b.NumberOfGuests,
            b.Notes
        })
        .ToListAsync();
    
    return Ok(bookings);
}
```

---

### 3. Check-In Booking

**Endpoint:** `POST /api/collector/bookings/{id}/check-in`

**Authorization:** `[Authorize(Roles = "Collector")]`

**Request Body:**
```json
{
  "notes": "Guest arrived on time" // optional
}
```

**Logic:**
- Verify booking belongs to collector's venue
- Update status to "CheckedIn"
- Set `CheckInTime` to current time
- Return updated booking

**C# Implementation:**
```csharp
[HttpPost("bookings/{id}/check-in")]
[Authorize(Roles = "Collector")]
public async Task<IActionResult> CheckInBooking(int id, [FromBody] CheckInRequest request)
{
    var userId = User.GetUserId();
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == userId);
    
    if (user.VenueId == null)
        return BadRequest(new { message = "Collector not assigned to venue" });
    
    var booking = await _context.Bookings
        .Include(b => b.Zone)
        .FirstOrDefaultAsync(b => b.Id == id);
    
    if (booking == null)
        return NotFound(new { message = "Booking not found" });
    
    // Verify booking belongs to collector's venue
    if (booking.Zone.VenueId != user.VenueId)
        return Forbid();
    
    booking.Status = "CheckedIn";
    booking.CheckInTime = DateTime.UtcNow;
    if (!string.IsNullOrEmpty(request?.Notes))
        booking.Notes = request.Notes;
    
    await _context.SaveChangesAsync();
    
    return Ok(new { message = "Guest checked in successfully", booking });
}
```

---

### 4. Check-Out Booking

**Endpoint:** `POST /api/collector/bookings/{id}/check-out`

**Authorization:** `[Authorize(Roles = "Collector")]`

**Request Body:**
```json
{
  "notes": "Guest left satisfied" // optional
}
```

**Logic:**
- Verify booking belongs to collector's venue
- Update status to "CheckedOut"
- Set `CheckOutTime` to current time
- Return updated booking

**C# Implementation:**
```csharp
[HttpPost("bookings/{id}/check-out")]
[Authorize(Roles = "Collector")]
public async Task<IActionResult> CheckOutBooking(int id, [FromBody] CheckOutRequest request)
{
    var userId = User.GetUserId();
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Id == userId);
    
    if (user.VenueId == null)
        return BadRequest(new { message = "Collector not assigned to venue" });
    
    var booking = await _context.Bookings
        .Include(b => b.Zone)
        .FirstOrDefaultAsync(b => b.Id == id);
    
    if (booking == null)
        return NotFound(new { message = "Booking not found" });
    
    // Verify booking belongs to collector's venue
    if (booking.Zone.VenueId != user.VenueId)
        return Forbid();
    
    booking.Status = "CheckedOut";
    booking.CheckOutTime = DateTime.UtcNow;
    if (!string.IsNullOrEmpty(request?.Notes))
        booking.Notes = request.Notes;
    
    await _context.SaveChangesAsync();
    
    return Ok(new { message = "Guest checked out successfully", booking });
}
```

---

### 5. Get Venue Statistics (Optional)

**Endpoint:** `GET /api/collector/stats`

**Authorization:** `[Authorize(Roles = "Collector")]`

**Response:**
```json
{
  "venueName": "BEACH",
  "totalZones": 3,
  "totalUnits": 50,
  "occupiedUnits": 35,
  "todayBookings": 42,
  "checkedIn": 35,
  "pending": 7
}
```

---

## File Structure

Create new controller:
```
BlackBear.Services.Core/
  Controllers/
    Collector/
      CollectorController.cs  ← NEW FILE
```

## DTOs Needed

Create in `BlackBear.Services.Core/DTOs/Collector/`:

```csharp
// CollectorDtos.cs
public class CheckInRequest
{
    public string? Notes { get; set; }
}

public class CheckOutRequest
{
    public string? Notes { get; set; }
}

public class CollectorZoneDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string ZoneType { get; set; }
    public int CapacityPerUnit { get; set; }
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; }
}

public class CollectorBookingDto
{
    public int Id { get; set; }
    public string GuestName { get; set; }
    public string GuestPhone { get; set; }
    public string ZoneName { get; set; }
    public string UnitCode { get; set; }
    public string Status { get; set; }
    public DateTime? CheckInTime { get; set; }
    public DateTime? CheckOutTime { get; set; }
    public int NumberOfGuests { get; set; }
    public string? Notes { get; set; }
}
```

## Testing

After implementation, test with:

1. **Login as Collector:**
   ```
   POST /api/auth/login
   { "email": "collector@test.com", "password": "password" }
   ```

2. **Get Zones:**
   ```
   GET /api/collector/zones
   Authorization: Bearer {token}
   ```

3. **Get Bookings:**
   ```
   GET /api/collector/bookings?date=2026-02-19
   Authorization: Bearer {token}
   ```

4. **Check-In:**
   ```
   POST /api/collector/bookings/123/check-in
   Authorization: Bearer {token}
   { "notes": "Guest arrived" }
   ```

## Security Notes

✅ All endpoints require `[Authorize(Roles = "Collector")]`
✅ Collectors can ONLY access data for their assigned venue
✅ VenueId is read from JWT token (not from request parameters)
✅ All operations are validated against collector's venue

## Priority

🔴 **HIGH PRIORITY** - Collectors cannot use the dashboard without these endpoints

## Estimated Time

- 2-3 hours for implementation
- 1 hour for testing
- Total: 3-4 hours

## Dependencies

✅ User.VenueId field already exists (completed)
✅ Login returns VenueId/VenueName (completed)
❌ Collector endpoints (THIS TASK)

## Next Steps After Completion

1. Deploy to Azure
2. Update frontend to use new collector endpoints
3. Test on production with real collector account
