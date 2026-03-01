# Backend: Instant Booking API Implementation Needed

**Date:** March 1, 2026  
**Priority:** HIGH  
**For:** Prof Kristi  
**Frontend Status:** ✅ Complete (using temporary mock data)

---

## 🎯 WHAT WE NEED

The frontend now has a complete instant booking flow with group booking support. However, it's currently using **mock data** because the backend API needs to be updated to support:

1. **Zone-level booking** (not unit-level)
2. **Auto-assign available units**
3. **Group booking** (multiple adjacent sunbeds)
4. **Arrival time + auto-expiration**

---

## 📋 CURRENT BACKEND API

### Existing Endpoint: `POST /api/public/Reservations`

**Current Request Schema:**
```json
{
  "venueId": 1,
  "zoneUnitId": 12,  // ❌ PROBLEM: Requires specific unit ID
  "guestName": "John Doe",
  "guestPhone": "+355 69 123 4567",
  "guestCount": 2,
  "startTime": "2026-03-01T11:00:00Z",
  "endTime": "2026-03-01T18:00:00Z",
  "notes": "Optional notes"
}
```

**Problems:**
1. ❌ Requires `zoneUnitId` - tourist doesn't know which sunbed to pick
2. ❌ No support for booking multiple units at once
3. ❌ No `arrivalTime` field (only startTime/endTime)
4. ❌ No auto-expiration logic

---

## ✅ WHAT WE NEED

### New/Updated Endpoint: `POST /api/public/Reservations`

**New Request Schema:**
```json
{
  "venueId": 1,
  "zoneId": 5,  // ✅ NEW: Zone-level booking
  "guestName": "John Doe",
  "guestPhone": "+355 69 123 4567",
  "guestCount": 6,
  "sunbedCount": 3,  // ✅ NEW: Book multiple sunbeds
  "arrivalTime": "11:30",  // ✅ NEW: Expected arrival time
  "reservationDate": "2026-03-01",  // ✅ NEW: Date of reservation
  "notes": "Optional notes"
}
```

**New Response Schema:**
```json
{
  "bookingCode": "XIXA-A7B3C",
  "status": "CONFIRMED",
  "unitCodes": ["VIP-12", "VIP-13", "VIP-14"],  // ✅ Auto-assigned
  "areAdjacent": true,  // ✅ Indicates if units are next to each other
  "arrivalTime": "11:30",
  "expirationTime": "11:45",  // ✅ Arrival + 15 minutes
  "totalPrice": 150.00,
  "venueName": "Folie Beach Club",
  "zoneName": "VIP Section"
}
```

---

## 🏗️ BACKEND IMPLEMENTATION

### 1. Update Reservation Model

```csharp
public class Reservation
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public int ZoneId { get; set; }  // ✅ NEW: Zone-level
    public string GuestName { get; set; }
    public string GuestPhone { get; set; }
    public int GuestCount { get; set; }
    public int SunbedCount { get; set; }  // ✅ NEW
    public DateTime ReservationDate { get; set; }  // ✅ NEW
    public TimeSpan ArrivalTime { get; set; }  // ✅ NEW
    public DateTime ExpirationTime { get; set; }  // ✅ NEW
    public string Status { get; set; }  // CONFIRMED, CHECKED_IN, EXPIRED, CANCELLED
    public string BookingCode { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public virtual ICollection<ZoneUnit> Units { get; set; }  // ✅ Multiple units
}
```

### 2. Update ZoneUnit Model (Add Position)

```csharp
public class ZoneUnit
{
    public int Id { get; set; }
    public int ZoneId { get; set; }
    public string Code { get; set; }  // VIP-12
    public string Status { get; set; }  // Available, Reserved, Occupied
    public int? ReservationId { get; set; }
    public int? RowNumber { get; set; }  // ✅ NEW: For adjacency
    public int? ColumnNumber { get; set; }  // ✅ NEW: For adjacency
    public bool IsDeleted { get; set; }
}
```

### 3. Create Instant Booking Endpoint

