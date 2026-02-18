# Backend Task: Collector Dashboard SignalR Real-Time Updates

**Priority:** MEDIUM (Optional for MVP)  
**Estimated Time:** 1 hour  
**Status:** PENDING  
**Owner:** Prof Kristi

---

## 📋 OVERVIEW

**Good News:** The Collector Dashboard backend is 99% complete and fully functional!

After comprehensive analysis of:
- ✅ UnitBookingsController.cs - All endpoints working perfectly
- ✅ BizBookingListItemDto - All required fields present
- ✅ Authorization policies - Collector policy configured correctly
- ✅ Status updates - Booking and unit statuses update correctly

**What's Working:**
- All CRUD operations for bookings
- Check-in, check-out, cancel functionality
- Unit status updates (Available → Reserved → Occupied)
- Booking status tracking (Reserved → Active → Completed)

**What's Missing (Optional):**
- SignalR real-time broadcasts for live updates across multiple collectors

---

## 🎯 TASK: Add SignalR Broadcasts

### Why This Matters

When multiple collectors are working simultaneously:
- Collector A checks in a guest on Unit 5
- Collector B's screen should update immediately to show Unit 5 as Occupied
- Without SignalR: Collector B must manually refresh
- With SignalR: Collector B sees the update in real-time

**Frontend is already listening for these events!** We just need to broadcast them from the backend.

---

## 📁 FILE TO MODIFY

**File:** `BlackBear.Services.Core/Controllers/Business/UnitBookingsController.cs`

---

## 🔧 IMPLEMENTATION

### Step 1: Inject SignalR Hub Context

**Add to the top of the file:**

```csharp
using Microsoft.AspNetCore.SignalR;
using BlackBear.Services.Core.Hubs;
```

**Update the constructor:**

**BEFORE:**
```csharp
public class UnitBookingsController : ControllerBase
{
    private readonly BlackBearDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public UnitBookingsController(BlackBearDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }
```

**AFTER:**
```csharp
public class UnitBookingsController : ControllerBase
{
    private readonly BlackBearDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHubContext<BeachHub> _hubContext;  // NEW

    public UnitBookingsController(
        BlackBearDbContext context, 
        ICurrentUserService currentUserService,
        IHubContext<BeachHub> hubContext)  // NEW
    {
        _context = context;
        _currentUserService = currentUserService;
        _hubContext = hubContext;  // NEW
    }
```

---

### Step 2: Broadcast "BookingCreated" Event

**Location:** After creating a booking (line ~240)

**Find this code:**
```csharp
_context.ZoneUnitBookings.Add(booking);
await _context.SaveChangesAsync();

return CreatedAtAction(nameof(GetBooking), new { venueId, id = booking.Id }, new BizBookingDetailDto
{
    // ... DTO mapping ...
});
```

**Add SignalR broadcast BEFORE the return statement:**

```csharp
_context.ZoneUnitBookings.Add(booking);
await _context.SaveChangesAsync();

// NEW: Broadcast booking created event
await _hubContext.Clients.All.SendAsync("BookingCreated", new
{
    bookingId = booking.Id,
    venueId = booking.VenueId,
    zoneUnitId = booking.ZoneUnitId,
    status = booking.Status,
    guestName = booking.GuestName,
    guestCount = booking.GuestCount,
    unitCode = unit.UnitCode
});

return CreatedAtAction(nameof(GetBooking), new { venueId, id = booking.Id }, new BizBookingDetailDto
{
    // ... DTO mapping ...
});
```

---

### Step 3: Broadcast "BookingStatusChanged" on Check-In

**Location:** After checking in (line ~290)

**Find this code:**
```csharp
booking.Status = "Active";
booking.CheckedInAt = DateTime.UtcNow;
if (int.TryParse(_currentUserService.UserId, out var userId))
{
    booking.HandledByUserId = userId;
}

if (request?.Notes != null)
{
    booking.Notes = string.IsNullOrEmpty(booking.Notes)
        ? request.Notes
        : $"{booking.Notes}\n{request.Notes}";
}

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Occupied";
}

await _context.SaveChangesAsync();

return NoContent();
```

**Add SignalR broadcast BEFORE SaveChangesAsync:**

```csharp
booking.Status = "Active";
booking.CheckedInAt = DateTime.UtcNow;
if (int.TryParse(_currentUserService.UserId, out var userId))
{
    booking.HandledByUserId = userId;
}

if (request?.Notes != null)
{
    booking.Notes = string.IsNullOrEmpty(booking.Notes)
        ? request.Notes
        : $"{booking.Notes}\n{request.Notes}";
}

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Occupied";
}

await _context.SaveChangesAsync();

// NEW: Broadcast status change
await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
{
    bookingId = booking.Id,
    zoneUnitId = booking.ZoneUnitId,
    status = booking.Status,
    venueId = booking.VenueId,
    unitStatus = "Occupied"
});

return NoContent();
```

---

### Step 4: Broadcast "BookingStatusChanged" on Check-Out

**Location:** After checking out (line ~340)

