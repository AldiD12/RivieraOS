# Context-Aware Routing - Complete Implementation Roadmap

**Date:** February 26, 2026  
**Status:** Ready to start coding  
**All APIs:** ✅ Live and tested

---

## 🎯 STRATEGIC DECISION: WHERE TO START?

### Option A: Start with Customer Features (SPOT + DISCOVER)
**Pros:**
- Immediate user value
- Can demo to customers right away
- Tests the core product vision
- More exciting to build

**Cons:**
- Admin controls come later
- Can't manage content/feedback until admin is built

---

### Option B: Start with Admin Features (Business + SuperAdmin)
**Pros:**
- Admins can manage content BEFORE customers see it
- Can populate Experience Deck content
- Can test zone override and feedback tracking
- Foundation ready before customer launch

**Cons:**
- No immediate user-facing value
- Less exciting to build first

---

## ✅ RECOMMENDED APPROACH: Hybrid (Smart Order)

**Strategy:** Build in layers, alternating between admin and customer features

**Why this works:**
1. Build admin tools JUST ENOUGH to populate data
2. Build customer features that consume that data
3. Iterate back to admin for advanced features

---

## 📅 3-WEEK IMPLEMENTATION PLAN

### WEEK 1: Foundation + SPOT MODE (Customer Priority)
**Goal:** Get core customer experience working

**Day 1-2: Foundation**
- Session Manager utility
- New API services (venueApi, feedbackApi, contentApi)
- Routing logic (detect QR vs browsing)

**Day 3-4: SPOT MODE Core**
- Refactor SpotPage to use SessionManager
- Add "Leave Venue" button
- Test session expiry (4 hours)

**Day 5: Review Shield**
- Update ReviewPage with negative feedback tracking
- Test 1-3 star → WhatsApp flow
- Test 4-5 star → Google Reviews flow

**Deliverable:** SPOT MODE works with session management + Review Shield

---

### WEEK 2: DISCOVER MODE (Map + Booking)
**Goal:** Off-site users can browse and book

**Day 1-2: Map Foundation**
- Install Mapbox dependencies
- Create DiscoveryPage with map
- Fetch venues and display markers
- Test map interaction

**Day 3-4: Venue Details + Booking**
- Build VenueBottomSheet component
- Show availability when venue tapped
- Connect to existing booking flow
- Test end-to-end booking

**Day 5: Polish + Testing**
- Add loading states
- Error handling
- Mobile responsiveness
- Test on real devices

**Deliverable:** Users can browse map, see venues, book sunbeds

---

### WEEK 3: Admin Controls + Experience Deck
**Goal:** Business tools + content engagement

**Day 1-2: Business Admin Controls**
- Zone override toggle UI
- Feedback Shield viewer
- Test with real feedback data

**Day 3: SuperAdmin Content Manager**
- Content CRUD interface
- Upload content (articles, photos)
- Test content display

**Day 4-5: Experience Deck**
- Build ExperienceDeck component
- Show content after order placed
- Polish animations and design

**Deliverable:** Complete system with admin tools + customer engagement

---

## 🏗️ DETAILED IMPLEMENTATION STEPS

### PHASE 1: Foundation (Days 1-2)

#### Step 1.1: Create SessionManager Utility
**File:** `frontend/src/utils/SessionManager.js`

**What it does:**
- Detects if user scanned QR code
- Manages 4-hour session expiry
- Handles manual "Leave Venue" action
- Persists session across page refreshes

**Code:** Already specified in `SESSION_MANAGER_UTILITY_SPEC.md`

---

#### Step 1.2: Create New API Services
**Files to create:**
- `frontend/src/services/venueApi.js` - Venue list + availability
- `frontend/src/services/feedbackApi.js` - Negative feedback
- `frontend/src/services/contentApi.js` - Experience Deck content

**Example: venueApi.js**
```javascript
const API_URL = import.meta.env.VITE_API_URL;

export const venueApi = {
  async getVenues() {
    const response = await fetch(`${API_URL}/api/public/venues`);
    if (!response.ok) throw new Error('Failed to fetch venues');
    return response.json();
  },

  async getVenueAvailability(venueId) {
    const response = await fetch(`${API_URL}/api/public/venues/${venueId}/availability`);
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  }
};
```

---

#### Step 1.3: Update App Routing Logic
**File:** `frontend/src/App.jsx`

**Add context-aware routing:**
```javascript
import { SessionManager } from './utils/SessionManager';

function App() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    // Check if user is in SPOT MODE or DISCOVER MODE
    const session = SessionManager.getSession();
    
    if (session && !session.manuallyExited) {
      setMode('SPOT'); // On-site at venue
    } else {
      setMode('DISCOVER'); // Browsing off-site
    }
  }, []);

  if (mode === 'SPOT') {
    return <SpotMode />;
  } else {
    return <DiscoverMode />;
  }
}
```

---

### PHASE 2: SPOT MODE (Days 3-5)

#### Step 2.1: Refactor SpotPage
**File:** `frontend/src/pages/SpotPage.jsx`

