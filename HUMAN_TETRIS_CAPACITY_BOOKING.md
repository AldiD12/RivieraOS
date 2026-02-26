# Human Tetris: Capacity-Based Booking System

**Date:** February 26, 2026  
**Philosophy:** Algorithms check capacity, humans arrange space  
**Status:** ✅ Correct approach documented

---

## 🚨 THE FLAW IN AUTO-ASSIGNMENT

### What We Almost Did (WRONG)

```csharp
// ❌ BAD: Try to auto-assign adjacent units
var assignedUnit = await _context.ZoneUnits
    .Where(zu => zu.VenueZoneId == zoneId && zu.Status == "Available")
    .OrderBy(zu => zu.UnitCode)
    .FirstOrDefaultAsync();
```

**Problems:**
- Works for 2 people (1 unit)
- Fails for 6 people (3 units) - might assign A1, B5, C9 (not adjacent!)
- Fails for 8 people (4 units) - impossible to guarantee adjacency
- Algorithm doesn't understand physical layout
- Can't handle L-shaped zones, obstacles, VIP sections

**Example Failure:**

```
Tourist: "6 people, VIP zone"
Algorithm: Assigns Units 1, 7, 15 (scattered across beach)
Reality: Family can't sit together
Result: Angry tourists, refund requests
```

---

## 🧠 THE SOLUTION: Human Tetris Model

**Philosophy:** System checks capacity, collector arranges space

### The Two-Phase Approach

**Phase 1: Math Check (Backend)**
- Calculate units needed: `guestCount / 2 = unitsNeeded`
- Check capacity: "Are there enough available units?"
- Create pending booking WITHOUT assigning specific units

**Phase 2: Human Assignment (Collector)**
- Collector sees visual grid of green squares
- Collector picks adjacent units (human spatial intelligence)
- System records the selection
- Tourist gets confirmation with unit codes

---

## 🔄 COMPLETE FLOW

### Step 1: Tourist Books (Frontend)

```javascript
// VenueBottomSheet.jsx
const result = await reservationApi.createReservation({
  venueId: 1,
  zoneId: 1,
  guestName: "Marco Family",
  guestPhone: "+355691234567",
  guestCount: 6,  // 6 people = 3 units needed
  startTime: "2026-02-27T11:00:00Z"
});

// Response:
{
  bookingCode: "RIV-X-102",
  status: "Pending",
  unitsNeeded: 3,  // Backend calculated this
  message: "Booking pending approval. Please confirm via WhatsApp."
}
```

---

### Step 2: Backend Math Check

```csharp
[HttpPost]
public async Task<ActionResult<PublicReservationConfirmationDto>> CreateReservation(
    [FromBody] PublicReservationRequest request)
{
    // Validate venue and zone
    var zone = await _context.VenueZones
        .FirstOrDefaultAsync(z => z.Id == request.ZoneId && z.VenueId == request.VenueId);
    
    if (zone == null) return NotFound("Zone not found");
    
    // 🧮 MATH CHECK: Calculate units needed
    int unitsNeeded = (int)Math.Ceiling((double)request.GuestCount / 2);
    
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
        GuestCount = request.GuestCount,
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
```

---

### Step 3: WhatsApp Notification

```
Tourist taps "SEND TO VENUE"
WhatsApp opens with:

🏖️ New Booking Request

📋 Code: #RIV-X-102
👤 Guest: Marco Family
👥 Count: 6 people (3 units needed)
📍 Zone: VIP Front Row
🕐 Time: 11:00 AM

Click to approve:
https://riviera-os.vercel.app/action/RIV-X-102
```

---

### Step 4: Collector Opens Approval Page

```javascript
// BookingActionPage.jsx
// GET /api/collector/bookings/RIV-X-102

{
  bookingCode: "RIV-X-102",
  status: "Pending",
  guestName: "Marco Family",
  guestCount: 6,
  unitsNeeded: 3,  // ✅ Collector knows to pick 3 units
  zoneName: "VIP Front Row",
  zoneId: 1
}
```

**UI Display:**

```
┌─────────────────────────────────────┐
│  Booking #RIV-X-102                 │
│  Marco Family • 6 Guests            │
│  VIP Front Row                      │
│                                     │
│  ⚠️ Please select 3 units           │
│                                     │
│  [ ✅ APPROVE ]  [ ❌ REJECT ]      │
└─────────────────────────────────────┘
```

