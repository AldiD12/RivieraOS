# Discovery Mode - Complete Deep Analysis

**Date:** February 26, 2026  
**Mode:** Off-Site Booking (Tourist at home/hotel)  
**Entry Point:** `https://riviera-os.vercel.app/`  
**Philosophy:** Luxury discovery experience → Instant booking → Real-time confirmation

---

## 🎯 WHAT IS DISCOVERY MODE?

Discovery Mode is the **off-site booking experience** for tourists who want to reserve sunbeds or tables BEFORE arriving at the venue. It's the first touchpoint in the customer journey.

**User Persona:**
- Tourist at hotel/home
- Planning beach day
- Wants to secure spot in advance
- Expects luxury experience
- Mobile-first (90% of traffic)

**Design Philosophy:**
- Ultra-luxury aesthetic (Aman Resorts, Soho House)
- Warm Mediterranean color palette (amber, stone)
- Cinematic 3D map experience
- Sophisticated neutrals, no bright colors
- Every pixel intentional

---

## 📱 COMPLETE USER FLOW

### Step 1: Landing on Discovery Page
```
URL: https://riviera-os.vercel.app/
Component: DiscoveryPage.jsx
```

**What Happens:**
1. Page loads with 3D Mapbox map
2. Custom warm Mediterranean style applied
3. Camera positioned at Albanian Riviera center (Dhërmi)
4. 45° pitch for cinematic depth
5. Venues loaded from API
6. Markers rendered on map

**Visual Experience:**
- Floating header with "Discover" title (Cormorant Garamond)
- Warm amber accents throughout
- Pulsing rings on available venues
- Venue count badge (top left)
- Smooth animations (500ms+ durations)

**API Call:**
```javascript
GET /api/public/Venues
Response: Array of venues with coordinates
```

**Data Structure:**
```javascript
{
  id: 1,
  name: "Hotel Coral Beach",
  type: "Beach",
  address: "Dhërmi, Albania",
  latitude: 40.1500,
  longitude: 19.6644,
  availableUnitsCount: 12,
  isActive: true,
  description: "Premium beach club...",
  phone: "+355692000000"
}
```

---

### Step 2: Exploring the Map

**Interactions:**
- Pinch to zoom
- Drag to pan
- Tap marker to select venue
- Smooth camera animations

**Marker States:**
1. **Available** (Green/Amber)
   - Pulsing amber ring
   - Amber-900 dot
   - Badge shows count
   - Hover scales 125%

2. **Full** (Gray)
   - No pulsing
   - Stone-400 dot
   - No badge
   - Disabled state

3. **Selected** (Highlighted)
   - Scale 150%
   - Ring effect (amber-500/30)
   - Camera flies to venue

**Camera Animation:**
```javascript
mapRef.current.flyTo({
  center: [venue.longitude, venue.latitude],
  zoom: 16,
  pitch: 60, // Dramatic 3D angle
  bearing: -20,
  duration: 1500, // 1.5 second smooth flight
  essential: true
});
```

---

### Step 3: Venue Selection

**What Happens:**
1. Tourist taps venue marker
2. Camera flies to venue (drone landing effect)
3. API call to fetch availability
4. Bottom sheet slides up from bottom
5. Haptic feedback (if supported)

**API Call:**
```javascript
GET /api/public/Venues/{id}/availability
Response: Detailed availability with zones
```

**Response Structure:**
```javascript
{
  venueId: 1,
  venueName: "Hotel Coral Beach",
  availableUnits: 12,
  totalUnits: 50,
  zones: [
    {
      id: 1,
      name: "VIP Front Row",
      zoneType: "VIP",
      availableUnits: 3,
      totalUnits: 10,
      basePrice: 25.00,
      description: "First row with sea view"
    },
    {
      id: 2,
      name: "Standard Beach",
      zoneType: "Standard",
      availableUnits: 9,
      totalUnits: 40,
      basePrice: 15.00,
      description: "Main beach area"
    }
  ]
}
```

---

### Step 4: Bottom Sheet Display