**Changes:**
1. Use SessionManager instead of localStorage
2. Add "Leave Venue" button
3. Check session expiry on mount
4. Redirect to DISCOVER MODE if session expired

**Key additions:**
```javascript
import { SessionManager } from '../utils/SessionManager';

export default function SpotPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const currentSession = SessionManager.getSession();
    
    if (!currentSession || currentSession.manuallyExited) {
      // Session expired or user left - redirect to DISCOVER MODE
      navigate('/discover');
      return;
    }

    setSession(currentSession);
  }, []);

  const handleLeaveVenue = () => {
    SessionManager.exitSession();
    navigate('/discover');
  };

  return (
    <div>
      {/* Existing SpotPage content */}
      
      <button onClick={handleLeaveVenue}>
        Leave Venue
      </button>
    </div>
  );
}
```

---

#### Step 2.2: Update ReviewPage (Review Shield)
**File:** `frontend/src/pages/ReviewPage.jsx`

**Add negative feedback tracking:**
```javascript
import { feedbackApi } from '../services/feedbackApi';

const handleSubmitReview = async (rating, comment) => {
  // If rating is 1-3 stars, save feedback FIRST
  if (rating <= 3) {
    try {
      await feedbackApi.submitFeedback({
        venueId: venue.id,
        rating,
        comment,
        unitCode: sessionStorage.getItem('unitCode'),
        guestName,
        guestPhone
      });
      
      console.log('Negative feedback saved for analytics');
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
    
    // Then redirect to WhatsApp (even if save fails)
    window.location.href = `https://wa.me/${venue.whatsappNumber}`;
  } else {
    // 4-5 stars: redirect to Google Reviews
    window.location.href = venue.googleReviewUrl;
  }
};
```

---

### PHASE 3: DISCOVER MODE (Days 6-10)

#### Step 3.1: Install Mapbox
```bash
npm install react-map-gl mapbox-gl
```

**Add to .env:**
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

---

#### Step 3.2: Create DiscoveryPage
**File:** `frontend/src/pages/DiscoveryPage.jsx`

**Features:**
- Mapbox map centered on Albanian Riviera
- Venue markers with availability badges
- Bottom sheet on venue tap
- Booking flow integration

**Structure:**
```javascript
import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import { venueApi } from '../services/venueApi';
import VenueBottomSheet from '../components/VenueBottomSheet';

