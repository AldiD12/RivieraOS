# Testing Guide: Phase 1 & 2 Complete

**Deployed:** February 26, 2026  
**URL:** https://riviera-os.vercel.app  
**Status:** ✅ LIVE - Ready for Testing

---

## 🎯 WHAT'S READY TO TEST

### Phase 1: SPOT MODE ✅
1. Session management (QR scan → 4-hour session)
2. "Leave Venue" button (manual exit)
3. Cart sync with venue context
4. WhatsApp links (order + booking + feedback)
5. Review Shield (negative feedback protection)
6. Haptic feedback (all interactions)

### Phase 2: DISCOVER MODE ✅
1. Interactive map with venue markers
2. Venue details bottom sheet
3. Availability display
4. Complete booking flow
5. WhatsApp integration

---

## 📱 TESTING CHECKLIST

### Test 1: DISCOVER MODE - Browse Venues
**URL:** https://riviera-os.vercel.app

**Steps:**
1. Open app on mobile (no QR scan)
2. Map should load showing Albanian Riviera
3. See venue markers with availability badges
4. Tap a venue marker
5. Bottom sheet slides up with venue details
6. View zones and pricing
7. Tap "Close" to dismiss

**Expected:**
- ✅ Map loads smoothly
- ✅ Markers show availability count (green badges)
- ✅ Bottom sheet has luxury design
- ✅ Zones display with prices
- ✅ Smooth animations

---

### Test 2: DISCOVER MODE - Book Sunbed
**URL:** https://riviera-os.vercel.app

**Steps:**
1. Open app
2. Tap venue marker
3. Bottom sheet opens
4. Tap a zone card (e.g., "VIP Section")
5. Booking form modal opens
6. Fill in:
   - Name: "Test User"
   - Phone: "+355 69 123 4567"
   - Guests: 2
   - Date: Today
7. Tap "Confirm Booking"
8. WhatsApp should open automatically
9. See pre-filled message with booking code

**Expected:**
- ✅ Form validation works
- ✅ Haptic feedback on submit (if supported)
- ✅ WhatsApp opens with message
- ✅ Message contains booking code
- ✅ Can send message to save link

**Note:** Booking will fail if backend API not ready - that's OK for now

---

### Test 3: SPOT MODE - QR Scan Session
**URL:** https://riviera-os.vercel.app/spot?v=1&u=42

**Steps:**
1. Open URL with QR parameters
2. Session should start automatically
3. See venue name in header
4. See "Leave Venue" button
5. Add items to cart (if menu available)
6. Tap "Leave Venue"
7. Session ends
8. Redirected to discovery page

**Expected:**
- ✅ Session starts on QR scan
- ✅ Venue context stored
- ✅ "Leave Venue" button visible
- ✅ Manual exit works
- ✅ Returns to discovery mode

---

### Test 4: Review Shield - Negative Feedback
**URL:** https://riviera-os.vercel.app/review?v=1

**Steps:**
1. Open review page
2. See venue name
3. Tap 2 stars (negative rating)
4. Feel haptic feedback (if supported)
5. Success screen shows
6. Phone prompt appears
7. Enter: "+355 69 123 4567"
8. WhatsApp opens
9. See apology message with feedback link

**Expected:**
- ✅ Rating ≤ 3 triggers Review Shield
- ✅ Haptic feedback on tap
- ✅ Phone prompt appears
- ✅ WhatsApp opens with message
- ✅ Feedback saved to database (check backend)

---

### Test 5: Review Shield - Positive Rating
**URL:** https://riviera-os.vercel.app/review?v=1

**Steps:**
1. Open review page
2. Tap 5 stars (positive rating)
3. Feel haptic feedback
4. Success screen shows
5. Google Maps opens
6. See venue location

**Expected:**
- ✅ Rating ≥ 4 goes to Google Maps
- ✅ Haptic feedback works
- ✅ Google Maps opens
- ✅ Location pre-filled

---

