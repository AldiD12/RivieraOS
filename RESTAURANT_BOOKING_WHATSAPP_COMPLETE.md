# Restaurant Booking with WhatsApp Integration - Complete

**Date:** March 1, 2026  
**Status:** ✅ Complete  
**Component:** VenueBottomSheet.jsx

---

## Overview

Restaurant bookings now use a similar form to beach bookings, but open WhatsApp with a prefilled message instead of instant booking. The form intelligently adapts based on venue type.

---

## Implementation Details

### Guest Count Selector (Both Venue Types)

**UI:**
```
Sa persona jeni?
[1-2] [3-4] [5-6] [7-8] [9+]
```

**Features:**
- 5 quick-select buttons
- Auto-suggests sunbed count for beaches
- Theme-aware styling (day/night)
- Active state: XIXA green (night) / zinc-950 (day)

### Sunbed Count Selector (Beach Only)

**UI:**
```
Numri i shtretërve
[1] [2] [3] [4] [5] [6]

💡 Për 6 persona, rekomandojmë 3 shtretër
```

**Features:**
- Only shows for Beach venues
- Auto-suggests based on guest count
- Shows helpful tip
- 6 buttons (1-6 sunbeds)

### Arrival Time (Both Venue Types)

**UI:**
```
Ora e Arritjes
[Dropdown: 09:00 - 18:00]

⏰ Rezervimi skadon 15 minuta pas orës së arritjes (Beach only)
```

**Features:**
- 30-minute intervals
- Same for both venue types
- Expiration warning only for beaches

---

## Booking Flow by Venue Type

### Beach Venues (Instant Booking)

**Flow:**
1. User fills form (name, phone, guests, sunbeds, arrival time)
2. Taps "REZERVO TANI"
3. System creates instant reservation (mock data for now)
4. Navigates to success page with booking code
5. Shows sunbed codes, expiration time, total price

**Summary Section:**
```
Përmbledhje
✅ Do të rezervojmë 3 shtretër pranë njëri-tjetrit
€150.00
3 shtretër × €50
```

**Button:** "REZERVO TANI" (Book Now)

### Restaurant Venues (WhatsApp)

**Flow:**
1. User fills form (name, phone, guests, arrival time)
2. Taps "DËRGO MESAZH"
3. Opens WhatsApp with prefilled message
4. User sends message to restaurant
5. Restaurant confirms via WhatsApp

**WhatsApp Message Template:**
```
Përshëndetje! 👋

Dua të rezervoj tavolinë:

🍽️ Restoranti: [Venue Name]
👥 Persona: [Guest Count]
📅 Data: [Today's Date]
🕐 Ora: [Arrival Time]

Emri: [Guest Name]
Telefoni: [Guest Phone]

Faleminderit!
```

**Summary Section:**
```
Përmbledhje
📱 Do të dërgoni mesazh në WhatsApp për të konfirmuar rezervimin
6 persona • 11:30
```

**Button:** "DËRGO MESAZH" (Send Message)

---

## Code Structure

### State Management

```javascript
const [bookingData, setBookingData] = useState({
  guestName: savedName,
  guestPhone: savedPhone,
  guestCount: 2,
  sunbedCount: 1,
  arrivalTime: defaultArrivalTime,
  date: new Date().toISOString().split('T')[0]
});
```

### Helper Functions

```javascript
// Auto-suggest sunbed count
const suggestSunbedCount = (guestCount) => {
  if (guestCount <= 2) return 1;
  if (guestCount <= 4) return 2;
  if (guestCount <= 6) return 3;
  if (guestCount <= 8) return 4;
  return Math.ceil(guestCount / 2);
};

// Show helpful tip
const getTip = () => {
  const { guestCount, sunbedCount } = bookingData;
  const suggested = suggestSunbedCount(guestCount);
  
  if (sunbedCount < suggested) {
    return `💡 Për ${guestCount} persona, rekomandojmë ${suggested} shtretër`;
  }
  return `✅ ${sunbedCount} shtretër ${sunbedCount === 1 ? 'është' : 'janë'} të mjaftueshëm për ${guestCount} persona`;
};
```

### Submit Handler

```javascript
const handleBookingSubmit = async (e) => {
  e.preventDefault();
  
  const isBeach = venue.type === 'Beach';
  const isRestaurant = venue.type === 'Restaurant';
  
  if (isRestaurant) {
    // Open WhatsApp with prefilled message
    const venuePhone = venue.phone || '+355692000000';
    const message = `Përshëndetje! 👋\n\nDua të rezervoj tavolinë:\n\n🍽️ Restoranti: ${venue.name}\n👥 Persona: ${bookingData.guestCount}\n📅 Data: ${new Date(bookingData.date).toLocaleDateString('sq-AL')}\n🕐 Ora: ${bookingData.arrivalTime}\n\nEmri: ${bookingData.guestName}\nTelefoni: ${bookingData.guestPhone}\n\nFaleminderit!`;
    
    window.open(
      `https://wa.me/${venuePhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
    
    onClose();
  } else if (isBeach) {
    // Instant booking (mock data)
    // ... create reservation and navigate to success page
  }
};
```

---

## UI Components

### Guest Count Selector

```jsx
<div className="grid grid-cols-5 gap-2">
  {[
    { value: 2, label: '1-2' },
    { value: 4, label: '3-4' },
    { value: 6, label: '5-6' },
    { value: 8, label: '7-8' },
    { value: 10, label: '9+' }
  ].map(option => (
    <button
      type="button"
      onClick={() => {
        const newGuestCount = option.value;
        setBookingData({
          ...bookingData,
          guestCount: newGuestCount,
          sunbedCount: venue.type === 'Beach' ? suggestSunbedCount(newGuestCount) : 1
        });
      }}
      className={/* theme-aware styling */}
    >
      {option.label}
    </button>
  ))}
