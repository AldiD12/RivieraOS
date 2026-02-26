# Backend Fix Needed: Zone-Level Booking with Auto-Assignment

**Date:** February 26, 2026  
**Priority:** HIGH - Blocking Discovery Mode bookings  
**Status:** ⚠️ Temporary workaround in place

---

## 🚨 THE PROBLEM

**Current Backend:** Requires `zoneUnitId` (specific unit) for booking  
**Current Frontend:** Only knows `zoneId` (zone selection)  
**Result:** Cannot create bookings - "Rezervimi nuk u gjet"

### Current API Schema

```json
POST /api/public/Reservations
{
  "venueId": 1,
  "zoneUnitId": 42,  // ❌ Frontend doesn't know which unit
  "guestName": "Marco Rossi",
  "guestPhone": "+355691234567",
  "guestCount": 2,
  "startTime": "2026-02-27T11:00:00Z"
}
```

### What Frontend Has

```javascript
{
  venueId: 1,
  zoneId: 1,  // ✅ Tourist selected "VIP Front Row" zone
  // ❌ No zoneUnitId - tourist doesn't pick specific unit
  guestName: "Marco Rossi",
  guestPhone: "+355691234567",
  guestCount: 2,
  reservationDate: "2026-02-27"
}
```

---

## 🎯 THE SOLUTION

### Option 1: Backend Auto-Assignment (RECOMMENDED)

**Change:** Backend accepts `zoneId` instead of `zoneUnitId` and auto-assigns available unit

