# Prof Kristi - Backend Tasks Summary

**Date:** February 26, 2026  
**Priority:** HIGH - Required for production  
**Total Tasks:** 3 major features  
**Estimated Time:** 4-5 hours total

---

## 📋 TASK OVERVIEW

### Task 1: XIXA Approval Flow (CollectorBookingsController)
**Priority:** HIGH  
**Time:** 1.5 hours  
**Status:** ⏳ Pending  
**Document:** `XIXA_BALKAN_REALITY_IMPLEMENTATION.md`

### Task 2: Capacity-Based Booking System
**Priority:** HIGH  
**Time:** 2 hours  
**Status:** ⏳ Pending  
**Document:** `HUMAN_TETRIS_CAPACITY_BOOKING.md`

### Task 3: Booking Cleanup Job (15-minute expiry)
**Priority:** MEDIUM  
**Time:** 30 minutes  
**Status:** ⏳ Pending  
**Document:** `PSYCHOLOGICAL_TRAPS_FIXED.md`

---

## 🎯 TASK 1: XIXA Approval Flow

### What It Does
Allows collectors to approve/reject bookings from WhatsApp link with visual unit selection.

### Files to Create/Modify

**1. Create New Controller**
```
File: backend-temp/BlackBear.Services/BlackBear.Services.Core/Controllers/Collector/CollectorBookingsController.cs
```

**Endpoints to Build:**

#### GET /api/collector/bookings/{bookingCode}
```csharp
[HttpGet("bookings/{bookingCode}")]
[Authorize(Policy = "Collector")]
public async Task<ActionResult<CollectorBookingDetailsDto>> GetBookingDetails(string bookingCode)
{
    var collectorVenueId = await GetCollectorVenueIdAsync();
    if (collectorVenueId == null)
        return StatusCode(403, new { error = "No venue assigned" });

    var booking = await _context.Bookings
        .Include(b => b.ZoneUnit)
        .ThenInclude(zu => zu.VenueZone)
        .FirstOrDefaultAsync(b => b.BookingCode == bookingCode 
                               && b.VenueId == collectorVenueId.Value
                               && !b.IsDeleted);

    if (booking == null)
        return NotFound(new { error = "Booking not found" });

    return Ok(new CollectorBookingDetailsDto
    {
        Id = booking.Id,
        BookingCode = booking.BookingCode,
        Status = booking.Status,
        GuestName = booking.GuestName,
        GuestPhone = booking.GuestPhone,
        GuestCount = booking.GuestCount,
        UnitsNeeded = booking.UnitsNeeded,  // NEW: For multi-unit bookings
        ZoneId = booking.ZoneId,
        ZoneName = booking.VenueZone?.Name ?? "Unknown",
        RequestedTime = booking.StartTime,
        CreatedAt = booking.CreatedAt
    });
}
```

#### GET /api/collector/bookings/{bookingCode}/available-units
```csharp
[HttpGet("bookings/{bookingCode}/available-units")]
[Authorize(Policy = "Collector")]
public async Task<ActionResult<List<CollectorAvailableUnitDto>>> GetAvailableUnits(string bookingCode)
{
    var collectorVenueId = await GetCollectorVenueIdAsync();
    if (collectorVenueId == null)
        return StatusCode(403, new { error = "No venue assigned" });

    var booking = await _context.Bookings
        .FirstOrDefaultAsync(b => b.BookingCode == bookingCode 
                               && b.VenueId == collectorVenueId.Value);

    if (booking == null)
        return NotFound();

    var zoneId = booking.ZoneId;
    if (zoneId == null)
        return BadRequest(new { error = "Booking has no zone assigned" });

    // Get available units in the requested zone
    var availableUnits = await _context.ZoneUnits
        .Where(zu => zu.VenueZoneId == zoneId.Value 
                  && zu.Status == "Available"
                  && zu.VenueId == collectorVenueId.Value)
        .OrderBy(zu => zu.UnitCode)
        .Select(zu => new CollectorAvailableUnitDto
        {
            Id = zu.Id,
            UnitCode = zu.UnitCode,
            UnitType = zu.UnitType,
            PositionX = zu.PositionX,
            PositionY = zu.PositionY
        })
        .ToListAsync();

    return Ok(availableUnits);
}
```