---

### Step 5: Collector Taps APPROVE

```javascript
// BookingActionPage.jsx

const handleApproveClick = async () => {
  // Load available units for visual selection
  const units = await collectorApi.getAvailableUnits(bookingCode);
  
  // Show visual grid
  setAvailableUnits(units);
  setShowUnitGrid(true);
  setUnitsToSelect(booking.unitsNeeded);  // ✅ Need to select 3
  setSelectedUnits([]);  // Track selections
};
```

---

### Step 6: Visual Unit Grid (Multi-Select)

```javascript
// BookingActionPage.jsx - UPDATED for multi-select

const [selectedUnits, setSelectedUnits] = useState([]);
const [unitsToSelect, setUnitsToSelect] = useState(0);

const handleUnitToggle = (unitId, unitCode) => {
  if (processing) return;
  
  // Toggle selection
  if (selectedUnits.includes(unitId)) {
    // Deselect
    setSelectedUnits(prev => prev.filter(id => id !== unitId));
  } else {
    // Select (if not at limit)
    if (selectedUnits.length < unitsToSelect) {
      setSelectedUnits(prev => [...prev, unitId]);
    } else {
      alert(`You can only select ${unitsToSelect} units`);
    }
  }
};

const handleConfirmSelection = async () => {
  if (selectedUnits.length !== unitsToSelect) {
    alert(`Please select exactly ${unitsToSelect} units`);
    return;
  }
  
  if (!confirm(`Assign ${selectedUnits.length} units to Booking #${bookingCode}?`)) {
    return;
  }
  
  try {
    setProcessing(true);
    
    // ✅ Send array of unit IDs
    await collectorApi.approveBooking(bookingCode, selectedUnits);
    
    alert(`✅ Booking approved! ${selectedUnits.length} units assigned.`);
    navigate('/collector');
    
  } catch (err) {
    console.error('Error approving booking:', err);
    alert(err.response?.data?.error || 'Failed to approve booking');
    setProcessing(false);
  }
};

// UI: Visual grid with multi-select
<div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
  {availableUnits.map(unit => {
    const isSelected = selectedUnits.includes(unit.id);
    
    return (
      <button
        key={unit.id}
        onClick={() => handleUnitToggle(unit.id, unit.unitCode)}
        disabled={processing}
        className={`
          rounded-lg p-6 aspect-square flex flex-col items-center justify-center
          transition-all disabled:opacity-50
          ${isSelected 
            ? 'bg-yellow-500 border-4 border-yellow-600 scale-110' 
            : 'bg-green-900 border-2 border-green-600 hover:scale-105'
          }
        `}
      >
        <p className="text-3xl font-black text-white mb-2">{unit.unitCode}</p>
        {isSelected && (
          <span className="text-xs px-2 py-1 rounded bg-white text-yellow-900 font-bold">
            SELECTED
          </span>
        )}
      </button>
    );
  })}
</div>

{/* Selection counter */}
<div className="mt-6 text-center">
  <p className="text-xl text-white mb-4">
    Selected: {selectedUnits.length} / {unitsToSelect}
  </p>
  <button
    onClick={handleConfirmSelection}
    disabled={selectedUnits.length !== unitsToSelect || processing}
    className="bg-green-600 text-white px-8 py-4 rounded-2xl text-xl font-black hover:bg-green-700 disabled:opacity-50"
  >
    CONFIRM SELECTION
  </button>
</div>
```

**Collector Experience:**

```
1. Sees grid of green squares (available units)
2. Taps 3 adjacent squares: A1, A2, A3
3. Selected squares turn YELLOW
4. Counter shows: "Selected: 3 / 3"
5. Taps "CONFIRM SELECTION"
6. Done!
```

---

### Step 7: Backend Approval (Multi-Unit)

```csharp
// CollectorBookingsController.cs