**Component:** `VenueBottomSheet.jsx`

**Layout:**
1. **Handle Bar** (top)
   - Drag indicator
   - Swipe down to close

2. **Venue Header**
   - Name (Cormorant Garamond, 5xl, light)
   - Type badge (uppercase, tracking-widest)
   - Address (stone-600)

3. **Availability Summary**
   - Green card if available
   - Shows total available units
   - Starting price
   - Pulsing green dot

4. **Zone Cards**
   - Each zone as clickable card
   - Zone name + type
   - Available/Total units
   - Price (Cormorant Garamond, 3xl)
   - Hover effects (lift + shadow)

5. **Description** (if exists)
   - About section
   - Venue details

6. **Action Buttons**
   - "Book Now" (primary, stone-900)
   - "Close" (secondary, border)

**Design Details:**
- Rounded-[2rem] corners
- Gradient backgrounds (white to stone-50/50)
- Subtle shadows (0_20px_60px)
- Backdrop blur
- Slide-up animation (500ms)

---

### Step 5: Zone Selection

**What Happens:**
1. Tourist taps zone card
2. Haptic feedback (light)
3. Booking form modal appears
4. Zone details pre-filled

**State Management:**
```javascript
const [selectedZone, setSelectedZone] = useState(null);
const [showBookingForm, setShowBookingForm] = useState(false);
```

---

### Step 6: Booking Form

**Modal Display:**
- Centered overlay
- Black/60 backdrop with blur
- White rounded card
- Fade-in animation (300ms)

**Form Fields:**
1. **Guest Name** (required)
   - Text input
   - Placeholder: "John Doe"
   - Validation: Not empty

2. **Phone Number** (required)
   - Tel input
   - Placeholder: "+355 69 123 4567"
   - Validation: Valid phone format

3. **Number of Guests** (required)
   - Number input
   - Min: 1, Max: 10
   - Default: 2

4. **Date** (required)
   - Date picker
   - Min: Today
   - Default: Today

**Form Validation:**
- All fields required
- Phone format check
- Guest count range
- Date not in past

---

### Step 7: Booking Submission

**What Happens:**
1. Tourist taps "Confirm Booking"
2. Form validation runs
3. Submit button disabled
4. Loading state shown
5. API call to create reservation
6. Haptic feedback (medium)

**API Call:**
```javascript
POST /api/public/Reservations
Content-Type: application/json

Request Body:
{
  venueId: 1,
  zoneId: 1,
  guestName: "John Doe",
  guestPhone: "+355691234567",
  guestCount: 2,
  reservationDate: "2026-02-27T00:00:00Z",
  reservationTime: "11:00",
  notes: "Booked via Discovery Mode"
}
```

**Response:**
```javascript
{
  bookingCode: "RIV-X-102",
  status: "Pending",
  venueId: 1,
  venueName: "Hotel Coral Beach",
  zoneName: "VIP Front Row",
  guestName: "John Doe",
  guestPhone: "+355691234567",
  guestCount: 2,
  reservationDate: "2026-02-27T00:00:00Z",
  reservationTime: "11:00",
  createdAt: "2026-02-26T14:30:00Z",
  message: "Booking created successfully"
}
```

---

### Step 8: Navigation to Status Page

**What Happens:**
1. Booking created successfully
2. Success haptic feedback
3. Bottom sheet closes
4. Navigate to BookingStatusPage
5. URL: `/booking/RIV-X-102`

**Navigation:**
```javascript
navigate(`/booking/${bookingCode}`);
```

---

### Step 9: Booking Status Page

**Component:** `BookingStatusPage.jsx`

**Initial State: Pending**

**Display:**
1. **Header**
   - "Rezervimi Yt" (Your Booking)
   - Booking code: #RIV-X-102

2. **Status Card**
   - Spinning loader (amber border)
   - "Duke pritur konfirmimin" (Waiting for confirmation)
   - "nga stafi... ⏳"

3. **Booking Details**
   - Venue name
   - Zone name
   - Guest count
   - Date and time