#### PUT /api/collector/bookings/{bookingCode}/approve
```csharp
[HttpPut("bookings/{bookingCode}/approve")]
[Authorize(Policy = "Collector")]
public async Task<ActionResult> ApproveBooking(
    string bookingCode, 
    [FromBody] ApproveBookingRequest request)
{
    var collectorVenueId = await GetCollectorVenueIdAsync();
    if (collectorVenueId == null)
        return StatusCode(403, new { error = "No venue assigned" });

    var booking = await _context.Bookings
        .FirstOrDefaultAsync(b => b.BookingCode == bookingCode 
                               && b.VenueId == collectorVenueId.Value);

    if (booking == null)
        return NotFound(new { error = "Booking not found" });

    // 🚨 TWEAK 2: Return structured error for frontend translation
    if (booking.Status != "Pending")
    {
        return BadRequest(new { 
            error = "BOOKING_NOT_PENDING",
            message = $"Booking is {booking.Status}",
            currentStatus = booking.Status,
            bookingCode = booking.BookingCode
        });
    }

    // ✅ Validate correct number of units selected
    if (request.UnitIds.Count != booking.UnitsNeeded)
    {
        return BadRequest(new { 
            error = "INCORRECT_UNIT_COUNT",
            message = $"Need {booking.UnitsNeeded} units, got {request.UnitIds.Count}"
        });
    }

    // ✅ Validate all units are available
    var units = await _context.ZoneUnits
        .Where(zu => request.UnitIds.Contains(zu.Id)
                  && zu.VenueId == booking.VenueId
                  && zu.VenueZoneId == booking.ZoneId)
        .ToListAsync();

    if (units.Count != request.UnitIds.Count)
        return BadRequest("Some units not found");

    if (units.Any(u => u.Status != "Available"))
        return BadRequest("Some units not available");

    // ✅ Update booking status
    booking.Status = "Reserved";

    // ✅ Assign all units to this booking
    foreach (var unit in units)
    {
        unit.Status = "Reserved";
        unit.CurrentBookingId = booking.Id;  // NEW: Link unit to booking
    }

    await _context.SaveChangesAsync();

    // ✅ Get unit codes for response
    var unitCodes = units.Select(u => u.UnitCode).OrderBy(c => c).ToList();

    // 🔔 Trigger SignalR event
    await _hubContext.Clients.Group($"booking_{bookingCode}")
        .SendAsync("BookingStatusChanged", bookingCode, "Reserved", string.Join(", ", unitCodes));

    return Ok(new { 
        message = "Booking approved", 
        unitCodes = unitCodes,
        status = "Reserved"
    });
}
```

#### PUT /api/collector/bookings/{bookingCode}/reject
```csharp
[HttpPut("bookings/{bookingCode}/reject")]
[Authorize(Policy = "Collector")]
public async Task<ActionResult> RejectBooking(string bookingCode)
{
    var collectorVenueId = await GetCollectorVenueIdAsync();
    if (collectorVenueId == null)
        return StatusCode(403, new { error = "No venue assigned" });

    var booking = await _context.Bookings
        .FirstOrDefaultAsync(b => b.BookingCode == bookingCode 
                               && b.VenueId == collectorVenueId.Value);

    if (booking == null)
        return NotFound();

    if (booking.Status != "Pending")
        return BadRequest(new { error = $"Booking is {booking.Status}, cannot reject" });

    booking.Status = "Cancelled";
    await _context.SaveChangesAsync();

    // 🔔 Trigger SignalR event
    await _hubContext.Clients.Group($"booking_{bookingCode}")
        .SendAsync("BookingStatusChanged", bookingCode, "Cancelled", null);

    return Ok(new { message = "Booking rejected" });
}
```

**DTOs to Create:**

```csharp
public class CollectorBookingDetailsDto
{
    public int Id { get; set; }
    public string BookingCode { get; set; }
    public string Status { get; set; }
    public string GuestName { get; set; }
    public string? GuestPhone { get; set; }
    public int GuestCount { get; set; }
    public int UnitsNeeded { get; set; }  // NEW
    public int ZoneId { get; set; }
    public string ZoneName { get; set; }
    public DateTime RequestedTime { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CollectorAvailableUnitDto
{
    public int Id { get; set; }
    public string UnitCode { get; set; }
    public string? UnitType { get; set; }
    public int? PositionX { get; set; }
    public int? PositionY { get; set; }
}

public class ApproveBookingRequest
{
    public List<int> UnitIds { get; set; }  // Changed from single unitId
}
```

