# XIXA Instant Booking Flow - New Specification

**Date:** March 1, 2026  
**Feature:** Instant sunbed/cabana booking with arrival time + auto-expiration  
**Goal:** Book directly if available, auto-release if guest doesn't arrive within 15 minutes

---

## 🎯 THE NEW FLOW

### User Experience

```
Tourist → Opens XIXA Discovery Mode
       → Sees venue with 15 available sunbeds
       → Taps venue marker
       → Bottom sheet shows zones
       → Selects "VIP Zone" (10 available)
       → Fills form:
          • Name: John Doe
          • Phone: +355 69 123 4567
          • Guests: 2
          • Arrival Time: 11:30 (dropdown: 09:00 - 18:00)
       → Taps "REZERVO TANI" (Book Now)
       
System → Checks if sunbed available in VIP Zone
       → ✅ Available: Creates reservation instantly
       → Assigns sunbed code: VIP-12
       → Status: "CONFIRMED" (not pending!)
       → Shows confirmation page
       
Confirmation Page:
┌─────────────────────────────────────┐
│  REZERVIMI U KONFIRMUA ✅           │
│                                     │
│  KODI YT: VIP-12                    │
│  (Tregoja këtë kod në plazh)       │
│                                     │
│  DETAJET:                           │
│  • Vendi: Folie Beach Club         │
│  • Zona: VIP Section               │
│  • Persona: 2                       │
│  • Ora e Arritjes: 11:30           │
│                                     │
│  ⏰ Rezervimi skadon në 11:45      │
│  (15 minuta pas orës së arritjes)  │
│                                     │
│  [SHIKO NË HARTË] 🗺️               │
│  [KONTAKTO PLAZHIN] 💬              │
└─────────────────────────────────────┘
```

---

## ⏰ AUTO-EXPIRATION LOGIC

### Timing Rules

**Arrival Time:** User selects expected arrival (e.g., 11:30)  
**Grace Period:** 15 minutes after arrival time  
**Expiration:** 11:45 (arrival time + 15 minutes)

### Scenarios

#### Scenario 1: Guest Arrives Early ✅
```
Booking: 11:30 arrival
Guest arrives: 11:15 (15 min early)
Collector: Scans QR code VIP-12
System: ✅ Confirms reservation
Status: "CHECKED_IN"
Expiration: Cancelled (guest arrived)
```

#### Scenario 2: Guest Arrives On Time ✅
```
Booking: 11:30 arrival
Guest arrives: 11:30 (on time)
Collector: Scans QR code VIP-12
System: ✅ Confirms reservation
Status: "CHECKED_IN"
```

#### Scenario 3: Guest Arrives Late (Within Grace) ✅
```
Booking: 11:30 arrival
Guest arrives: 11:40 (10 min late)
Collector: Scans QR code VIP-12
System: ✅ Confirms reservation (still within 15 min)
Status: "CHECKED_IN"
```

#### Scenario 4: Guest Doesn't Arrive (Auto-Cancel) ❌
```
Booking: 11:30 arrival
Current time: 11:46 (16 min past arrival)
System: ⏰ Auto-expires reservation
Status: "EXPIRED"
Sunbed: Released back to available pool
Guest: Cannot check in with VIP-12 code
```

#### Scenario 5: Guest Arrives Too Late ❌
```
Booking: 11:30 arrival
Guest arrives: 11:50 (20 min late)
Collector: Scans QR code VIP-12
System: ❌ "Reservation expired"
Status: "EXPIRED"
Action: Guest must make new booking
```

---

## 🏗️ TECHNICAL IMPLEMENTATION

### Frontend Changes

#### 1. VenueBottomSheet.jsx - Add Arrival Time Picker