export default function DiscoveryPage() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await venueApi.getVenues();
      setVenues(data);
    } catch (error) {
      console.error('Failed to load venues:', error);
    }
  };

  const handleVenueClick = async (venue) => {
    try {
      const availability = await venueApi.getVenueAvailability(venue.id);
      setSelectedVenue({ ...venue, availability });
    } catch (error) {
      console.error('Failed to load availability:', error);
    }
  };

  return (
    <div className="h-screen bg-stone-50">
      <Map
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 19.6,
          latitude: 40.1,
          zoom: 10
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        {venues.map(venue => (
          <Marker
            key={venue.id}
            longitude={venue.longitude}
            latitude={venue.latitude}
            onClick={() => handleVenueClick(venue)}
          >
            <VenueMarker venue={venue} />
          </Marker>
        ))}
      </Map>

      {selectedVenue && (
        <VenueBottomSheet
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
        />
      )}
    </div>
  );
}
```

---

#### Step 3.3: Create VenueBottomSheet Component
**File:** `frontend/src/components/VenueBottomSheet.jsx`

**Features:**
- Slide up from bottom
- Show venue details + availability
- "Book Now" button → booking flow

**Design:** Follow premium design system (luxury aesthetic)

---

#### Step 3.4: Connect to Booking Flow
**Use existing:** `frontend/src/services/reservationApi.js`

**Flow:**
1. User taps "Book Now" in bottom sheet
2. Show zone selection
3. Show unit picker
4. Show booking form
5. Create reservation
6. Show confirmation with booking code

---

### PHASE 4: Admin Controls (Days 11-15)

#### Step 4.1: Business Admin - Zone Override
**File:** `frontend/src/pages/AdminDashboard.jsx`

**Add new tab:** "Zone Availability"

**Features:**
- List all zones for venue
- Toggle switch for manual override
- Reason input field
- Override until datetime picker

**UI:**
```javascript
<div className="space-y-4">
  <h2 className="text-2xl font-bold text-white">Zone Availability</h2>
  
  {zones.map(zone => (
    <div key={zone.id} className="bg-zinc-900 p-6 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl text-white">{zone.name}</h3>
          <p className="text-zinc-400">
            {zone.availableUnits} / {zone.totalUnits} available
          </p>
        </div>
        
        <button
          onClick={() => handleOverride(zone.id)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Mark as Full
        </button>
      </div>
    </div>
  ))}
</div>
```

---

#### Step 4.2: Business Admin - Feedback Viewer
**File:** `frontend/src/pages/AdminDashboard.jsx`

**Add new tab:** "Feedback Shield"

**Features:**
- List all intercepted negative feedback
- Filter by date, status, rating
- Mark as resolved
- Add resolution notes

**Stats to show:**
- Total feedback intercepted
- This week / this month
- Average rating
- Resolution rate

---

#### Step 4.3: SuperAdmin - Content Manager
**File:** `frontend/src/pages/SuperAdminDashboard.jsx`

**Add new tab:** "Content Management"

**Features:**
- List all content
- Create new content (article, photo, video)
- Edit existing content
- Delete content
- Set sort order

**Form fields:**
- Title
- Description
- Content type (dropdown)
- Image URL
- Content URL
- Author
- Venue (optional)
- Published date
- Read time (minutes)

---

#### Step 4.4: Experience Deck Component
**File:** `frontend/src/components/ExperienceDeck.jsx`

**When to show:**
- After order placed in SPOT MODE
- While waiting for order

**Features:**
- Fetch content from API
- Display as cards
- Swipeable carousel
- Click to read full article

**Design:** Premium luxury aesthetic (Aman Resorts style)

---

## 🎨 DESIGN IMPLEMENTATION NOTES

### Customer Pages (SPOT + DISCOVER)
**Follow premium design system:**
- Warm off-white background (#FAFAF9)
- Cormorant Garamond for headings
- Inter for body text
- Subtle shadows
- Rounded corners (2rem)
- Luxurious animations (500ms+)

### Admin Pages
**Industrial minimalist:**
- Black background
- White text
- Sharp corners
- No shadows
- Dense layouts
- Fast and efficient

---

## 📦 DEPENDENCIES TO INSTALL

```bash
# Mapbox for map display
npm install react-map-gl mapbox-gl

# Date handling (if not already installed)
npm install date-fns

# Optional: Swiper for Experience Deck carousel
npm install swiper
```

---

## 🧪 TESTING CHECKLIST

### Week 1 Testing:
- [ ] QR code scan creates session
- [ ] Session persists across refreshes
- [ ] Session expires after 4 hours
- [ ] "Leave Venue" button works
- [ ] Negative feedback saved before WhatsApp redirect
- [ ] 4-5 star reviews go to Google

### Week 2 Testing:
- [ ] Map loads with venue markers
- [ ] Venue markers show availability count
- [ ] Tapping marker shows bottom sheet
- [ ] Bottom sheet shows correct availability
- [ ] Booking flow works end-to-end
- [ ] Booking code generated correctly

### Week 3 Testing:
- [ ] Zone override works
- [ ] Feedback viewer shows all feedback
- [ ] Content manager CRUD works
- [ ] Experience Deck shows content
- [ ] Content displays correctly after order

---

## 🚀 DEPLOYMENT STRATEGY

### Week 1: Deploy SPOT MODE
- Deploy to Vercel staging
- Test with real QR codes
- Get feedback from team

### Week 2: Deploy DISCOVER MODE
- Deploy map feature
- Test booking flow
- Get feedback from beta users

### Week 3: Deploy Admin + Experience Deck
- Deploy admin controls
- Train business admins
- Populate content
- Launch to production

---

## 📊 SUCCESS METRICS

### Customer Metrics:
- Session duration in SPOT MODE
- Negative feedback interception rate
- Booking conversion rate from map
- Experience Deck engagement rate

### Business Metrics:
- Zone override usage
- Feedback resolution time
- Content views
- Overall satisfaction

---

## 🎯 RECOMMENDED START ORDER

### Option 1: Customer-First (Recommended)
```
Day 1-2:  Foundation (SessionManager + API services)
Day 3-4:  SPOT MODE (refactor SpotPage)
Day 5:    Review Shield (negative feedback)
Day 6-7:  Map (DiscoveryPage + markers)
Day 8-9:  Booking (bottom sheet + flow)
Day 10:   Polish + testing
Day 11-12: Admin controls (zone override + feedback)
Day 13:   Content manager (SuperAdmin)
Day 14-15: Experience Deck + final polish
```

**Why this order:**
- Immediate user value
- Can demo to customers early
- Admin tools come when needed
- Natural progression

---

### Option 2: Admin-First (Alternative)
```
Day 1-2:  Foundation (SessionManager + API services)
Day 3-4:  Content manager (SuperAdmin)
Day 5:    Populate content
Day 6-7:  Admin controls (zone override + feedback)
Day 8-9:  SPOT MODE (with Experience Deck)
Day 10-11: Review Shield
Day 12-13: Map (DiscoveryPage)
Day 14-15: Booking flow + polish
```

**Why this order:**
- Content ready before customer launch
- Admin tools tested first
- More organized approach
- Less exciting initially

---

## ✅ MY RECOMMENDATION: Customer-First

**Start with SPOT MODE + DISCOVER MODE, then add admin tools.**

**Reasoning:**
1. Immediate user value
2. More exciting to build
3. Can demo to customers quickly
4. Admin tools can be added later
5. Natural progression

**Next step:** Start coding Day 1-2 (Foundation)

---

**Created:** February 26, 2026  
**Ready to start:** ✅ YES  
**First task:** Create SessionManager utility

Let's start coding! 🚀