---

## 🎯 TASK 2: Capacity-Based Booking System

### What It Does
Allows tourists to book by zone (not specific units), backend checks capacity and creates pending booking.

### Database Changes Required

**1. Add Columns to Bookings Table**
```sql
ALTER TABLE Bookings
ADD ZoneId INT NULL,
    UnitsNeeded INT NOT NULL DEFAULT 1;

-- Add foreign key
ALTER TABLE Bookings
ADD CONSTRAINT FK_Bookings_VenueZones
FOREIGN KEY (ZoneId) REFERENCES VenueZones(Id);

-- Add index
CREATE INDEX IX_Bookings_ZoneId ON Bookings(ZoneId);
```

**2. Add Column to ZoneUnits Table**
```sql
ALTER TABLE ZoneUnits
ADD CurrentBookingId INT NULL;

-- Add foreign key
ALTER TABLE ZoneUnits
ADD CONSTRAINT FK_ZoneUnits_Bookings
FOREIGN KEY (CurrentBookingId) REFERENCES Bookings(Id);

-- Add index
CREATE INDEX IX_ZoneUnits_CurrentBookingId ON ZoneUnits(CurrentBookingId);
```

### Files to Modify

**1. Update PublicReservationsController.cs**

**Update Request Schema:**
```csharp
public class PublicReservationRequest
{
    // NEW: Accept zoneId instead of zoneUnitId
    public int? ZoneId { get; set; }  // For zone-level booking
    
    [Required]
    public int VenueId { get; set; }
    
    [MaxLength(100)]
    public string? GuestName { get; set; }
    
    [MaxLength(50)]
    public string? GuestPhone { get; set; }
    
    [Range(1, 20)]
    public int? GuestCount { get; set; }
    
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
}
```

**Update CreateReservation Endpoint:**
```csharp
[HttpPost]
public async Task<ActionResult<PublicReservationConfirmationDto>> CreateReservation(
    [FromBody] PublicReservationRequest request)
{
    // Validate venue and zone
    var zone = await _context.VenueZones
        .Include(z => z.Venue)
        .FirstOrDefaultAsync(z => z.Id == request.ZoneId && z.VenueId == request.VenueId);
    
    if (zone == null) return NotFound("Zone not found");
    
    // 🧮 MATH CHECK: Calculate units needed
    int unitsNeeded = (int)Math.Ceiling((double)(request.GuestCount ?? 1) / 2);
    
    // 🧮 CAPACITY CHECK: Are there enough available units?
    int availableCount = await _context.ZoneUnits
        .CountAsync(zu => zu.VenueZoneId == request.ZoneId
                       && zu.Status == "Available"
                       && zu.VenueId == request.VenueId);
    
    if (availableCount < unitsNeeded)
    {
        return BadRequest(new { 
            error = "INSUFFICIENT_CAPACITY",
            message = $"Need {unitsNeeded} units, only {availableCount} available",
            unitsNeeded = unitsNeeded,
            unitsAvailable = availableCount
        });
    }
    
    // ✅ CAPACITY OK: Create pending booking (NO unit assignment yet)
    var booking = new Booking
    {
        VenueId = request.VenueId,
        ZoneId = request.ZoneId,  // Store zone, not specific units
        GuestName = request.GuestName,
        GuestPhone = request.GuestPhone,
        GuestCount = request.GuestCount ?? 1,
        UnitsNeeded = unitsNeeded,  // NEW: Store calculated units needed
        StartTime = request.StartTime ?? DateTime.UtcNow,
        Status = "Pending",  // Awaiting collector approval
        BookingCode = GenerateBookingCode(),
        CreatedAt = DateTime.UtcNow,
        Notes = request.Notes
    };
    
    _context.Bookings.Add(booking);
    await _context.SaveChangesAsync();
    
    return Ok(new PublicReservationConfirmationDto
    {
        BookingCode = booking.BookingCode,
        Status = "Pending",
        VenueId = booking.VenueId,
        VenueName = zone.Venue.Name,
        ZoneName = zone.Name,
        GuestName = booking.GuestName,
        GuestCount = booking.GuestCount,
        UnitsNeeded = unitsNeeded,  // Tell tourist how many units
        ReservationDate = booking.StartTime,
        Message = "Booking pending approval. Please confirm via WhatsApp."
    });
}

private string GenerateBookingCode()
{
    var random = new Random();
    var letter = (char)('A' + random.Next(26));
    var number = random.Next(100, 999);
    return $"RIV-{letter}-{number}";
}
```

