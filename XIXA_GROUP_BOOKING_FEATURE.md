# XIXA Group Booking Feature - Adjacent Sunbeds

**Date:** March 1, 2026  
**Feature:** Book multiple adjacent sunbeds for groups  
**Goal:** Ensure groups get sunbeds next to each other

---

## 🎯 THE PROBLEM

**Scenario:**
- Family of 6 needs 3 sunbeds
- Current system: Books 1 sunbed at a time
- Result: Sunbeds might be VIP-1, VIP-8, VIP-15 (scattered!)
- Family: Frustrated, can't sit together

**Solution:** Book multiple sunbeds in one transaction, prioritizing adjacent units.

---

## 🎨 UI/UX DESIGN

### Booking Form - Updated

```
┌─────────────────────────────────────┐
│  REZERVO NË FOLIE BEACH CLUB        │
│                                     │
│  Emri: [John Doe____________]      │
│  Telefoni: [+355 69 123 4567]      │
│                                     │
│  Sa persona jeni?                   │
│  ┌─────────────────────────────┐   │
│  │  [1-2] [3-4] [5-6] [7-8] [9+]│   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 Për 3-4 persona: 2 shtretër    │
│  💡 Për 5-6 persona: 3 shtretër    │
│                                     │
│  Numri i shtretërve:                │
│  ┌─────────────────────────────┐   │
│  │  [1] [2] [3] [4] [5] [6]    │   │
│  └─────────────────────────────┘   │
│  (Selected: 3)                      │
│                                     │
│  Ora e Arritjes: [11:30 ▼]         │
│                                     │
│  ✅ Do të rezervojmë 3 shtretër    │
│     pranë njëri-tjetrit             │
│                                     │
│  [REZERVO TANI - €150]              │
└─────────────────────────────────────┘
```

### Key Changes

1. **Guest Count Selector:**
   - Quick buttons: 1-2, 3-4, 5-6, 7-8, 9+
   - Auto-suggests sunbed count based on guests

2. **Sunbed Count Selector:**
   - Buttons: 1, 2, 3, 4, 5, 6
   - Shows total price (€50 × 3 = €150)

3. **Proximity Guarantee:**
   - "✅ Do të rezervojmë 3 shtretër pranë njëri-tjetrit"
   - System will try to book adjacent sunbeds

---

## 🏗️ BACKEND LOGIC

### Algorithm: Find Adjacent Sunbeds

```csharp
public async Task<List<ZoneUnit>> FindAdjacentUnits(int zoneId, int count)
{
    // 1. Get all available units in zone, ordered by position
    var availableUnits = await _context.ZoneUnits
        .Where(u => u.ZoneId == zoneId 
                 && u.Status == "Available" 
                 && !u.IsDeleted)
        .OrderBy(u => u.RowNumber)
        .ThenBy(u => u.ColumnNumber)
        .ToListAsync();
    
    if (availableUnits.Count < count)
    {
        return null; // Not enough units
    }
    
    // 2. Try to find consecutive units in same row
    for (int i = 0; i <= availableUnits.Count - count; i++)
    {
        var group = availableUnits.Skip(i).Take(count).ToList();
        
        // Check if all units are in same row and consecutive
        if (AreAdjacent(group))
        {
            return group; // Found adjacent group!
        }
    }
    
    // 3. Fallback: Find closest units (even if not perfectly adjacent)
    return availableUnits.Take(count).ToList();
}

private bool AreAdjacent(List<ZoneUnit> units)
{
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

### Create Group Reservation

```csharp
[HttpPost]
[Route("api/public/Reservations/group")]
public async Task<IActionResult> CreateGroupReservation([FromBody] CreateGroupReservationRequest request)
{
    // 1. Find adjacent units
    var units = await FindAdjacentUnits(request.ZoneId, request.SunbedCount);
    
    if (units == null || units.Count < request.SunbedCount)
    {
        return BadRequest(new { 
            error = "Not enough adjacent sunbeds available",
            availableCount = units?.Count ?? 0
        });
    }
    
    // 2. Calculate expiration
    var arrivalDateTime = request.ReservationDate.Date + request.ArrivalTime;
    var expirationTime = arrivalDateTime.AddMinutes(15);
    
    // 3. Create single reservation for all units
    var reservation = new Reservation
    {
        VenueId = request.VenueId,
        ZoneId = request.ZoneId,
        GuestName = request.GuestName,
        GuestPhone = request.GuestPhone,
        GuestCount = request.GuestCount,
        SunbedCount = request.SunbedCount, // NEW
        ReservationDate = request.ReservationDate,
        ArrivalTime = request.ArrivalTime,
        ExpirationTime = expirationTime,
        Status = "CONFIRMED",
        BookingCode = GenerateBookingCode(),
        CreatedAt = DateTime.UtcNow
    };
    
    _context.Reservations.Add(reservation);
    await _context.SaveChangesAsync();
    
    // 4. Assign all units to this reservation
    var unitCodes = new List<string>();
    foreach (var unit in units)
    {
        unit.Status = "Reserved";
        unit.ReservationId = reservation.Id;
        unitCodes.Add(unit.Code);
    }
    
    await _context.SaveChangesAsync();
    
    // 5. Return confirmation with all unit codes
    return Ok(new
    {
        bookingCode = reservation.BookingCode,
        unitCodes = unitCodes, // ["VIP-12", "VIP-13", "VIP-14"]
        status = "CONFIRMED",
        sunbedCount = units.Count,
        areAdjacent = AreAdjacent(units),
        totalPrice = units.Sum(u => u.Zone.BasePrice)
    });
}
```

---

## 📱 CONFIRMATION PAGE

### Show All Sunbed Codes

```
┌─────────────────────────────────────┐
│  REZERVIMI U KONFIRMUA ✅           │
│                                     │
│  KODET TUAJA:                       │
│  ┌─────────────────────────────┐   │
│  │  VIP-12  │  VIP-13  │  VIP-14│   │
│  └─────────────────────────────┘   │
│  (3 shtretër pranë njëri-tjetrit)  │
│                                     │
│  DETAJET:                           │
│  • Vendi: Folie Beach Club         │
│  • Zona: VIP Section               │
│  • Persona: 6                       │
│  • Shtretër: 3                      │
│  • Ora e Arritjes: 11:30           │
│                                     │
│  ⏰ Rezervimi skadon në 11:45      │
│                                     │
│  💰 Totali: €150                    │
│  (€50 × 3 shtretër)                 │
│                                     │
│  [SHIKO NË HARTË] 🗺️               │
│  [KONTAKTO PLAZHIN] 💬              │
└─────────────────────────────────────┘
```

---

## 🎯 SMART SUGGESTIONS

### Auto-Calculate Sunbed Count

```javascript
// In booking form
const suggestSunbedCount = (guestCount) => {
  if (guestCount <= 2) return 1;
  if (guestCount <= 4) return 2;
  if (guestCount <= 6) return 3;
  if (guestCount <= 8) return 4;
  return Math.ceil(guestCount / 2);
};