[HttpPut("bookings/{bookingCode}/approve")]
public async Task<ActionResult> ApproveBooking(
    string bookingCode, 
    [FromBody] ApproveBookingRequest request)
{
    var booking = await _context.Bookings
        .FirstOrDefaultAsync(b => b.BookingCode == bookingCode);
    
    if (booking == null) return NotFound();
    if (booking.Status != "Pending") return BadRequest("Booking not pending");
    
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
    {
        return BadRequest("Some units not found");
    }
    
    if (units.Any(u => u.Status != "Available"))
    {
        return BadRequest("Some units not available");
    }
    
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

// NEW: Request accepts array of unit IDs
public class ApproveBookingRequest
{
    public List<int> UnitIds { get; set; }  // Changed from single unitId
}
```

---

### Step 8: Tourist Gets Confirmation

```javascript
// BookingStatusPage.jsx
// SignalR receives: ("RIV-X-102", "Reserved", "A1, A2, A3")

{
  bookingCode: "RIV-X-102",
  status: "Reserved",
  unitCodes: "A1, A2, A3",  // ✅ Multiple units
  venueName: "Hotel Coral Beach",
  zoneName: "VIP Front Row",
  guestCount: 6
}
```

**UI Display:**

```
┌─────────────────────────────────────┐
│  ✅ I KONFIRMUAR                    │
│                                     │
│  Kodet Tuaja:                       │
│  ┌─────────────────────────────┐   │
│  │   A1, A2, A3                │   │
│  │   (3 shezlongë)             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Tregojini këto kode djalit        │
│  të plazhit                         │
└─────────────────────────────────────┘
```

---

## 🗄️ DATABASE SCHEMA CHANGES

### Option 1: Add CurrentBookingId to ZoneUnits (SIMPLE)

```sql
-- Add column to existing table
ALTER TABLE ZoneUnits
ADD CurrentBookingId INT NULL;

-- Add foreign key
ALTER TABLE ZoneUnits
ADD CONSTRAINT FK_ZoneUnits_Bookings
FOREIGN KEY (CurrentBookingId) REFERENCES Bookings(Id);

-- Add index for performance
CREATE INDEX IX_ZoneUnits_CurrentBookingId 
ON ZoneUnits(CurrentBookingId);
```

**Usage:**

```csharp
// When approving booking
unit.CurrentBookingId = booking.Id;

// When checking out
unit.CurrentBookingId = null;
unit.Status = "Available";

// Query units for a booking
var units = await _context.ZoneUnits
    .Where(zu => zu.CurrentBookingId == bookingId)
    .ToListAsync();
```

---

### Option 2: BookingUnits Junction Table (COMPLEX)

```sql
CREATE TABLE BookingUnits (
    Id INT PRIMARY KEY IDENTITY,
    BookingId INT NOT NULL,
    ZoneUnitId INT NOT NULL,
    AssignedAt DATETIME NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (BookingId) REFERENCES Bookings(Id),
    FOREIGN KEY (ZoneUnitId) REFERENCES ZoneUnits(Id),
    UNIQUE (BookingId, ZoneUnitId)
);
```

**Recommendation:** Use Option 1 (CurrentBookingId) - simpler and sufficient

---

## 📊 CAPACITY CALCULATION LOGIC

### Standard Capacity

```csharp
// Most sunbeds fit 2 people
int standardCapacity = 2;
int unitsNeeded = (int)Math.Ceiling((double)guestCount / standardCapacity);

// Examples:
// 1 guest → 1 unit (Math.Ceiling(1/2) = 1)
// 2 guests → 1 unit (Math.Ceiling(2/2) = 1)
// 3 guests → 2 units (Math.Ceiling(3/2) = 2)
// 6 guests → 3 units (Math.Ceiling(6/2) = 3)
// 9 guests → 5 units (Math.Ceiling(9/2) = 5)
```

### Variable Capacity (Future Enhancement)

```csharp
// Some zones have different capacities
var zone = await _context.VenueZones.FindAsync(zoneId);
int unitCapacity = zone.UnitCapacity ?? 2;  // Default to 2
int unitsNeeded = (int)Math.Ceiling((double)guestCount / unitCapacity);

// VIP cabanas might fit 4 people
// Standard sunbeds fit 2 people
// Single loungers fit 1 person
```

---

## 🧪 TESTING SCENARIOS

### Test 1: Small Group (2 people)

```
1. Tourist books 2 people
2. Backend calculates: 1 unit needed
3. Collector sees: "Select 1 unit"
4. Collector taps 1 green square
5. Booking approved with 1 unit
```

### Test 2: Medium Group (6 people)

```
1. Tourist books 6 people
2. Backend calculates: 3 units needed
3. Collector sees: "Select 3 units"
4. Collector taps 3 adjacent squares (A1, A2, A3)
5. Booking approved with 3 units
6. Tourist sees: "A1, A2, A3"
```

### Test 3: Large Group (9 people)

```
1. Tourist books 9 people
2. Backend calculates: 5 units needed
3. Collector sees: "Select 5 units"
4. Collector taps 5 squares in L-shape
5. Booking approved with 5 units
6. Tourist sees: "A1, A2, A3, B1, B2"
```

### Test 4: Insufficient Capacity

```
1. Tourist books 10 people (5 units needed)
2. Zone only has 3 available units
3. Backend returns: "INSUFFICIENT_CAPACITY"
4. Frontend shows: "Not enough space. Try different zone or date."
5. Tourist can join waitlist
```

### Test 5: Collector Picks Wrong Count

```
1. Booking needs 3 units
2. Collector only selects 2 units
3. Taps "CONFIRM SELECTION"
4. Alert: "Please select exactly 3 units"
5. Collector adds 1 more unit
6. Confirms successfully
```

---

## 🎯 WHY THIS WORKS

### Algorithms Can't Do

- ❌ Understand physical layout (L-shapes, corners, obstacles)
- ❌ Know which units are actually adjacent
- ❌ Consider VIP preferences (front row, shade, etc.)
- ❌ Handle special requests (near bathroom, away from bar)
- ❌ Adapt to real-time beach conditions

### Humans Can Do

- ✅ See the actual beach layout
- ✅ Pick adjacent units instantly
- ✅ Consider guest preferences
- ✅ Handle special requests
- ✅ Adapt to conditions (wind, sun, noise)

### System's Role

- ✅ Check capacity (math)
- ✅ Show available units (data)
- ✅ Validate selection (rules)
- ✅ Record assignment (database)
- ✅ Notify tourist (communication)

---

## 📝 IMPLEMENTATION CHECKLIST

### Backend (Prof Kristi)
- [ ] Add `UnitsNeeded` column to Bookings table
- [ ] Add `CurrentBookingId` column to ZoneUnits table
- [ ] Update `CreateReservation` endpoint
  - [ ] Calculate unitsNeeded
  - [ ] Check capacity (not specific units)
  - [ ] Create pending booking without unit assignment
- [ ] Update `ApproveBooking` endpoint
  - [ ] Accept array of unit IDs
  - [ ] Validate count matches unitsNeeded
  - [ ] Assign all units to booking
  - [ ] Update CurrentBookingId for each unit
- [ ] Update `GetBookingDetails` endpoint
  - [ ] Return unitsNeeded
  - [ ] Return assigned unit codes (if approved)
- [ ] Test multi-unit bookings

### Frontend (Kiro)
- [ ] Update VenueBottomSheet
  - [ ] Send guestCount to backend
  - [ ] Handle unitsNeeded in response
- [ ] Update BookingActionPage
  - [ ] Add multi-select state
  - [ ] Add selection counter
  - [ ] Add unit toggle logic
  - [ ] Update approve API call (array of IDs)
- [ ] Update BookingStatusPage
  - [ ] Display multiple unit codes
  - [ ] Handle comma-separated codes
- [ ] Update collectorApi
  - [ ] Change approveBooking to accept array
- [ ] Test complete flow

---

## 🚀 DEPLOYMENT PLAN

### Phase 1: Database Migration
1. Add CurrentBookingId column
2. Add UnitsNeeded column
3. Run migration in staging
4. Verify no data loss

### Phase 2: Backend Update
1. Deploy new endpoints
2. Test capacity calculation
3. Test multi-unit approval
4. Verify SignalR events

### Phase 3: Frontend Update
1. Deploy multi-select UI
2. Test unit selection
3. Test approval flow
4. Verify tourist confirmation

### Phase 4: Production Testing
1. Test with real bookings
2. Monitor capacity checks
3. Track approval times
4. Collect collector feedback

---

**Status:** ✅ Correct approach documented  
**Philosophy:** Humans arrange space, algorithms check capacity  
**Result:** Scalable for any group size