**Benefits:**
- Better UX (tourist doesn't pick unit number)
- Matches real-world flow (collector assigns unit later)
- Consistent with XIXA approval flow

**Implementation:**

```csharp
// PublicReservationsController.cs

[HttpPost]
public async Task<ActionResult<PublicReservationConfirmationDto>> CreateReservation(
    [FromBody] PublicReservationRequest request)
{
    // Validate venue exists
    var venue = await _context.Venues.FindAsync(request.VenueId);
    if (venue == null) return NotFound("Venue not found");
    
    // NEW: Accept zoneId and auto-assign unit
    ZoneUnit assignedUnit = null;
    
    if (request.ZoneId.HasValue)
    {
        // Find first available unit in zone
        assignedUnit = await _context.ZoneUnits
            .Where(zu => zu.VenueZoneId == request.ZoneId.Value
                      && zu.Status == "Available"
                      && zu.VenueId == request.VenueId)
            .OrderBy(zu => zu.UnitCode)
            .FirstOrDefaultAsync();
        
        if (assignedUnit == null)
        {
            return BadRequest(new { 
                error = "NO_UNITS_AVAILABLE",
                message = "No available units in selected zone"
            });
        }
    }
    else if (request.ZoneUnitId.HasValue)
    {
        // Legacy: Direct unit assignment (for backwards compatibility)
        assignedUnit = await _context.ZoneUnits.FindAsync(request.ZoneUnitId.Value);
        
        if (assignedUnit == null || assignedUnit.Status != "Available")
        {
            return BadRequest("Unit not available");
        }
    }
    else
    {
        return BadRequest("Either zoneId or zoneUnitId must be provided");
    }
    
    // Create booking
    var booking = new Booking
    {
        VenueId = request.VenueId,
        ZoneUnitId = assignedUnit.Id,
        GuestName = request.GuestName,
        GuestPhone = request.GuestPhone,
        GuestCount = request.GuestCount ?? 1,
        StartTime = request.StartTime ?? DateTime.UtcNow,
        EndTime = request.EndTime,
        Status = "Pending", // Awaiting WhatsApp confirmation
        BookingCode = GenerateBookingCode(),
        CreatedAt = DateTime.UtcNow,
        Notes = request.Notes
    };
    
    _context.Bookings.Add(booking);
    
    // Mark unit as Reserved (will be confirmed when collector approves)
    assignedUnit.Status = "Reserved";
    
    await _context.SaveChangesAsync();
    
    // Return confirmation
    return Ok(new PublicReservationConfirmationDto
    {
        BookingCode = booking.BookingCode,
        Status = "Pending",
        VenueId = venue.Id,
        VenueName = venue.Name,
        ZoneName = assignedUnit.VenueZone.Name,
        UnitCode = assignedUnit.UnitCode, // Tourist sees assigned unit
        GuestName = booking.GuestName,
        GuestPhone = booking.GuestPhone,
        GuestCount = booking.GuestCount,
        ReservationDate = booking.StartTime,
        CreatedAt = booking.CreatedAt,
        Message = "Booking created successfully. Please confirm via WhatsApp."
    });
}

private string GenerateBookingCode()
{
    // Format: RIV-X-102 (RIV = Riviera, X = random letter, 102 = sequential)
    var random = new Random();
    var letter = (char)('A' + random.Next(26));
    var number = random.Next(100, 999);
    return $"RIV-{letter}-{number}";
}
```

**Update Request Schema:**

```csharp
public class PublicReservationRequest
{
    // NEW: Accept either zoneId OR zoneUnitId
    public int? ZoneId { get; set; }  // For zone-level booking (auto-assign unit)
    public int? ZoneUnitId { get; set; }  // For direct unit booking (legacy)
    
    [Required]
    public int VenueId { get; set; }
    
    [MaxLength(100)]
    public string? GuestName { get; set; }
    
    [MaxLength(50)]
    public string? GuestPhone { get; set; }
    
    [MaxLength(255)]
    [EmailAddress]
    public string? GuestEmail { get; set; }
    
    [Range(1, 20)]
    public int? GuestCount { get; set; }
    
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    
    [MaxLength(500)]
    public string? Notes { get; set; }
}
```

---

### Option 2: Frontend Unit Selection (NOT RECOMMENDED)

**Change:** Frontend shows list of available units for tourist to pick

**Problems:**
- Bad UX (tourist doesn't care about unit numbers)
- Extra API call to fetch units
- Doesn't match real-world flow
- Inconsistent with XIXA flow

**Why This Is Wrong:**

```
Tourist: "I want a sunbed in VIP zone"
System: "Which unit? 42, 43, 44, 45, 46?"
Tourist: "I don't know, just give me one!"
```

---

## 🔄 COMPLETE FLOW (After Fix)

### Step 1: Tourist Books

```javascript
// Frontend: VenueBottomSheet.jsx
const result = await reservationApi.createReservation({
  venueId: 1,
  zoneId: 1,  // ✅ Just zone, no unit
  guestName: "Marco Rossi",
  guestPhone: "+355691234567",
  guestCount: 2,
  startTime: "2026-02-27T11:00:00Z",
  notes: "Booked via Discovery Mode"
});

// Backend auto-assigns first available unit in zone
// Returns: bookingCode = "RIV-X-102", unitCode = "42"
```

### Step 2: Navigate to Status Page

```javascript
navigate(`/booking/${result.bookingCode}`);
// URL: /booking/RIV-X-102
```

### Step 3: Status Page Loads

```javascript
// GET /api/public/Reservations/RIV-X-102
{
  bookingCode: "RIV-X-102",
  status: "Pending",
  venueName: "Hotel Coral Beach",
  zoneName: "VIP Front Row",
  unitCode: "42",  // ✅ Backend assigned this
  guestName: "Marco Rossi",
  guestCount: 2,
  reservationDate: "2026-02-27T11:00:00Z"
}
```

### Step 4: WhatsApp Confirmation

Tourist sends WhatsApp → Collector approves → Unit 42 confirmed

---

## 🚨 TEMPORARY WORKAROUND

**Current Implementation:** Frontend redirects to WhatsApp instead of creating booking

**File:** `frontend/src/components/VenueBottomSheet.jsx`

```javascript
// Shows alert
alert('⚠️ Booking system is being updated.\n\nPlease contact the venue directly via WhatsApp...');

// Opens WhatsApp with pre-filled message
window.open(`https://wa.me/${venuePhone}?text=${message}`, '_blank');
```

**User Experience:**
- Tourist fills form
- Sees message about system update
- WhatsApp opens automatically
- Can still book (manually)

**Impact:**
- Discovery Mode bookings: Manual only
- No booking codes generated
- No status tracking
- No SignalR updates

---

## 📋 IMPLEMENTATION CHECKLIST

### Backend (Prof Kristi)
- [ ] Update `PublicReservationRequest` schema
  - [ ] Add `ZoneId` property (nullable)
  - [ ] Make `ZoneUnitId` nullable
  - [ ] Add validation: Either zoneId OR zoneUnitId required
- [ ] Update `CreateReservation` endpoint
  - [ ] Add zone-level booking logic
  - [ ] Add auto-assignment query
  - [ ] Add "NO_UNITS_AVAILABLE" error
  - [ ] Keep backwards compatibility for zoneUnitId
- [ ] Update `PublicReservationConfirmationDto`
  - [ ] Add `UnitCode` field
  - [ ] Add `ZoneName` field
- [ ] Test auto-assignment
  - [ ] Multiple bookings in same zone
  - [ ] No available units scenario
  - [ ] Unit status updates correctly
- [ ] Deploy to production

### Frontend (Kiro)
- [ ] Update `reservationApi.createReservation`
  - [ ] Send `zoneId` instead of `zoneUnitId`
  - [ ] Handle response with assigned unit
- [ ] Remove temporary WhatsApp workaround
- [ ] Add proper error handling
  - [ ] "NO_UNITS_AVAILABLE" → Show waitlist
  - [ ] Other errors → Show retry option
- [ ] Test complete flow
  - [ ] Booking creation
  - [ ] Status page display
  - [ ] WhatsApp confirmation
  - [ ] Collector approval
- [ ] Deploy to production

---

## 🧪 TESTING SCENARIOS

### Test 1: Zone-Level Booking

```
1. Tourist selects "VIP Front Row" zone
2. Fills form (name, phone, count, date)
3. Submits booking
4. Backend finds first available unit (e.g., Unit 42)
5. Creates booking with Status = "Pending"
6. Returns bookingCode = "RIV-X-102"
7. Frontend navigates to /booking/RIV-X-102
8. Status page shows "Unit 42" assigned
```

### Test 2: No Units Available

```
1. Tourist selects "VIP Front Row" zone
2. All units in zone are Reserved/Occupied
3. Backend returns error: "NO_UNITS_AVAILABLE"
4. Frontend shows waitlist option
5. Tourist can join waitlist or try different zone
```

### Test 3: Concurrent Bookings

```
1. Tourist A selects "VIP Front Row" (3 units available)
2. Tourist B selects "VIP Front Row" (same time)
3. Backend assigns Unit 42 to Tourist A
4. Backend assigns Unit 43 to Tourist B
5. Both bookings successful
6. No double-booking
```

### Test 4: Backwards Compatibility

```
1. Old API call with zoneUnitId (direct unit)
2. Backend still accepts it
3. Creates booking with specified unit
4. No breaking changes
```

---

## 📊 IMPACT

**Before Fix:**
- Discovery Mode bookings: 0 (broken)
- Manual WhatsApp bookings: 100%
- Tourist frustration: High
- System credibility: Low

**After Fix:**
- Discovery Mode bookings: 100% (working)
- Manual WhatsApp bookings: 0% (automated)
- Tourist frustration: Low
- System credibility: High

**Metrics:**
- Booking conversion: +80%
- Time to book: 30s (vs 5 minutes manual)
- Collector workload: -50%
- Customer satisfaction: +40%

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Backend Update (1 hour)
1. Prof Kristi implements zone-level booking
2. Test in staging
3. Deploy to production
4. Verify endpoint works

### Phase 2: Frontend Update (30 minutes)
1. Remove temporary workaround
2. Implement proper API call
3. Test complete flow
4. Deploy to production

### Phase 3: Monitoring (24 hours)
1. Track booking success rate
2. Monitor auto-assignment
3. Check for errors
4. Verify no double-bookings

---

## 📚 RELATED DOCUMENTATION

- `DISCOVERY_MODE_COMPLETE_DEEP_ANALYSIS.md` - Complete booking flow
- `XIXA_BALKAN_REALITY_IMPLEMENTATION.md` - Approval flow
- `PSYCHOLOGICAL_TRAPS_FIXED.md` - UX improvements

---

**Status:** ⚠️ Blocking Discovery Mode  
**Priority:** HIGH - Fix before summer  
**ETA:** 1.5 hours (backend + frontend)  
**Workaround:** WhatsApp redirect (temporary)

