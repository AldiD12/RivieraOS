# XIXA - Next Steps (March 4, 2026)

**Current Status:** Backend instant booking API deployed, frontend using mock data  
**Goal:** Integrate real API and complete XIXA booking flow

---

## 🎯 IMMEDIATE PRIORITY (Today - 2-3 hours)

### Task 1: Integrate Real Instant Booking API

**Status:** Backend ✅ Complete | Frontend ❌ Using Mock Data

**What needs to be done:**

#### 1.1 Update reservationApi.js (15 min)

**File:** `frontend/src/services/reservationApi.js`

**Add these methods:**
```javascript
createReservation: async (data) => {
  const response = await api.post('/api/public/Reservations', data);
  return response.data;
},

getReservationStatus: async (bookingCode) => {
  const response = await api.get(`/api/public/Reservations/${bookingCode}`);
  return response.data;
}
```

#### 1.2 Update VenueBottomSheet.jsx (30 min)

**File:** `frontend/src/components/VenueBottomSheet.jsx`

**Changes needed:**

1. **Remove mock data generation:**
```javascript
// DELETE THIS:
const mockBookingCode = `XIXA-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

localStorage.setItem('temp_booking', JSON.stringify({
  bookingCode: mockBookingCode,
  // ... mock data
}));
```

2. **Replace with real API call:**
```javascript
// ADD THIS:
const result = await reservationApi.createReservation({
  venueId: venue.id,
  zoneId: selectedZone.id,
  guestName: bookingData.guestName,
  guestPhone: bookingData.guestPhone,
  guestCount: bookingData.guestCount,
  sunbedCount: bookingData.sunbedCount,
  arrivalTime: bookingData.arrivalTime,
  reservationDate: bookingData.date,
  notes: 'Booked via XIXA Discovery'
});

navigate(`/success/${result.bookingCode}`);
```

3. **Add error handling:**
```javascript
catch (error) {
  if (error.response?.data?.error === 'INSUFFICIENT_CAPACITY') {
    const available = error.response.data.availableUnits;
    alert(`Na vjen keq, vetëm ${available} shtretër të lirë në këtë zonë.`);
  } else {
    alert('Rezervimi dështoi. Ju lutem provoni përsëri.');
  }
}
```

#### 1.3 Update BookingSuccessPage.jsx (30 min)

**File:** `frontend/src/pages/BookingSuccessPage.jsx`

**Changes needed:**

1. **Remove localStorage mock data:**
```javascript
// DELETE THIS:
const tempBooking = localStorage.getItem('temp_booking');
if (tempBooking) {
  setBooking(JSON.parse(tempBooking));
}
```

2. **Fetch real data from API:**
```javascript
// ADD THIS:
useEffect(() => {
  const fetchBooking = async () => {
    try {
      setLoading(true);
      const data = await reservationApi.getReservationStatus(bookingCode);
      setBooking(data);
    } catch (error) {
      setError('Rezervimi nuk u gjet');
    } finally {
      setLoading(false);
    }
  };
  
  fetchBooking();
}, [bookingCode]);
```

3. **Update data mapping:**
```javascript
// Backend returns different field names:
// unitCodes (array) instead of sunbedCodes
// expirationTime instead of calculating it
// unitsNeeded instead of sunbedCount

<p className="text-6xl font-mono font-bold">
  {booking.unitCodes?.join(', ') || 'N/A'}
</p>

<p>Shtretër: {booking.unitsNeeded}</p>

<p>Skadon në: {new Date(booking.expirationTime).toLocaleTimeString('sq-AL')}</p>
```

#### 1.4 Test End-to-End (30 min)

**Test scenarios:**

1. **Happy path:**
   - Select beach venue
   - Choose zone with availability
   - Fill form (2 guests, 1 sunbed, 11:30 arrival)
   - Submit → Should get real booking code
   - Success page → Should show real data from API

2. **Insufficient capacity:**
   - Select zone with only 1 sunbed available
   - Request 3 sunbeds
   - Should show error message with available count

3. **Multiple sunbeds:**
   - Request 3 sunbeds for 6 guests
   - Should get 3 unit codes (e.g., VIP-12, VIP-13, VIP-14)
   - Success page should show all codes

4. **Expiration time:**
   - Book with 11:30 arrival
   - Verify expiration shows 11:45 (15 min later)

---

## 🔧 SECONDARY TASKS (This Week)

### Task 2: Fix Expiration Countdown Timer (1 hour)

**File:** `frontend/src/pages/BookingSuccessPage.jsx`

**Issue:** Timer currently calculates from arrival time, but should use `expirationTime` from API

**Fix:**
```javascript
const expirationTime = new Date(booking.expirationTime);
const now = new Date();
const diff = expirationTime - now;