**Update Response DTO:**
```csharp
public class PublicReservationConfirmationDto
{
    public string BookingCode { get; set; }
    public string Status { get; set; }
    public int VenueId { get; set; }
    public string VenueName { get; set; }
    public string ZoneName { get; set; }
    public string GuestName { get; set; }
    public int GuestCount { get; set; }
    public int UnitsNeeded { get; set; }  // NEW
    public DateTime ReservationDate { get; set; }
    public string Message { get; set; }
}
```

**2. Update Booking Entity**
```csharp
public class Booking
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public int? ZoneId { get; set; }  // NEW: Zone-level booking
    public int? ZoneUnitId { get; set; }  // Legacy: Direct unit (deprecated)
    public int UnitsNeeded { get; set; }  // NEW: Calculated units needed
    public string BookingCode { get; set; }
    public string Status { get; set; }
    public string? GuestName { get; set; }
    public string? GuestPhone { get; set; }
    public int GuestCount { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; }
    
    // Navigation properties
    public Venue Venue { get; set; }
    public VenueZone? VenueZone { get; set; }  // NEW
    public ZoneUnit? ZoneUnit { get; set; }
    public ICollection<ZoneUnit> AssignedUnits { get; set; }  // NEW: Multi-unit support
}
```

**3. Update ZoneUnit Entity**
```csharp
public class ZoneUnit
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public int VenueZoneId { get; set; }
    public string UnitCode { get; set; }
    public string Status { get; set; }
    public string? UnitType { get; set; }
    public int? PositionX { get; set; }
    public int? PositionY { get; set; }
    public int? CurrentBookingId { get; set; }  // NEW: Link to booking
    
    // Navigation properties
    public Venue Venue { get; set; }
    public VenueZone VenueZone { get; set; }
    public Booking? CurrentBooking { get; set; }  // NEW
}
```

---

## 🎯 TASK 3: Booking Cleanup Job