```javascript
const [bookingData, setBookingData] = useState({
  guestName: '',
  guestPhone: '',
  guestCount: 2,
  arrivalTime: '11:00' // NEW: Default to current hour + 1
});

// Generate time slots (09:00 - 18:00, 30-min intervals)
const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

// In booking form:
<select
  value={bookingData.arrivalTime}
  onChange={(e) => setBookingData({ ...bookingData, arrivalTime: e.target.value })}
>
  {timeSlots.map(time => (
    <option key={time} value={time}>{time}</option>
  ))}
</select>
```

#### 2. Reservation API Call

```javascript
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setSubmitting(true);
    
    // Create instant reservation
    const result = await reservationApi.createReservation({
      venueId: venue.id,
      zoneId: selectedZone.id,
      guestName: bookingData.guestName,
      guestPhone: bookingData.guestPhone,
      guestCount: bookingData.guestCount,
      arrivalTime: bookingData.arrivalTime, // NEW
      reservationDate: new Date().toISOString().split('T')[0],
      notes: 'Booked via XIXA Discovery'
    });
    
    // Navigate to confirmation page
    navigate(`/booking/${result.bookingCode}`);
    
  } catch (error) {
    if (error.message.includes('No available units')) {
      alert('Na vjen keq, nuk ka vende të lira në këtë zonë.');
    } else {
      alert('Rezervimi dështoi. Ju lutem provoni përsëri.');
    }
  } finally {
    setSubmitting(false);
  }
};
```

#### 3. BookingStatusPage.jsx - Show Expiration Timer

```javascript
// Calculate expiration time
const arrivalTime = new Date(`${booking.reservationDate}T${booking.arrivalTime}`);
const expirationTime = new Date(arrivalTime.getTime() + 15 * 60000); // +15 minutes

// Show countdown
const [timeRemaining, setTimeRemaining] = useState('');

useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    const diff = expirationTime - now;
    
    if (diff <= 0) {
      setTimeRemaining('EXPIRED');
      clearInterval(interval);
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }, 1000);
  
  return () => clearInterval(interval);
}, []);

// Display in UI:
<div className="text-center">
  <p className="text-sm text-stone-500">Rezervimi skadon në:</p>
  <p className="text-2xl font-mono text-amber-900">{timeRemaining}</p>
</div>
```

---

### Backend Changes (For Prof Kristi)

#### 1. Reservation Model - Add ArrivalTime

```csharp
public class Reservation
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public int ZoneId { get; set; }
    public int? ZoneUnitId { get; set; } // Auto-assigned
    public string GuestName { get; set; }
    public string GuestPhone { get; set; }
    public int GuestCount { get; set; }
    public DateTime ReservationDate { get; set; }
    public TimeSpan ArrivalTime { get; set; } // NEW
    public DateTime? ExpirationTime { get; set; } // NEW: ArrivalTime + 15 min
    public string Status { get; set; } // CONFIRMED, CHECKED_IN, EXPIRED, CANCELLED
    public string BookingCode { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

#### 2. Create Reservation Endpoint - Instant Booking

```csharp
[HttpPost]
[Route("api/public/Reservations")]
public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest request)
{
    // 1. Find available unit in zone
    var availableUnit = await _context.ZoneUnits
        .Where(u => u.ZoneId == request.ZoneId 
                 && u.Status == "Available" 
                 && !u.IsDeleted)
        .FirstOrDefaultAsync();
    
    if (availableUnit == null)
    {
        return BadRequest(new { error = "No available units in this zone" });
    }
    
    // 2. Calculate expiration time
    var arrivalDateTime = request.ReservationDate.Date + request.ArrivalTime;
    var expirationTime = arrivalDateTime.AddMinutes(15);
    
    // 3. Create reservation (CONFIRMED status)
    var reservation = new Reservation
    {
        VenueId = request.VenueId,
        ZoneId = request.ZoneId,
        ZoneUnitId = availableUnit.Id, // Auto-assigned!
        GuestName = request.GuestName,
        GuestPhone = request.GuestPhone,
        GuestCount = request.GuestCount,
        ReservationDate = request.ReservationDate,
        ArrivalTime = request.ArrivalTime,
        ExpirationTime = expirationTime,
        Status = "CONFIRMED", // Instant confirmation!
        BookingCode = GenerateBookingCode(),
        CreatedAt = DateTime.UtcNow
    };
    
    _context.Reservations.Add(reservation);
    
    // 4. Mark unit as reserved
    availableUnit.Status = "Reserved";
    availableUnit.ReservationId = reservation.Id;
    
    await _context.SaveChangesAsync();
    
    // 5. Return confirmation
    return Ok(new
    {
        bookingCode = reservation.BookingCode,
        unitCode = availableUnit.Code, // VIP-12
        status = "CONFIRMED",
        arrivalTime = reservation.ArrivalTime,
        expirationTime = reservation.ExpirationTime
    });
}
```

#### 3. Background Job - Auto-Expire Reservations

```csharp
// Run every 1 minute
public class ReservationExpirationJob : IHostedService
{
    public async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            
            // Find expired reservations
            var expiredReservations = await _context.Reservations
                .Include(r => r.ZoneUnit)
                .Where(r => r.Status == "CONFIRMED" 
                         && r.ExpirationTime <= now)
                .ToListAsync();
            