**Find this code:**
```csharp
booking.Status = "Completed";
booking.CheckedOutAt = DateTime.UtcNow;
if (int.TryParse(_currentUserService.UserId, out var userId))
{
    booking.HandledByUserId = userId;
}

if (request?.Notes != null)
{
    booking.Notes = string.IsNullOrEmpty(booking.Notes)
        ? request.Notes
        : $"{booking.Notes}\n{request.Notes}";
}

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Available";
}

await _context.SaveChangesAsync();

return NoContent();
```

**Add SignalR broadcast BEFORE SaveChangesAsync:**

```csharp
booking.Status = "Completed";
booking.CheckedOutAt = DateTime.UtcNow;
if (int.TryParse(_currentUserService.UserId, out var userId))
{
    booking.HandledByUserId = userId;
}

if (request?.Notes != null)
{
    booking.Notes = string.IsNullOrEmpty(booking.Notes)
        ? request.Notes
        : $"{booking.Notes}\n{request.Notes}";
}

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Available";
}

await _context.SaveChangesAsync();

// NEW: Broadcast status change
await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
{
    bookingId = booking.Id,
    zoneUnitId = booking.ZoneUnitId,
    status = booking.Status,
    venueId = booking.VenueId,
    unitStatus = "Available"
});

return NoContent();
```

---

### Step 5: Broadcast "BookingStatusChanged" on Cancel

**Location:** After cancelling (line ~380)

**Find this code:**
```csharp
booking.Status = "Cancelled";

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Available";
}

await _context.SaveChangesAsync();

return NoContent();
```

**Add SignalR broadcast BEFORE SaveChangesAsync:**

```csharp
booking.Status = "Cancelled";

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Available";
}

await _context.SaveChangesAsync();

// NEW: Broadcast status change
await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
{
    bookingId = booking.Id,
    zoneUnitId = booking.ZoneUnitId,
    status = booking.Status,
    venueId = booking.VenueId,
    unitStatus = "Available"
});

return NoContent();
```

---

### Step 6: Broadcast "BookingStatusChanged" on No-Show (Optional)

**Location:** After marking no-show (line ~420)

**Find this code:**
```csharp
booking.Status = "NoShow";
if (int.TryParse(_currentUserService.UserId, out var userId))
{
    booking.HandledByUserId = userId;
}

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Available";
}

await _context.SaveChangesAsync();

return NoContent();
```

**Add SignalR broadcast BEFORE SaveChangesAsync:**

```csharp
booking.Status = "NoShow";
if (int.TryParse(_currentUserService.UserId, out var userId))
{
    booking.HandledByUserId = userId;
}

// Update unit status
if (booking.ZoneUnit != null)
{
    booking.ZoneUnit.Status = "Available";
}

await _context.SaveChangesAsync();

// NEW: Broadcast status change
await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
{
    bookingId = booking.Id,
    zoneUnitId = booking.ZoneUnitId,
    status = booking.Status,
    venueId = booking.VenueId,
    unitStatus = "Available"
});

return NoContent();
```

---

## 🧪 TESTING

### Test 1: Real-Time Booking Creation

**Setup:**
1. Open CollectorDashboard in Browser A
2. Open CollectorDashboard in Browser B (same venue/zone)
3. Both should show "LIVE" indicator (green wifi icon)

**Test:**
1. In Browser A: Click an Available unit
2. In Browser A: Create a quick booking
3. In Browser B: Unit should change color immediately (no refresh needed)

**Expected Console Output (Browser B):**
```
📅 New booking: {bookingId: 123, venueId: 1, zoneUnitId: 5, ...}
```

---

### Test 2: Real-Time Check-In

**Setup:**
1. Create a Reserved booking (blue unit)
2. Open CollectorDashboard in two browsers

**Test:**
1. In Browser A: Click the Reserved unit
2. In Browser A: Click "Check In"
3. In Browser B: Unit should change from blue to red immediately

**Expected Console Output (Browser B):**
```
🔄 Booking status changed: {bookingId: 123, status: "Active", unitStatus: "Occupied"}
```

---

### Test 3: Real-Time Check-Out

**Setup:**
1. Have an Occupied unit (red)
2. Open CollectorDashboard in two browsers

**Test:**
1. In Browser A: Click the Occupied unit
2. In Browser A: Click "Check Out"
3. In Browser B: Unit should change from red to green immediately

**Expected Console Output (Browser B):**
```
🔄 Booking status changed: {bookingId: 123, status: "Completed", unitStatus: "Available"}
```

---

### Test 4: Real-Time Cancel

**Setup:**
1. Have a Reserved or Occupied unit
2. Open CollectorDashboard in two browsers

**Test:**
1. In Browser A: Click the unit
2. In Browser A: Click "Cancel"
3. In Browser B: Unit should change to green immediately

**Expected Console Output (Browser B):**
```
🔄 Booking status changed: {bookingId: 123, status: "Cancelled", unitStatus: "Available"}
```

---

## 📋 IMPLEMENTATION CHECKLIST