// When guest count changes:
const handleGuestCountChange = (count) => {
  setBookingData({
    ...bookingData,
    guestCount: count,
    sunbedCount: suggestSunbedCount(count) // Auto-suggest
  });
};
```

### Show Helpful Tips

```javascript
const getTip = (guestCount, sunbedCount) => {
  if (guestCount > sunbedCount * 2) {
    return `💡 Për ${guestCount} persona, rekomandojmë ${Math.ceil(guestCount / 2)} shtretër`;
  }
  return `✅ ${sunbedCount} shtretër janë të mjaftueshëm për ${guestCount} persona`;
};
```

---

## 🔄 FALLBACK SCENARIOS

### Scenario 1: Not Enough Adjacent Sunbeds

**Problem:** User wants 4 sunbeds, but only 2 are adjacent.

**Solution:**
```
┌─────────────────────────────────────┐
│  ⚠️ Nuk ka 4 shtretër pranë        │
│                                     │
│  Opsionet:                          │
│                                     │
│  1️⃣ Rezervo 2 shtretër pranë       │
│     (VIP-12, VIP-13)                │
│     [REZERVO 2 SHTRETËR]            │
│                                     │
│  2️⃣ Rezervo 4 shtretër të shpërndarë│
│     (VIP-12, VIP-13, VIP-18, VIP-20)│
│     [REZERVO 4 SHTRETËR]            │
│                                     │
│  3️⃣ Provo zonë tjetër               │
│     [SHIKO ZONA TË TJERA]           │
└─────────────────────────────────────┘
```

### Scenario 2: Zone Full

**Problem:** No sunbeds available in selected zone.

**Solution:**
```
┌─────────────────────────────────────┐
│  ❌ Zona VIP është e plotë          │
│                                     │
│  Zona të tjera me vende:           │
│                                     │
│  🏖️ Zona Standard                   │
│     8 shtretër të lirë              │
│     €30/shtretër                    │
│     [REZERVO KËTU]                  │
│                                     │
│  🏖️ Zona Premium                    │
│     5 shtretër të lirë              │
│     €40/shtretër                    │
│     [REZERVO KËTU]                  │
└─────────────────────────────────────┘
```

---

## 💾 DATABASE SCHEMA

### Add SunbedCount to Reservations

```sql
ALTER TABLE Reservations 
ADD SunbedCount INT NOT NULL DEFAULT 1;

-- Update existing reservations
UPDATE Reservations 
SET SunbedCount = 1 
WHERE SunbedCount IS NULL;
```

### Add Position to ZoneUnits (if not exists)

```sql
ALTER TABLE ZoneUnits 
ADD RowNumber INT NULL,
    ColumnNumber INT NULL;