```csharp
[HttpPost]
[Route("api/public/Reservations")]
public async Task<IActionResult> CreateInstantReservation([FromBody] InstantReservationRequest request)
{
    // 1. Find available units in zone
    var availableUnits = await _context.ZoneUnits
        .Where(u => u.ZoneId == request.ZoneId 
                 && u.Status == "Available" 
                 && !u.IsDeleted)
        .OrderBy(u => u.RowNumber)
        .ThenBy(u => u.ColumnNumber)
        .ToListAsync();
    
    if (availableUnits.Count < request.SunbedCount)
    {
        return BadRequest(new { 
            error = "Not enough available sunbeds",
            requested = request.SunbedCount,
            available = availableUnits.Count
        });
    }
    
    // 2. Try to find adjacent units
    var selectedUnits = FindAdjacentUnits(availableUnits, request.SunbedCount);
    var areAdjacent = AreUnitsAdjacent(selectedUnits);
    
    // 3. Calculate expiration time
    var arrivalDateTime = request.ReservationDate.Date + request.ArrivalTime;
    var expirationTime = arrivalDateTime.AddMinutes(15);
    
    // 4. Create reservation
    var reservation = new Reservation
    {
        VenueId = request.VenueId,
        ZoneId = request.ZoneId,
        GuestName = request.GuestName,
        GuestPhone = request.GuestPhone,
        GuestCount = request.GuestCount,
        SunbedCount = request.SunbedCount,
        ReservationDate = request.ReservationDate,
        ArrivalTime = request.ArrivalTime,
        ExpirationTime = expirationTime,
        Status = "CONFIRMED",  // ✅ Instant confirmation
        BookingCode = GenerateBookingCode(),
        CreatedAt = DateTime.UtcNow
    };
    
    _context.Reservations.Add(reservation);
    await _context.SaveChangesAsync();
    
    // 5. Assign units to reservation
    var unitCodes = new List<string>();
    foreach (var unit in selectedUnits)
    {
        unit.Status = "Reserved";
        unit.ReservationId = reservation.Id;
        unitCodes.Add(unit.Code);
    }
    
    await _context.SaveChangesAsync();
    
    // 6. Get venue and zone names
    var venue = await _context.Venues.FindAsync(request.VenueId);
    var zone = await _context.Zones.FindAsync(request.ZoneId);
    
    // 7. Return confirmation
    return Ok(new
    {
        bookingCode = reservation.BookingCode,
        status = "CONFIRMED",
        unitCodes = unitCodes,
        areAdjacent = areAdjacent,
        arrivalTime = request.ArrivalTime.ToString(@"hh\:mm"),
        expirationTime = expirationTime.ToString("HH:mm"),
        totalPrice = selectedUnits.Sum(u => u.Zone.BasePrice),
        venueName = venue.Name,
        zoneName = zone.Name
    });
}
```

### 4. Find Adjacent Units Algorithm

```csharp
private List<ZoneUnit> FindAdjacentUnits(List<ZoneUnit> availableUnits, int count)
{
    // Try to find consecutive units in same row
    for (int i = 0; i <= availableUnits.Count - count; i++)
    {
        var group = availableUnits.Skip(i).Take(count).ToList();
        
        if (AreUnitsAdjacent(group))
        {
            return group;  // Found adjacent group!
        }
    }
    
    // Fallback: Return first N available units (even if not adjacent)
    return availableUnits.Take(count).ToList();
}

private bool AreUnitsAdjacent(List<ZoneUnit> units)
{
    if (units.Count <= 1) return true;
    
    // All units must be in same row
    var firstRow = units[0].RowNumber;
    if (units.Any(u => u.RowNumber != firstRow))
        return false;
    
    // Column numbers must be consecutive
    var columns = units.Select(u => u.ColumnNumber).OrderBy(c => c).ToList();
    for (int i = 1; i < columns.Count; i++)
    {
        if (columns[i] != columns[i-1] + 1)
            return false;
    }
    
    return true;
}
```

### 5. Auto-Expiration Background Job

```csharp
public class ReservationExpirationJob : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;
                
                // Find expired reservations
                var expiredReservations = await _context.Reservations
                    .Include(r => r.Units)
                    .Where(r => r.Status == "CONFIRMED" 
                             && r.ExpirationTime <= now)
                    .ToListAsync();
                
                foreach (var reservation in expiredReservations)
                {
                    // Update reservation status
                    reservation.Status = "EXPIRED";
                    
                    // Release all units
                    foreach (var unit in reservation.Units)
                    {
                        unit.Status = "Available";
                        unit.ReservationId = null;
                    }
                    
                    _logger.LogInformation($"Reservation {reservation.BookingCode} expired - {reservation.Units.Count} units released");
                }
                
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in expiration job");
            }
            
            // Run every 1 minute
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
```

### 6. Update Check-In Endpoint