### What It Does
Auto-cancels pending bookings older than 15 minutes (tourist didn't send WhatsApp).

### Files to Create

**1. Create BookingCleanupJob.cs**
```
File: backend-temp/BlackBear.Services/BlackBear.Services.Core/Jobs/BookingCleanupJob.cs
```

```csharp
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BlackBear.Services.Core.Jobs
{
    public class BookingCleanupJob : IHostedService, IDisposable
    {
        private readonly IServiceProvider _serviceProvider;
        private Timer _timer;

        public BookingCleanupJob(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("🗑️ Booking Cleanup Job started");
            
            // Run every 5 minutes
            _timer = new Timer(
                CleanupExpiredBookings, 
                null, 
                TimeSpan.Zero,  // Start immediately
                TimeSpan.FromMinutes(5)  // Run every 5 minutes
            );
            
            return Task.CompletedTask;
        }

        private async void CleanupExpiredBookings(object state)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<BlackBearDbContext>();
            
            var fifteenMinutesAgo = DateTime.UtcNow.AddMinutes(-15);
            
            // Find pending bookings older than 15 minutes
            var expiredBookings = await context.Bookings
                .Where(b => b.Status == "Pending" 
                         && b.CreatedAt < fifteenMinutesAgo
                         && !b.IsDeleted)
                .ToListAsync();
            
            if (expiredBookings.Any())
            {
                foreach (var booking in expiredBookings)
                {
                    booking.Status = "Cancelled";
                    booking.Notes = (booking.Notes ?? "") + 
                        " [Auto-cancelled: WhatsApp confirmation not sent within 15 minutes]";
                }
                
                await context.SaveChangesAsync();
                
                Console.WriteLine($"🗑️ Cleaned up {expiredBookings.Count} expired bookings");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            Console.WriteLine("🗑️ Booking Cleanup Job stopped");
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
```

**2. Register in Program.cs**
```csharp
// Add this line in Program.cs
builder.Services.AddHostedService<BookingCleanupJob>();
```

---

## 📊 TESTING CHECKLIST

### Task 1: XIXA Approval Flow
- [ ] Create test booking with Postman
- [ ] GET /api/collector/bookings/{code} returns details
- [ ] GET /api/collector/bookings/{code}/available-units returns units
- [ ] PUT /api/collector/bookings/{code}/approve with valid units works
- [ ] PUT /api/collector/bookings/{code}/reject works
- [ ] SignalR events fire correctly
- [ ] Error messages are structured (BOOKING_NOT_PENDING)

### Task 2: Capacity-Based Booking
- [ ] Database migration runs successfully
- [ ] POST /api/public/Reservations with zoneId works
- [ ] Capacity check works (6 guests = 3 units)
- [ ] INSUFFICIENT_CAPACITY error when not enough units
- [ ] Booking created with Status = "Pending"
- [ ] UnitsNeeded calculated correctly
- [ ] No units assigned yet (ZoneUnitId = null)

### Task 3: Booking Cleanup Job
- [ ] Job starts on application startup
- [ ] Job runs every 5 minutes
- [ ] Bookings older than 15 minutes are cancelled
- [ ] Notes field updated with reason
- [ ] Console logs show cleanup count
- [ ] Job stops gracefully on shutdown

---

## 🚀 DEPLOYMENT ORDER

### Step 1: Database Migration (15 minutes)
```sql
-- Run these in order
ALTER TABLE Bookings ADD ZoneId INT NULL;
ALTER TABLE Bookings ADD UnitsNeeded INT NOT NULL DEFAULT 1;
ALTER TABLE ZoneUnits ADD CurrentBookingId INT NULL;

-- Add foreign keys
ALTER TABLE Bookings ADD CONSTRAINT FK_Bookings_VenueZones FOREIGN KEY (ZoneId) REFERENCES VenueZones(Id);
ALTER TABLE ZoneUnits ADD CONSTRAINT FK_ZoneUnits_Bookings FOREIGN KEY (CurrentBookingId) REFERENCES Bookings(Id);

-- Add indexes
CREATE INDEX IX_Bookings_ZoneId ON Bookings(ZoneId);
CREATE INDEX IX_ZoneUnits_CurrentBookingId ON ZoneUnits(CurrentBookingId);
```

### Step 2: Deploy Backend Code (30 minutes)
1. Create CollectorBookingsController.cs
2. Update PublicReservationsController.cs
3. Create BookingCleanupJob.cs
4. Update entity models
5. Register cleanup job in Program.cs
6. Build and test locally
7. Deploy to staging
8. Run tests
9. Deploy to production

### Step 3: Verify (15 minutes)
1. Check Swagger for new endpoints
2. Test with Postman
3. Monitor logs for cleanup job
4. Verify SignalR events
5. Check database for correct data

---

## 📝 QUICK REFERENCE

### New Endpoints
```
GET    /api/collector/bookings/{bookingCode}
GET    /api/collector/bookings/{bookingCode}/available-units
PUT    /api/collector/bookings/{bookingCode}/approve
PUT    /api/collector/bookings/{bookingCode}/reject
POST   /api/public/Reservations (updated)
```

### New Database Columns
```
Bookings.ZoneId (INT NULL)
Bookings.UnitsNeeded (INT NOT NULL DEFAULT 1)
ZoneUnits.CurrentBookingId (INT NULL)
```

### New Files
```
Controllers/Collector/CollectorBookingsController.cs
Jobs/BookingCleanupJob.cs
```

### Modified Files
```
Controllers/Public/PublicReservationsController.cs
Models/Booking.cs
Models/ZoneUnit.cs
Program.cs
```

---

## 🆘 SUPPORT DOCUMENTS

**Detailed Implementation:**
- `XIXA_BALKAN_REALITY_IMPLEMENTATION.md` - Complete XIXA flow
- `HUMAN_TETRIS_CAPACITY_BOOKING.md` - Capacity booking logic
- `PSYCHOLOGICAL_TRAPS_FIXED.md` - Cleanup job details

**API Reference:**
- `frontend/swagger.json` - Current API structure

**Testing:**
- `XIXA_FINAL_3_TWEAKS_IMPLEMENTED.md` - Testing scenarios

---

**Total Estimated Time:** 4-5 hours  
**Priority:** HIGH - Blocking Discovery Mode  
**Status:** ⏳ Ready to implement  
**Contact:** Aldi (CTO) for questions