-- Example data:
-- Row 1: VIP-1 (1,1), VIP-2 (1,2), VIP-3 (1,3)
-- Row 2: VIP-4 (2,1), VIP-5 (2,2), VIP-6 (2,3)
```

---

## 🎨 VISUAL SUNBED SELECTOR (Future Enhancement)

### Interactive Map View

```
┌─────────────────────────────────────┐
│  Zgjidhni shtretërit tuaj:         │
│                                     │
│  🏖️ Zona VIP                        │
│                                     │
│  Row 1: [🟢][🟢][🔴][🟢][🟢]       │
│  Row 2: [🟢][🟢][🟢][🔴][🟢]       │
│  Row 3: [🔴][🔴][🟢][🟢][🟢]       │
│                                     │
│  🟢 I lirë  🔴 I zënë  🔵 Zgjedhur  │
│                                     │
│  Zgjedhur: 3 shtretër               │
│  [VIP-1] [VIP-2] [VIP-5]            │
│                                     │
│  [KONFIRMO ZGJEDHJEN]               │
└─────────────────────────────────────┘
```

**Note:** This is Phase 2. For now, auto-assign adjacent sunbeds.

---

## 📊 PRICING

### Group Discount (Optional)

```javascript
const calculatePrice = (sunbedCount, basePrice) => {
  let total = sunbedCount * basePrice;
  
  // Apply group discount
  if (sunbedCount >= 4) {
    total *= 0.9; // 10% off for 4+ sunbeds
  } else if (sunbedCount >= 3) {
    total *= 0.95; // 5% off for 3 sunbeds
  }
  
  return total;
};

// Example:
// 1 sunbed: €50
// 2 sunbeds: €100
// 3 sunbeds: €142.50 (5% off)
// 4 sunbeds: €180 (10% off)
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Frontend (3-4 hours)
- [ ] Add guest count selector (quick buttons)
- [ ] Add sunbed count selector
- [ ] Auto-suggest sunbed count based on guests
- [ ] Show total price calculation
- [ ] Update API call to include sunbedCount
- [ ] Handle "not enough adjacent" error
- [ ] Show all unit codes on confirmation page

### Backend (4-5 hours)
- [ ] Add SunbedCount to Reservation model
- [ ] Add RowNumber/ColumnNumber to ZoneUnit model
- [ ] Implement FindAdjacentUnits algorithm
- [ ] Create group reservation endpoint
- [ ] Update expiration job (handle multiple units)
- [ ] Update check-in endpoint (validate all units)
- [ ] Add database migration

### Testing (2 hours)
- [ ] Book 1 sunbed (should work as before)
- [ ] Book 3 adjacent sunbeds (should get VIP-1, VIP-2, VIP-3)
- [ ] Book 5 sunbeds when only 3 adjacent (should show options)
- [ ] Verify all units expire together
- [ ] Check in with group booking code
- [ ] Verify pricing calculation

---

## 🎯 USER STORIES

### Story 1: Family of 6
```
As a family of 6,
I want to book 3 sunbeds next to each other,
So we can all sit together at the beach.

Acceptance:
✅ Select 6 guests → System suggests 3 sunbeds
✅ Book → Get VIP-12, VIP-13, VIP-14 (adjacent)
✅ Arrive → Collector scans one code, confirms all 3
```

### Story 2: Couple
```
As a couple,
I want to book 1 sunbed,
So we can share it together.

Acceptance:
✅ Select 2 guests → System suggests 1 sunbed
✅ Book → Get VIP-5
✅ Arrive → Collector scans code, confirms 1 sunbed
```

### Story 3: Large Group
```
As a group of 10,
I want to book 5 sunbeds close together,
So we can all be in the same area.

Acceptance:
✅ Select 10 guests → System suggests 5 sunbeds
✅ Book → Get 5 adjacent sunbeds (or best available)
✅ If not enough adjacent → Show options
✅ Arrive → Collector scans one code, confirms all 5
```

---

## 🚀 SUMMARY

**Key Features:**
1. ✅ Book multiple sunbeds in one transaction
2. ✅ Auto-suggest sunbed count based on guests
3. ✅ Prioritize adjacent sunbeds
4. ✅ Fallback to scattered if needed
5. ✅ Single booking code for entire group
6. ✅ All sunbeds expire together
7. ✅ Group discount (optional)

**Benefits:**
- Groups stay together
- Better user experience
- Higher booking conversion
- Simpler check-in (one code)
- Fair pricing

**Next Steps:**
1. Implement guest/sunbed count selectors
2. Build adjacent sunbed algorithm
3. Test with real venue layouts
4. Add visual sunbed selector (Phase 2)