- [ ] Add `using Microsoft.AspNetCore.SignalR;`
- [ ] Add `using BlackBear.Services.Core.Hubs;`
- [ ] Inject `IHubContext<BeachHub>` in constructor
- [ ] Add broadcast in CreateBooking (after SaveChangesAsync)
- [ ] Add broadcast in CheckIn (after SaveChangesAsync)
- [ ] Add broadcast in CheckOut (after SaveChangesAsync)
- [ ] Add broadcast in CancelBooking (after SaveChangesAsync)
- [ ] Add broadcast in MarkNoShow (after SaveChangesAsync, optional)
- [ ] Test with two browsers
- [ ] Verify "LIVE" indicator shows in frontend
- [ ] Verify console logs show events
- [ ] Verify units update in real-time

---

## 🚀 DEPLOYMENT

### No Database Changes Required

This is purely code changes - no migrations needed.

### Deployment Steps

1. Make the code changes
2. Commit: "Add SignalR broadcasts for Collector Dashboard real-time updates"
3. Push to repository
4. Deploy to Azure Container Apps
5. Test with multiple collectors

---

## 💡 FRONTEND ALREADY LISTENING

The frontend is already set up to receive these events!

**CollectorDashboard.jsx line 100-117:**
```javascript
connection.on('BookingCreated', (booking) => {
  console.log('🆕 New booking received:', booking);
  if (booking.venueId === selectedVenue.id) {
    fetchUnits();
    fetchBookings();
  }
});

connection.on('BookingStatusChanged', (data) => {
  console.log('📝 Booking status changed:', data);
  fetchUnits();
  fetchBookings();
});
```

So once you add the backend broadcasts, it will work immediately!

---

## 🎯 BENEFITS

**Without SignalR:**
- Collectors must manually refresh to see updates
- Risk of double-booking if two collectors work on same unit
- Slower workflow

**With SignalR:**
- Instant updates across all connected collectors
- No manual refresh needed
- Prevents conflicts
- Better user experience
- More professional

---

## 📊 PERFORMANCE IMPACT

**Minimal:**
- SignalR broadcasts are very lightweight (< 1KB per event)
- Only broadcasts to connected clients
- No database queries involved
- Async/non-blocking

**Scalability:**
- Works well with 10-50 concurrent collectors
- For 100+ collectors, consider filtering by venue/business
- Current implementation broadcasts to all clients (simple, works for MVP)

---

## 🔄 FUTURE ENHANCEMENTS (Not Needed Now)

### Venue-Specific Broadcasting

Instead of broadcasting to all clients, broadcast only to collectors in the same venue:

```csharp
// Instead of:
await _hubContext.Clients.All.SendAsync("BookingCreated", data);

// Use:
await _hubContext.Clients.Group($"venue-{venueId}").SendAsync("BookingCreated", data);
```

This requires updating BeachHub to manage groups, which is not needed for MVP.

---

## ✅ VERIFICATION

After deployment, verify:

1. **SignalR Connection:**
   - Open CollectorDashboard
   - Check for "LIVE" indicator (green wifi icon)
   - Console should show: "🔴 Collector Dashboard - SignalR Connected"

2. **Real-Time Updates:**
   - Open two browsers
   - Create booking in Browser A
   - Browser B should update immediately

3. **No Errors:**
   - Check Azure logs for SignalR errors
   - Check browser console for connection errors

---

## 🎓 UNDERSTANDING THE CODE

### Why After SaveChangesAsync?

```csharp
await _context.SaveChangesAsync();  // Commit to database first

// THEN broadcast
await _hubContext.Clients.All.SendAsync("BookingStatusChanged", data);
```

**Reason:** We want to ensure the database is updated before notifying other clients. If SaveChangesAsync fails, the broadcast won't happen (correct behavior).

---

### Why Include Both Booking Status and Unit Status?

```csharp
await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
{
    bookingId = booking.Id,
    status = booking.Status,        // Booking status: "Active", "Completed"
    unitStatus = "Occupied"          // Unit status: "Available", "Occupied"
});
```

**Reason:** Frontend needs both:
- Booking status: To update booking details modal
- Unit status: To update unit color in the grid

---

## 📝 SUMMARY

**What You're Adding:**
- 5 SignalR broadcast calls (one per action)
- 1 constructor parameter injection
- 2 using statements

**Total Lines of Code:** ~50 lines

**Estimated Time:** 1 hour (including testing)

**Impact:** Real-time updates for all collectors

**Priority:** Medium (nice to have, not critical for MVP)

---

## 🎯 DECISION

**Should you do this now?**

**YES if:**
- You have 1 hour available
- You want to impress with real-time features
- Multiple collectors will use the system simultaneously

**NO if:**
- You're rushing to launch MVP
- Only one collector per venue
- You want to minimize changes before launch

**Recommendation:** Add it now - it's low risk, high impact, and the frontend is already ready for it!

---

**Created:** February 18, 2026  
**For:** Prof Kristi (Backend Developer)  
**Estimated Time:** 1 hour  
**Status:** OPTIONAL FOR MVP, RECOMMENDED FOR PRODUCTION