### Test 6: WhatsApp Links - Order Flow
**URL:** https://riviera-os.vercel.app/spot?v=1&u=42

**Steps:**
1. Open spot page with QR params
2. Add items to cart (if menu available)
3. Place order
4. Success screen shows
5. Phone prompt appears
6. Enter phone number
7. WhatsApp opens
8. See order confirmation message

**Expected:**
- ✅ Order placed successfully
- ✅ Phone prompt appears
- ✅ WhatsApp opens
- ✅ Message contains order number
- ✅ Link to track order

**Note:** Requires menu API to be working

---

### Test 7: Haptic Feedback
**Device:** iPhone or Android with vibration

**Steps:**
1. Add item to cart → Light vibration (10ms)
2. Tap rating star → Medium vibration (50ms)
3. Submit order → Success pattern (50-100-50ms)
4. Error occurs → Error pattern (200-100-200ms)

**Expected:**
- ✅ Different vibration patterns
- ✅ Confirms actions in loud environments
- ✅ Gracefully degrades if unsupported

---

### Test 8: Session Persistence
**URL:** https://riviera-os.vercel.app/spot?v=1&u=42

**Steps:**
1. Open spot page with QR params
2. Session starts
3. Refresh browser
4. Session should persist
5. Still in SPOT MODE
6. Venue context maintained
7. Wait 4 hours (or change system time)
8. Session expires
9. Returns to DISCOVER MODE

**Expected:**
- ✅ Session persists across refreshes
- ✅ Expires after 4 hours
- ✅ Manual exit works
- ✅ Returns to discovery mode

---

### Test 9: Mobile Responsive
**Devices:** iPhone, Android, iPad

**Steps:**
1. Test on different screen sizes
2. Map should be full screen
3. Bottom sheet should be scrollable
4. Buttons should be touch-friendly (44x44px)
5. Text should be readable
6. No horizontal scroll

**Expected:**
- ✅ Responsive on all devices
- ✅ Touch targets large enough
- ✅ No layout issues
- ✅ Smooth animations

---

### Test 10: Error Handling
**URL:** https://riviera-os.vercel.app

**Steps:**
1. Turn off WiFi/data
2. Open app
3. See error message
4. Tap "Try Again"
5. Turn on WiFi
6. Map loads successfully

**Expected:**
- ✅ Error message shown
- ✅ Retry button works
- ✅ Graceful degradation
- ✅ No crashes

---

## 🎨 DESIGN QUALITY CHECKS

### Premium Design Verification
**URL:** https://riviera-os.vercel.app

**Check:**
- [ ] Cormorant Garamond font loads (headings)
- [ ] Inter font loads (body text)
- [ ] Colors are sophisticated neutrals (no bright orange)
- [ ] Shadows are subtle (not harsh)
- [ ] Animations are smooth (500ms+)
- [ ] Rounded corners are organic (2rem)
- [ ] Whitespace is generous
- [ ] Typography is elegant and refined
- [ ] Feels like $20K+ design

**Compare to:**
- amanresorts.com
- sohohouse.com
- parkhyatt.com

**Question:** Would a design agency charge $20,000+ for this?

---

## 🚨 KNOWN LIMITATIONS

### Backend Dependencies
Some features require backend APIs that may not be deployed yet:

1. **Venue List API** - `GET /api/public/Venues`
   - Status: May not be deployed
   - Impact: Map may show empty or mock data
   - Workaround: venueApi uses mock data if API fails

2. **Availability API** - `GET /api/public/Venues/{id}/availability`
   - Status: May not be deployed
   - Impact: Bottom sheet may show "No availability"
   - Workaround: Shows error gracefully

3. **Feedback API** - `POST /api/public/Feedback`
   - Status: May not be deployed
   - Impact: Review Shield may fail silently
   - Workaround: Queues feedback in localStorage for retry

4. **Reservation API** - `POST /api/public/Reservations`
   - Status: Should be working (existing)
   - Impact: Booking flow should work
   - Workaround: Shows error if fails