            foreach (var reservation in expiredReservations)
            {
                // Update reservation status
                reservation.Status = "EXPIRED";
                
                // Release the unit
                if (reservation.ZoneUnit != null)
                {
                    reservation.ZoneUnit.Status = "Available";
                    reservation.ZoneUnit.ReservationId = null;
                }
                
                _logger.LogInformation($"Reservation {reservation.BookingCode} expired and unit released");
            }
            
            await _context.SaveChangesAsync();
            
            // Wait 1 minute
            await Task.Delay(TimeSpan.FromMinutes(1), cancellationToken);
        }
    }
}
```

#### 4. Check-In Endpoint - Validate Expiration

```csharp
[HttpPost]
[Route("api/collector/Reservations/{bookingCode}/checkin")]
public async Task<IActionResult> CheckInReservation(string bookingCode)
{
    var reservation = await _context.Reservations
        .Include(r => r.ZoneUnit)
        .FirstOrDefaultAsync(r => r.BookingCode == bookingCode);
    
    if (reservation == null)
    {
        return NotFound(new { error = "Reservation not found" });
    }
    
    // Check if expired
    if (reservation.Status == "EXPIRED")
    {
        return BadRequest(new { error = "Reservation has expired" });
    }
    
    if (DateTime.UtcNow > reservation.ExpirationTime)
    {
        // Expire it now
        reservation.Status = "EXPIRED";
        if (reservation.ZoneUnit != null)
        {
            reservation.ZoneUnit.Status = "Available";
            reservation.ZoneUnit.ReservationId = null;
        }
        await _context.SaveChangesAsync();
        
        return BadRequest(new { error = "Reservation has expired" });
    }
    
    // Valid check-in
    reservation.Status = "CHECKED_IN";
    if (reservation.ZoneUnit != null)
    {
        reservation.ZoneUnit.Status = "Occupied";
    }
    
    await _context.SaveChangesAsync();
    
    return Ok(new { message = "Check-in successful", unitCode = reservation.ZoneUnit?.Code });
}
```

---

## 📊 DATABASE SCHEMA

### Migration: Add Arrival Time & Expiration

```sql
ALTER TABLE Reservations 
ADD ArrivalTime TIME NOT NULL DEFAULT '11:00:00',
    ExpirationTime DATETIME2 NULL;

-- Update existing reservations
UPDATE Reservations 
SET ExpirationTime = DATEADD(MINUTE, 15, CAST(ReservationDate AS DATETIME) + CAST(ArrivalTime AS DATETIME))
WHERE Status = 'CONFIRMED';
```

---

## 🎨 UI/UX IMPROVEMENTS

### Booking Form

**Before:**
```
Name: [________]
Phone: [________]
Guests: [2]
Date: [Today]
[BOOK NOW]
```

**After:**
```
Name: [________]
Phone: [________]
Guests: [2]
Arrival Time: [11:30 ▼]  ← NEW
Date: [Today]