if (diff <= 0) {
  setTimeRemaining('EXPIRED');
} else {
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
}
```

### Task 3: Add Booking Status Check (1 hour)

**New Feature:** Allow users to check booking status by code

**Create:** `frontend/src/pages/BookingLookupPage.jsx`

```javascript
// Simple form:
// Input: Booking code
// Button: Check Status
// Result: Show booking details or "Not found"
```

### Task 4: Improve Error Messages (30 min)

**File:** `frontend/src/components/VenueBottomSheet.jsx`

**Current:** Generic error messages  
**Needed:** Specific, user-friendly Albanian messages

```javascript
const getErrorMessage = (error) => {
  if (error.response?.data?.error === 'INSUFFICIENT_CAPACITY') {
    const available = error.response.data.availableUnits;
    return `Vetëm ${available} shtretër të lirë. Ju lutem zgjidhni më pak shtretër ose provoni zonë tjetër.`;
  }
  
  if (error.response?.data?.error === 'Invalid arrivalTime format') {
    return 'Ora e arritjes është e pavlefshme. Ju lutem provoni përsëri.';
  }
  
  if (error.response?.status === 404) {
    return 'Vendi nuk u gjet. Ju lutem provoni përsëri.';
  }
  
  return 'Rezervimi dështoi. Ju lutem kontaktoni stafin.';
};
```

---

## 🎨 POLISH & UX (Next Week)

### Task 5: Loading States

**Add spinners/skeletons:**
- Booking form submission
- Success page data loading
- Zone availability loading

### Task 6: Success Animations

**Add celebrations:**
- Confetti on successful booking
- Haptic feedback on confirmation
- Smooth transitions

### Task 7: Share Booking

**Add share functionality:**
- Share booking code via WhatsApp
- Copy booking code to clipboard
- Add to calendar

---

## 🐛 KNOWN ISSUES TO FIX

### Issue 1: Date Picker Missing

**Current:** Date defaults to today  
**Needed:** Allow booking for future dates

**Priority:** Medium  
**Effort:** 1 hour

### Issue 2: No Booking Cancellation

**Current:** No way to cancel booking  
**Needed:** Cancel button on success page

**Priority:** High  
**Effort:** 2 hours (needs backend endpoint)

### Issue 3: No Booking History

**Current:** User can't see past bookings  
**Needed:** "My Bookings" page

**Priority:** Medium  
**Effort:** 3 hours

---

## 📊 TESTING CHECKLIST

### Before Deploying

- [ ] Remove all mock data from VenueBottomSheet
- [ ] Remove localStorage temp_booking logic
- [ ] Test with real backend API
- [ ] Verify error handling works
- [ ] Test insufficient capacity scenario
- [ ] Test group booking (3+ sunbeds)
- [ ] Verify expiration time is correct
- [ ] Test success page with real data
- [ ] Check mobile responsiveness
- [ ] Test day/night theme switching
- [ ] Verify WhatsApp flow for restaurants still works

### After Deploying

- [ ] Test on production URL
- [ ] Verify API calls go to correct backend
- [ ] Test with real venue data
- [ ] Monitor for errors in console
- [ ] Check booking codes are valid
- [ ] Verify collector can check in bookings

---

## 🚀 DEPLOYMENT PLAN

### Step 1: Local Testing (30 min)

```bash
# Make sure backend is running locally or use production backend
# Update .env.local if needed
VITE_API_BASE_URL=https://your-backend-url.com

# Test locally
npm run dev
```

### Step 2: Commit & Push (5 min)

```bash
git add -A
git commit -m "Integrate real instant booking API

- Remove mock data from VenueBottomSheet
- Add real API calls to reservationApi
- Update BookingSuccessPage to fetch real data
- Add error handling for insufficient capacity
- Fix expiration time display
- Test end-to-end booking flow"

git push origin main
```

### Step 3: Verify Deployment (10 min)

```bash
# Check Vercel deployment
# Test on https://riviera-os.vercel.app
# Verify API calls work
# Test booking flow
```

---

## 📝 IMPLEMENTATION ORDER

**Do in this exact order:**

1. ✅ Update `reservationApi.js` (add methods)
2. ✅ Update `VenueBottomSheet.jsx` (remove mock, add real API)
3. ✅ Update `BookingSuccessPage.jsx` (fetch real data)
4. ✅ Test locally with all scenarios
5. ✅ Fix any bugs found
6. ✅ Commit and push
7. ✅ Test on production
8. ✅ Monitor for errors

**Estimated time:** 2-3 hours total

---

## 🎯 SUCCESS CRITERIA

**You'll know it's working when:**

1. ✅ Booking form submits to real API
2. ✅ Success page shows real booking code from backend
3. ✅ Multiple unit codes display correctly (VIP-12, VIP-13, etc.)
4. ✅ Expiration time is accurate (arrival + 15 min)
5. ✅ Error messages show when capacity insufficient
6. ✅ No mock data or localStorage used
7. ✅ Collector can check in using booking code
8. ✅ Restaurant WhatsApp flow still works

---

## 🔗 RELATED DOCS

- `BACKEND_INSTANT_BOOKING_DEPLOYED_MAR4.md` - Backend API documentation
- `XIXA_INSTANT_BOOKING_FLOW.md` - Original flow specification
- `XIXA_GROUP_BOOKING_FEATURE.md` - Group booking requirements
- `RESTAURANT_BOOKING_WHATSAPP_COMPLETE.md` - Restaurant flow

---

## 💡 TIPS

1. **Start with reservationApi.js** - It's the foundation
2. **Test each change incrementally** - Don't change everything at once
3. **Keep console open** - Watch for API errors
4. **Use real venue data** - Test with actual venues from backend
5. **Check network tab** - Verify API requests/responses
6. **Test error cases** - Don't just test happy path

---

## ❓ QUESTIONS TO ANSWER

Before starting, make sure you know:

1. ✅ What's the backend API URL? (Check .env files)
2. ✅ Are there test venues with availability?
3. ✅ What happens if booking fails?
4. ✅ How do we handle network errors?
5. ✅ Should we show loading spinners?
6. ✅ What if user goes back during booking?

---

## 🎉 AFTER COMPLETION

Once instant booking is working:

1. **Celebrate!** 🎊 - This is a major milestone
2. **Test with real users** - Get feedback
3. **Monitor bookings** - Check if people are using it
4. **Fix bugs** - Address any issues quickly
5. **Plan next features** - Booking history, cancellation, etc.

---

**Ready to start? Let's integrate the real API!** 🚀