### WhatsApp Links
- WhatsApp links work on mobile only
- Desktop will open WhatsApp Web
- Requires phone number with country code

### Haptic Feedback
- Only works on devices with vibration support
- iOS Safari: Full support
- Android Chrome: Full support
- Desktop: No support (gracefully degrades)

---

## 📊 SUCCESS METRICS

### What to Measure:
1. **Map Load Time** - Should be < 3 seconds
2. **Marker Click Response** - Should be instant
3. **Bottom Sheet Animation** - Should be smooth (60fps)
4. **Booking Form Submission** - Should be < 2 seconds
5. **WhatsApp Link Open** - Should be instant

### Expected Results:
- ✅ Map loads in 1-2 seconds
- ✅ Animations are smooth
- ✅ No lag or jank
- ✅ Touch responses are instant
- ✅ WhatsApp opens immediately

---

## 🐛 BUG REPORTING

If you find issues, please note:

1. **Device:** iPhone 14 Pro / Android Pixel 7 / etc.
2. **Browser:** Safari / Chrome / etc.
3. **URL:** Exact URL where issue occurred
4. **Steps:** What you did before the issue
5. **Expected:** What should have happened
6. **Actual:** What actually happened
7. **Screenshot:** If possible

**Example:**
```
Device: iPhone 14 Pro
Browser: Safari 17
URL: https://riviera-os.vercel.app
Steps: Tapped venue marker, bottom sheet opened
Expected: Smooth slide-up animation
Actual: Bottom sheet jumped into place
Screenshot: [attached]
```

---

## 🎯 PRIORITY TESTS

### Must Test (Critical):
1. ✅ Map loads and shows venues
2. ✅ Venue markers are clickable
3. ✅ Bottom sheet opens
4. ✅ Booking form works
5. ✅ WhatsApp links open

### Should Test (Important):
1. ✅ Review Shield (negative ratings)
2. ✅ Session management
3. ✅ Haptic feedback
4. ✅ Error handling
5. ✅ Mobile responsive

### Nice to Test (Optional):
1. ✅ Design quality
2. ✅ Animation smoothness
3. ✅ Typography rendering
4. ✅ Color accuracy
5. ✅ Performance metrics

---

## 📱 RECOMMENDED TEST DEVICES

### Minimum:
- iPhone (Safari)
- Android (Chrome)

### Ideal:
- iPhone 14 Pro (Safari)
- Samsung Galaxy S23 (Chrome)
- iPad Pro (Safari)
- Google Pixel 7 (Chrome)

### Desktop (Optional):
- MacBook (Chrome/Safari)
- Windows (Chrome/Edge)

---

## 🚀 DEPLOYMENT STATUS

**Vercel Deployment:**
- Status: ✅ LIVE
- URL: https://riviera-os.vercel.app
- Build: Successful (288.16 KB gzipped)
- Environment: Production
- API: https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io

**Features Deployed:**
- ✅ Phase 1: SPOT MODE (Days 1-3)
- ✅ Phase 2: DISCOVER MODE (Day 4)
- ✅ WhatsApp links
- ✅ Review Shield
- ✅ Haptic feedback
- ✅ Session management
- ✅ Interactive map
- ✅ Booking flow

---

## 📝 TESTING NOTES

### What Works:
- Map rendering
- Venue markers
- Bottom sheet UI
- Booking form UI
- WhatsApp link generation
- Review Shield logic
- Haptic feedback
- Session management
- Premium design

### What May Not Work (Backend Dependent):
- Actual venue data (may be mock)
- Real availability data
- Booking submission (API may not be ready)
- Feedback submission (API may not be ready)
- Order placement (requires menu API)

### What to Focus On:
1. **UI/UX Quality** - Does it feel premium?
2. **Animations** - Are they smooth?
3. **Mobile Experience** - Is it touch-friendly?
4. **WhatsApp Links** - Do they open correctly?
5. **Design System** - Does it match $20K+ quality?

---

**Ready to test!** 🚀

Open https://riviera-os.vercel.app on your mobile device and start exploring!