⏰ Your sunbed will be held until 11:45
(15 minutes after arrival time)

[REZERVO TANI]
```

### Confirmation Page

**Show:**
- ✅ Booking confirmed instantly
- 🏖️ Sunbed code (VIP-12)
- ⏰ Countdown timer to expiration
- 📍 Map to venue
- 💬 WhatsApp contact button

**Don't Show:**
- ❌ "Waiting for approval" message
- ❌ "Pending" status
- ❌ SignalR connection (not needed)

---

## 🔄 COMPARISON: Old vs New Flow

### Old Flow (WhatsApp Bridge)
```
1. Fill form
2. Create PENDING reservation
3. Navigate to waiting page
4. Tap WhatsApp button
5. Send message to venue
6. Wait for staff approval
7. SignalR updates page
8. Show CONFIRMED + unit code
```
**Time:** 5-10 minutes (manual approval)  
**Complexity:** High (SignalR, WhatsApp, manual approval)

### New Flow (Instant Booking)
```
1. Fill form (with arrival time)
2. Create CONFIRMED reservation
3. Auto-assign available unit
4. Navigate to confirmation page
5. Show unit code immediately
```
**Time:** Instant (< 1 second)  
**Complexity:** Low (simple API call)

---

## ✅ BENEFITS

### For Tourists
- ✅ Instant confirmation (no waiting)
- ✅ No WhatsApp required
- ✅ Clear expiration time
- ✅ Can arrive early (before arrival time)
- ✅ 15-minute grace period

### For Venues
- ✅ No manual approval needed
- ✅ Auto-release no-shows
- ✅ Maximize occupancy
- ✅ Reduce staff workload
- ✅ Fair system (first-come, first-served)

### For System
- ✅ Simpler architecture (no SignalR needed)
- ✅ Automatic inventory management
- ✅ No pending state
- ✅ Self-healing (auto-expiration)

---

## 🚨 EDGE CASES

### What if all sunbeds are reserved but not checked in?
**Solution:** Background job expires old reservations every minute, freeing up units.

### What if guest books multiple times?
**Solution:** Allow it. Each booking gets a unique code. Guest can cancel extras.

### What if guest arrives 30 minutes early?
**Solution:** Allowed! Collector can check them in anytime before expiration.

### What if guest arrives 20 minutes late?
**Solution:** Reservation expired. Guest must make new booking (if available).

### What if venue is fully booked?
**Solution:** Show "No availability" message. Suggest nearby venues or different time.

---

## 📝 IMPLEMENTATION CHECKLIST

### Frontend (2-3 hours)
- [ ] Add arrival time picker to booking form
- [ ] Update reservation API call with arrivalTime
- [ ] Add expiration countdown to confirmation page
- [ ] Remove SignalR connection (not needed)
- [ ] Update error messages
- [ ] Test instant booking flow

### Backend (3-4 hours)
- [ ] Add ArrivalTime and ExpirationTime to Reservation model
- [ ] Update CreateReservation endpoint (auto-assign unit)
- [ ] Create background job for auto-expiration
- [ ] Update CheckIn endpoint (validate expiration)
- [ ] Add database migration
- [ ] Test expiration logic

### Testing (1-2 hours)
- [ ] Book sunbed with 11:30 arrival
- [ ] Verify unit is assigned immediately
- [ ] Wait 16 minutes, verify auto-expiration
- [ ] Try to check in after expiration (should fail)
- [ ] Book again, check in early (should work)
- [ ] Book again, check in on time (should work)

---

## 🎯 SUMMARY

**Old System:** WhatsApp bridge + manual approval + SignalR  
**New System:** Instant booking + arrival time + auto-expiration

**Key Change:** From "request → wait → approve" to "book → arrive → check-in"

**Result:** Faster, simpler, more reliable booking experience! 🚀