4. **WhatsApp Button**
   - Green (#25D366)
   - "KONFIRMO NË WHATSAPP"
   - Opens WhatsApp with pre-filled message

5. **Info Note**
   - "Mbaje këtë faqe të hapur" (Keep this page open)
   - "Do të njoftohesh kur rezervimi të aprovohet"

**SignalR Connection:**
```javascript
// Connects to real-time updates
await signalrService.connect();
await signalrService.joinBookingGroup(bookingCode);

// Listens for status changes
signalrService.onBookingStatusChanged((code, status, unitCode) => {
  if (code === bookingCode) {
    // Update UI in real-time
    setBooking(prev => ({ ...prev, status, unitCode }));
    
    // Haptic feedback
    if (status === 'Confirmed') {
      haptics.success();
    }
  }
});
```

---

### Step 10: WhatsApp Confirmation Flow

**Tourist Action:**
1. Taps "KONFIRMO NË WHATSAPP" button
2. WhatsApp opens with pre-filled message

**Pre-filled Message:**
```
Përshëndetje! 👋

Dua të konfirmoj rezervimin tim:

📋 Rezervimi: #RIV-X-102
🏖️ Vendi: Hotel Coral Beach
👥 Persona: 2
📍 Zona: VIP Front Row
🕐 Ora: 11:00
📅 Data: 27 Shkurt 2026

Faleminderit!
```

**What Happens:**
1. Tourist sends message to venue
2. Venue receives WhatsApp notification
3. Collector/Manager clicks approval link
4. Opens `/action/RIV-X-102` page
5. Collector approves booking
6. Backend updates status to "Reserved"
7. SignalR broadcasts update
8. Tourist's page auto-updates

---

### Step 11: Real-Time Status Update

**SignalR Event Received:**
```javascript
{
  bookingCode: "RIV-X-102",
  status: "Reserved",
  unitCode: "42"
}
```

**UI Updates:**
1. Spinner stops
2. Status changes to "I Konfirmuar ✅"
3. Green checkmark appears
4. Unit code displays in large emerald card
5. Haptic success feedback
6. New action buttons appear

**Confirmed State Display:**
1. **Status Badge**
   - Green checkmark icon
   - "I Konfirmuar ✅"

2. **Unit Code Card**
   - Emerald-50 background
   - Large unit code (5xl, Cormorant Garamond)
   - "Tregoja këtë kod djalit të plazhit"

3. **Action Buttons**
   - "SHIKO NË HARTË" (View on map)
   - "KONTAKTO PLAZHIN" (Contact venue)

---

### Step 12: Cancelled/Rejected Flow

**If Collector Rejects:**

**SignalR Event:**
```javascript
{
  bookingCode: "RIV-X-102",
  status: "Cancelled",
  unitCode: null
}
```

**UI Updates:**
1. **Apology Card** (red theme)
   - Red X icon
   - "Na vjen keq" (We're sorry)
   - "Nuk kemi vende të lira për momentin"

2. **Waitlist Button**
   - "📋 SHTOHEM NË WAITLIST"
   - Email capture form
   - Confirmation button

3. **Alternative Options**
   - "🗺️ Shiko Plazhe të Tjera"
   - "📞 Kontakto Plazhin"

**Waitlist Flow:**
```javascript
// Tourist enters email
setWaitlistEmail("john@example.com");

// Submits waitlist request
handleJoinWaitlist();

// Logs to console (backend Phase 3)
console.log('📋 Waitlist request:', {
  bookingCode: 'RIV-X-102',
  venueId: 1,
  email: 'john@example.com',
  zoneName: 'VIP Front Row',
  guestCount: 2
});

// Shows success message
alert('✅ Ju jeni shtuar në listën e pritjes!');
```

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Components

**1. DiscoveryPage.jsx** (Main entry point)
- Mapbox GL JS integration
- Custom warm Mediterranean style
- Venue markers with availability
- Camera animations
- State management

**2. VenueBottomSheet.jsx** (Venue details + booking)
- Slide-up modal
- Zone selection
- Booking form
- Form validation
- API integration

**3. BookingStatusPage.jsx** (Confirmation tracking)
- Real-time SignalR updates
- Status display
- WhatsApp integration
- Waitlist recovery
- Haptic feedback

### Backend APIs

**1. Venues API**
```
GET /api/public/Venues
- Returns all active venues with coordinates
- Includes availability count
- No authentication required

GET /api/public/Venues/{id}
- Returns detailed venue info
- Includes description, phone, etc.

GET /api/public/Venues/{id}/availability
- Returns zones with availability
- Includes pricing
- Real-time data
```

**2. Reservations API**
```
POST /api/public/Reservations
- Creates new booking
- Returns booking code
- Sets status to "Pending"
- No authentication required

GET /api/public/Reservations/{bookingCode}
- Returns booking status
- Includes venue and zone details
- Public access (no auth)

DELETE /api/public/Reservations/{bookingCode}
- Cancels booking
- Tourist can cancel own booking
```

**3. Collector Bookings API** (Staff only)
```
GET /api/collector/bookings/{bookingCode}
- Returns booking details for approval
- Requires Collector/Manager JWT

GET /api/collector/bookings/{bookingCode}/available-units
- Returns visual grid data
- Filtered to booking's zone

PUT /api/collector/bookings/{bookingCode}/approve
- Approves booking
- Assigns unit
- Updates status to "Reserved"
- Triggers SignalR event

PUT /api/collector/bookings/{bookingCode}/reject
- Rejects booking
- Updates status to "Cancelled"
- Triggers SignalR event
```

### Real-Time Communication

**SignalR Hub:** `BeachHub.cs`

**Groups:**
```csharp
// Tourist joins booking group
await Clients.Group($"booking_{bookingCode}")
  .SendAsync("BookingStatusChanged", bookingCode, status, unitCode);
```

**Events:**
1. `BookingStatusChanged`
   - Fired when collector approves/rejects
   - Payload: bookingCode, status, unitCode
   - Received by BookingStatusPage

2. `UnitStatusChanged`
   - Fired when unit status changes
   - Payload: unitId, status
   - Received by CollectorDashboard

---

## 🔄 COMPLETE DATA FLOW

### Booking Creation Flow

```
1. Tourist → DiscoveryPage
   ↓
2. Tap venue marker
   ↓
3. GET /api/public/Venues/{id}/availability
   ↓
4. VenueBottomSheet displays zones
   ↓
5. Tourist selects zone
   ↓
6. Booking form appears
   ↓
7. Tourist fills form
   ↓
8. POST /api/public/Reservations
   ↓
9. Backend creates Booking record
   - Status: "Pending"
   - BookingCode: "RIV-X-102"
   - ZoneId: 1
   - No unit assigned yet
   ↓
10. Response with booking code
   ↓
11. Navigate to /booking/RIV-X-102
   ↓
12. BookingStatusPage loads
   ↓
13. SignalR connects
   ↓
14. Joins booking group
   ↓
15. Displays "Pending" status
```

### Approval Flow (Collector Side)

```
1. Venue receives WhatsApp
   ↓
2. Collector clicks link
   ↓
3. Opens /action/RIV-X-102
   ↓
4. JWT validation (frontend + backend)
   ↓
5. GET /api/collector/bookings/RIV-X-102
   ↓
6. BookingActionPage displays details
   ↓
7. Collector taps "APPROVE"
   ↓
8. GET /api/collector/bookings/RIV-X-102/available-units
   ↓
9. Visual grid of green squares
   ↓
10. Collector taps Unit 42
   ↓
11. Confirmation prompt
   ↓
12. PUT /api/collector/bookings/RIV-X-102/approve
    Body: { unitId: 42 }
   ↓
13. Backend updates:
    - Booking.Status = "Reserved"
    - Booking.ZoneUnitId = 42
    - ZoneUnit.Status = "Reserved"
   ↓
14. SignalR broadcasts:
    BookingStatusChanged("RIV-X-102", "Reserved", "42")
   ↓
15. Tourist's page receives event
   ↓
16. UI updates to "I Konfirmuar"
   ↓
17. Unit code displays
   ↓
18. Haptic success feedback
```

### Check-In Flow (On-Site)

```
1. Guest arrives at beach
   ↓
2. Shows digital ticket (Unit 42)
   ↓
3. Collector opens CollectorDashboard
   ↓
4. Sees YELLOW card (Unit 42, Reserved)
   ↓
5. Taps yellow card once
   ↓
6. PUT /api/collector/units/42/status
   Body: { status: "Occupied" }
   ↓
7. Backend updates:
    - ZoneUnit.Status = "Occupied"
    - Booking.Status = "Active"
    - Booking.CheckInTime = now
   ↓
8. Card turns RED (Occupied)
   ↓
9. Guest enjoys beach
```

---

## 🎨 DESIGN SYSTEM COMPLIANCE

### Customer-Facing Pages (Luxury)

**DiscoveryPage:**
- ✅ Warm Mediterranean color palette
- ✅ Amber accents (#92400E)
- ✅ Cormorant Garamond for titles
- ✅ Inter for body text
- ✅ Cinematic 3D map
- ✅ Smooth animations (1500ms)
- ✅ Sophisticated neutrals
- ✅ No bright colors

**VenueBottomSheet:**
- ✅ Rounded-[2rem] corners
- ✅ Gradient backgrounds
- ✅ Subtle shadows
- ✅ Backdrop blur
- ✅ Generous whitespace
- ✅ Elegant typography
- ✅ Hover effects (lift + shadow)

**BookingStatusPage:**
- ✅ Stone-50 background
- ✅ Large elegant titles (5xl, light)
- ✅ Emerald theme for confirmed
- ✅ Red theme for cancelled
- ✅ Sophisticated status badges
- ✅ Luxury card design

### Staff-Facing Pages (Industrial)

**BookingActionPage:**
- ✅ Black/zinc color scheme
- ✅ High contrast (white on black)
- ✅ Sharp corners (rounded-lg, rounded-2xl)
- ✅ Large bold typography
- ✅ No decorative elements
- ✅ Fast and efficient
- ✅ Visual unit grid (green squares)

---

## 📊 STATE MANAGEMENT

### DiscoveryPage State

```javascript
const [venues, setVenues] = useState([]);
const [selectedVenue, setSelectedVenue] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [viewState, setViewState] = useState(RIVIERA_CENTER);
```

### VenueBottomSheet State

```javascript
const [selectedZone, setSelectedZone] = useState(null);
const [showBookingForm, setShowBookingForm] = useState(false);
const [bookingData, setBookingData] = useState({
  guestName: '',
  guestPhone: '',
  guestCount: 2,
  date: new Date().toISOString().split('T')[0]
});
const [submitting, setSubmitting] = useState(false);
```

### BookingStatusPage State

```javascript
const [booking, setBooking] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [showWaitlistPrompt, setShowWaitlistPrompt] = useState(false);
const [waitlistEmail, setWaitlistEmail] = useState('');
```

---

## 🔒 SECURITY CONSIDERATIONS

### Public Endpoints (No Auth)
- GET /api/public/Venues
- GET /api/public/Venues/{id}/availability
- POST /api/public/Reservations
- GET /api/public/Reservations/{bookingCode}

**Security Measures:**
- Rate limiting (prevent spam)
- Input validation
- Booking code is random (hard to guess)
- No sensitive data exposed

### Protected Endpoints (JWT Required)
- GET /api/collector/bookings/{bookingCode}
- PUT /api/collector/bookings/{bookingCode}/approve
- PUT /api/collector/bookings/{bookingCode}/reject

**Security Measures:**
- JWT validation (frontend + backend)
- Role check (Collector or Manager only)
- Venue access validation
- Tourist cannot approve own booking

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### Frontend

**1. Caching**
```javascript
// venueApi.js
this.cache = new Map();
this.cacheTimeout = 5 * 60 * 1000; // 5 minutes

// Cache venues list
this.cache.set('venues', { data, timestamp });

// Cache availability (shorter timeout)
this.cache.set(`availability-${venueId}`, { data, timestamp: 60000 });
```

**2. Lazy Loading**
- Map loads first
- Venues load after
- Availability loads on demand
- Bottom sheet renders only when needed

**3. Debouncing**
- Map pan/zoom events debounced
- Form input validation debounced

**4. Memoization**
- Venue markers memoized
- Callbacks wrapped in useCallback
- Expensive calculations cached

### Backend

**1. Database Indexing**
- Index on Bookings.BookingCode
- Index on ZoneUnits.Status
- Index on Venues.IsActive

**2. Query Optimization**
- Include related entities
- Select only needed fields
- Filter at database level

**3. Caching**
- Redis cache for venue list
- Cache availability for 1 minute
- Invalidate on status change

---

## 📱 MOBILE OPTIMIZATIONS

### Touch Interactions
- Large tap targets (44x44px minimum)
- Swipe gestures (bottom sheet)
- Pinch to zoom (map)
- Haptic feedback

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg
- Touch-friendly spacing
- Readable font sizes

### Performance
- Lazy load images
- Optimize map tiles
- Minimize JavaScript bundle
- Service worker caching

---

## 🧪 TESTING SCENARIOS

### Happy Path
1. ✅ Tourist opens DiscoveryPage
2. ✅ Venues load and display on map
3. ✅ Tourist taps venue marker
4. ✅ Bottom sheet slides up
5. ✅ Availability displays correctly
6. ✅ Tourist selects zone
7. ✅ Booking form appears
8. ✅ Tourist fills form
9. ✅ Booking submits successfully
10. ✅ Navigate to status page
11. ✅ SignalR connects
12. ✅ Status shows "Pending"
13. ✅ Tourist sends WhatsApp
14. ✅ Collector approves
15. ✅ Status updates to "Confirmed"
16. ✅ Unit code displays

### Error Scenarios
1. ⚠️ No internet connection
2. ⚠️ API timeout
3. ⚠️ Invalid booking code
4. ⚠️ Venue fully booked
5. ⚠️ Form validation errors
6. ⚠️ SignalR connection fails
7. ⚠️ Booking rejected by collector

### Edge Cases
1. 🔍 No venues have coordinates
2. 🔍 Venue has no zones
3. 🔍 All zones fully booked
4. 🔍 Tourist closes page during booking
5. 🔍 Multiple bookings same time
6. 🔍 Booking expires before approval

---

## 🎯 KEY METRICS

### User Experience
- Time to first venue display: < 2 seconds
- Map interaction smoothness: 60 FPS
- Booking form completion: < 1 minute
- Real-time update latency: < 500ms

### Business Metrics
- Booking conversion rate: Target 40%
- Average booking value: €20
- Cancellation rate: < 10%
- Approval time: < 5 minutes

---

## 🔮 FUTURE ENHANCEMENTS

### Phase 2
- [ ] Filters (price, amenities, rating)
- [ ] Search by venue name
- [ ] Favorite venues
- [ ] Booking history
- [ ] Multi-day bookings

### Phase 3
- [ ] Waitlist backend integration
- [ ] Email notifications
- [ ] SMS confirmations
- [ ] Payment integration
- [ ] Loyalty program

### Phase 4
- [ ] AI recommendations
- [ ] Dynamic pricing
- [ ] Group bookings
- [ ] Event reservations
- [ ] VIP concierge

---

## 📚 RELATED DOCUMENTATION

- `XIXA_BALKAN_REALITY_IMPLEMENTATION.md` - Approval flow details
- `COLLECTOR_DASHBOARD_COMPLETE_ANALYSIS.md` - Staff dashboard
- `premium-design-system.md` - Design guidelines
- `BACKEND_NEW_APIS_DEPLOYED_FEB26.md` - API documentation

---

**Status:** ✅ Fully Implemented  
**Last Updated:** February 26, 2026  
**Production URL:** https://riviera-os.vercel.app/  
**Design Quality:** $20K+ luxury standard