```csharp
[HttpPost]
[Route("api/collector/Reservations/{bookingCode}/checkin")]
public async Task<IActionResult> CheckInReservation(string bookingCode)
{
    var reservation = await _context.Reservations
        .Include(r => r.Units)
        .FirstOrDefaultAsync(r => r.BookingCode == bookingCode);
    
    if (reservation == null)
    {
        return NotFound(new { error = "Reservation not found" });
    }
    
    // Check if expired
    if (reservation.Status == "EXPIRED" || DateTime.UtcNow > reservation.ExpirationTime)
    {
        reservation.Status = "EXPIRED";
        
        // Release units
        foreach (var unit in reservation.Units)
        {
            unit.Status = "Available";
            unit.ReservationId = null;
        }
        
        await _context.SaveChangesAsync();
        
        return BadRequest(new { 
            error = "Reservation has expired",
            expirationTime = reservation.ExpirationTime
        });
    }
    
    // Valid check-in
    reservation.Status = "CHECKED_IN";
    
    foreach (var unit in reservation.Units)
    {
        unit.Status = "Occupied";
    }
    
    await _context.SaveChangesAsync();
    
    return Ok(new { 
        message = "Check-in successful",
        unitCodes = reservation.Units.Select(u => u.Code).ToList()
    });
}
```

---

## 📊 DATABASE MIGRATION

```sql
-- Add new fields to Reservations table
ALTER TABLE Reservations 
ADD ZoneId INT NULL,
    SunbedCount INT NOT NULL DEFAULT 1,
    ReservationDate DATE NOT NULL DEFAULT GETDATE(),
    ArrivalTime TIME NOT NULL DEFAULT '11:00:00',
    ExpirationTime DATETIME2 NULL;

-- Add foreign key
ALTER TABLE Reservations
ADD CONSTRAINT FK_Reservations_Zones 
FOREIGN KEY (ZoneId) REFERENCES Zones(Id);

-- Add position fields to ZoneUnits table
ALTER TABLE ZoneUnits
ADD RowNumber INT NULL,
    ColumnNumber INT NULL;

-- Update existing reservations
UPDATE Reservations 
SET SunbedCount = 1,
    ReservationDate = CAST(CreatedAt AS DATE),
    ArrivalTime = '11:00:00'
WHERE SunbedCount IS NULL;
```

---

## 🎯 FRONTEND INTEGRATION

Once backend is ready, update `VenueBottomSheet.jsx`:

```javascript
// Remove mock data and use real API
const result = await reservationApi.createGroupReservation({
  venueId: venue.id,
  zoneId: selectedZone.id,
  guestName: bookingData.guestName,
  guestPhone: bookingData.guestPhone,
  guestCount: bookingData.guestCount,
  sunbedCount: bookingData.sunbedCount,
  arrivalTime: bookingData.arrivalTime,
  reservationDate: bookingData.date
});

// Navigate to success page with real booking code
navigate(`/success/${result.bookingCode}`);
```

And update `BookingSuccessPage.jsx`:

```javascript
// Replace localStorage with API call
const data = await reservationApi.getReservationStatus(bookingCode);
setBooking(data);
```

---

## ✅ TESTING CHECKLIST

Once implemented, test:

- [ ] Book 1 sunbed → Get 1 unit code
- [ ] Book 3 sunbeds → Get 3 adjacent unit codes (if available)
- [ ] Book 5 sunbeds when only 3 adjacent → Get 5 units (some not adjacent)
- [ ] Verify expiration time = arrival time + 15 minutes
- [ ] Wait 16 minutes → Verify units auto-released
- [ ] Try to check in after expiration → Should fail
- [ ] Check in before expiration → Should succeed
- [ ] Verify all units change to "Occupied" on check-in

---

## 🚀 SUMMARY

**Frontend Status:** ✅ Complete (using mock data)  
**Backend Status:** ❌ Needs implementation  
**Estimated Time:** 4-6 hours  

**Key Changes Needed:**
1. Add `ZoneId`, `SunbedCount`, `ArrivalTime`, `ExpirationTime` to Reservation model
2. Add `RowNumber`, `ColumnNumber` to ZoneUnit model
3. Implement instant booking endpoint with auto-assignment
4. Implement adjacent unit finding algorithm
5. Create auto-expiration background job
6. Update check-in endpoint to validate expiration

Once backend is ready, frontend just needs to uncomment the API calls and remove the mock data!