</div>
```

### Sunbed Count Selector (Conditional)

```jsx
{venue.type === 'Beach' && (
  <div>
    <label>Numri i shtretërve</label>
    <div className="grid grid-cols-6 gap-2">
      {[1, 2, 3, 4, 5, 6].map(count => (
        <button
          type="button"
          onClick={() => setBookingData({ ...bookingData, sunbedCount: count })}
          className={/* theme-aware styling */}
        >
          {count}
        </button>
      ))}
    </div>
    <p className="text-xs mt-2">{getTip()}</p>
  </div>
)}
```

### Summary Section (Conditional)

```jsx
<div className="rounded-lg p-4 border">
  <p className="text-xs uppercase">Përmbledhje</p>
  {venue.type === 'Beach' ? (
    <>
      <p>✅ Do të rezervojmë {bookingData.sunbedCount} shtretër pranë njëri-tjetrit</p>
      <p className="text-2xl">€{(selectedZone.basePrice * bookingData.sunbedCount).toFixed(2)}</p>
      <p className="text-xs">{bookingData.sunbedCount} shtretër × €{selectedZone.basePrice}</p>
    </>
  ) : (
    <>
      <p>📱 Do të dërgoni mesazh në WhatsApp për të konfirmuar rezervimin</p>
      <p>{bookingData.guestCount} persona • {bookingData.arrivalTime}</p>
    </>
  )}
</div>
```

### Submit Button (Dynamic Text)

```jsx
<button
  type="submit"
  disabled={submitting}
  className={/* theme-aware styling */}
>
  {submitting 
    ? 'Duke procesuar...' 
    : venue.type === 'Beach' 
      ? 'REZERVO TANI' 
      : 'DËRGO MESAZH'
  }
</button>
```

---

## Theme Support

### Day Mode
- Background: white
- Borders: zinc-300
- Text: zinc-950 primary, zinc-600 secondary
- Active buttons: zinc-950 bg, white text
- Inactive buttons: white bg, zinc-700 text

### Night Mode
- Background: zinc-950
- Borders: zinc-800
- Text: white primary, zinc-400 secondary
- Active buttons: XIXA green bg, zinc-950 text
- Inactive buttons: zinc-900 bg, zinc-400 text

---

## User Experience

### For Beach Bookings
1. Select guest count → Auto-suggests sunbed count
2. Adjust sunbed count if needed → See helpful tip
3. Choose arrival time → See expiration warning
4. Review summary → See total price
5. Tap "REZERVO TANI" → Instant confirmation

### For Restaurant Bookings
1. Select guest count → No sunbed selector shown
2. Choose arrival time → No expiration warning
3. Review summary → See WhatsApp info
4. Tap "DËRGO MESAZH" → Opens WhatsApp
5. Send message → Restaurant confirms

---

## Testing Checklist

### Beach Venues
- [x] Guest count selector works
- [x] Sunbed count selector shows
- [x] Auto-suggestion works
- [x] Tip updates correctly
- [x] Summary shows price
- [x] Button says "REZERVO TANI"
- [x] Instant booking works
- [x] Navigates to success page

### Restaurant Venues
- [x] Guest count selector works
- [x] Sunbed count selector hidden
- [x] Summary shows WhatsApp info
- [x] Button says "DËRGO MESAZH"
- [x] WhatsApp opens with message
- [x] Message includes all details
- [x] Bottom sheet closes after

### Theme Support
- [x] Day mode styling correct
- [x] Night mode styling correct
- [x] Transitions smooth
- [x] All buttons theme-aware

---

## Next Steps

### Backend Integration (Prof Kristi)
1. Implement instant booking API for beaches
2. Add auto-expiration background job
3. Update check-in endpoint to validate expiration
4. See: `BACKEND_INSTANT_BOOKING_API_NEEDED.md`

### Future Enhancements
- [ ] Date picker (currently defaults to today)
- [ ] Multiple date selection
- [ ] Special requests field
- [ ] Dietary preferences (restaurants)
- [ ] Table preference (window, outdoor, etc.)
- [ ] Party size validation
- [ ] Availability check before WhatsApp

---

## Files Modified

- `frontend/src/components/VenueBottomSheet.jsx` - Complete booking form

---

## Deployment

**Status:** ✅ Deployed  
**Commit:** 6db5ec1  
**Live URL:** https://riviera-os.vercel.app  
**Date:** March 1, 2026

---

## Summary

Restaurant booking form is now complete with WhatsApp integration. The form intelligently adapts based on venue type, showing different fields, summaries, and button text. Beach bookings use instant booking, while restaurant bookings open WhatsApp with a prefilled message. Both flows are theme-aware and provide a smooth user experience.

