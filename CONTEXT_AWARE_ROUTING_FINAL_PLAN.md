# Context-Aware Routing - Final Implementation Plan

**Date:** February 25, 2026  
**Status:** Ready to implement  
**Timeline:** 2-3 weeks total

---

## 🎯 EXECUTIVE SUMMARY

We're building ONE app that switches between TWO modes based on context:
- **SPOT MODE** (on-site, QR scanned) - Enhanced ordering + events
- **DISCOVER MODE** (off-site, browsing) - Map + venue discovery

**GREAT NEWS:** 90% of backend APIs already exist! Prof Kristi has been busy!

---

## ✅ WHAT ALREADY EXISTS

### Backend APIs (All Working!)
- ✅ Venue details
- ✅ Menu system
- ✅ Order placement
- ✅ Reservations
- ✅ Reviews
- ✅ Events (all endpoints!)
- ✅ Collector unit management

### Frontend Pages
- ✅ SpotPage (95% complete - needs mode switching)
- ✅ ReviewPage (working)
- ✅ CollectorDashboard (working)
- ✅ All admin dashboards (working)

---

## 🚨 CRITICAL MISSING PIECES (Do First!)

### 1. Negative Feedback Tracking ("Review Shield")
**Problem:** No proof of intercepted bad reviews  
**Solution:** `POST /api/public/Feedback` - Save before WhatsApp redirect  
**Time:** 2 hours  
**Value:** "I stopped 50 bad reviews for you" - data is power!

### 2. Manual Zone Override ("Owner Switch")
**Problem:** Automatic counting inaccurate (cash payments, walk-ins)  
**Solution:** `PUT /api/business/zones/{id}/availability` - Manual full/available toggle  
**Time:** 2-3 hours  
**Value:** Managers can mark zones as FULL for private events

---

## 🆕 NEW APIS NEEDED (8-11 hours total)

| Priority | Endpoint | Time | Purpose |
|----------|----------|------|---------|
| 🔴 Critical | `POST /api/public/Feedback` | 2h | Save negative feedback |
| 🔴 Critical | `PUT /api/business/zones/{id}/availability` | 2-3h | Manual zone override |
| 🟡 Phase 2 | `GET /api/public/Venues` | 1-2h | List all venues for map |
| 🟡 Phase 2 | `GET /api/public/Venues/{id}/availability` | 1h | Real-time availability |
| 🟢 Phase 3 | `GET /api/public/Content` | 2-3h | Experience deck content |

**Total:** 8-11 hours of backend work

---

## ⚠️ CRITICAL EDGE CASES & WARNINGS

### 1. The "4-Hour Session Trap"

**Scenario:** Tourist scans QR at 11 AM, leaves beach at 2 PM (3 hours), opens app at hotel

**The Risk:** Session hasn't expired yet (< 4 hours), so they see SPOT MODE (ordering menu) even though they're not at the beach anymore

**The Fix:** Manual "Leave Venue" button in header
- User clicks button → Session marked as `manuallyExited: true`
- Next time app opens → Checks flag → Shows DISCOVER mode
- Prevents "trapped in ordering mode" scenario

**Future Enhancement (Phase 4):**
- Add geo-fence check using browser Geolocation API
- Auto-exit when user is > 500m from venue
- Requires venue latitude/longitude in database

### 2. The "Mapbox Complexity Trap"

**Scenario:** You spend 5 days customizing Mapbox colors to perfectly match zinc-950 aesthetic

**The Risk:** Mapbox styling is complex and time-consuming. You can lose a week tweaking colors, shadows, and labels.

**The Fix:** Use standard `dark-v11` preset for MVP
- Mapbox Dark preset already matches sophisticated aesthetic
- Looks professional out of the box
- Saves 5+ days of development time
- Can customize later if needed (Phase 4)

**DON'T DO THIS (for MVP):**
```javascript
// ❌ Don't spend days on custom styling
style: {
  version: 8,
  sources: { ... },
  layers: [
    { id: 'background', paint: { 'background-color': '#18181b' } },
    { id: 'water', paint: { 'fill-color': '#27272a' } },
    // ... 50 more custom layers
  ]
}
```

**DO THIS (for MVP):**
```javascript
// ✅ Use standard Dark preset
style: 'mapbox://styles/mapbox/dark-v11'
```

### 3. The "Negative Feedback Data Loss"

**Scenario:** User gives 2-star review, gets redirected to WhatsApp, but data isn't saved

**The Risk:** At end of summer, you can't prove "I stopped 50 bad reviews for you"

**The Fix:** Save feedback BEFORE opening WhatsApp
```javascript
// 1. Save to database
const response = await fetch('/api/public/Feedback', {
  method: 'POST',
  body: JSON.stringify({ venueId, rating, comment, unitCode })
});

// 2. THEN open WhatsApp
if (response.ok) {
  window.open(`https://wa.me/${venuePhone}?text=${message}`);
}
```

### 4. The "Manual Zone Override Missing"

**Scenario:** VIP section is fully booked for private event, but automatic counting shows "Available"

**The Risk:** Tourists try to book, get rejected, bad experience

**The Fix:** Manual override switch for managers
```javascript
// Manager marks zone as FULL
PUT /api/business/zones/{id}/availability
{
  "isAvailable": false,
  "reason": "Private event",
  "overrideUntil": "2026-02-25T20:00:00Z"
}
```

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1: Critical Fixes + SPOT MODE

**Backend (Prof Kristi):**
- Day 1-2: Implement feedback tracking + zone override (4-5 hours)
- Day 3: Test and deploy

**Frontend (You):**
- Day 1-3: Transform SpotPage into SPOT MODE
  - Add session management (4-hour expiry)
  - Add Menu/Nightlife toggle
  - Integrate existing Events API
  - Test ordering + events flow
- Day 4-5: Polish and test

**Deliverable:** Working SPOT MODE with menu, ordering, and events

---

### Week 2: DISCOVER MODE - Day (Map)

**Backend (Prof Kristi):**
- Day 1: Implement venues list API (1-2 hours)
- Day 2: Implement availability API (1 hour)
- Day 3: Test and deploy

**Frontend (You):**
- Day 1-2: Set up Mapbox, create map component
- Day 3-4: Build bottom sheet with venue cards
- Day 5: Add Day/Night toggle
- Weekend: Polish and test

**Deliverable:** Working map with venue discovery

---

### Week 3: Experience Deck + Polish

**Backend (Prof Kristi):**
- Day 1: Implement content API (2-3 hours)
- Day 2: Add sample content to database
- Day 3: Test and deploy

**Frontend (You):**
- Day 1-2: Build experience deck component
- Day 3-4: Final polish and animations
- Day 5: End-to-end testing

**Deliverable:** Complete context-aware routing system

---

## 🎨 DESIGN REQUIREMENTS

### SPOT MODE (On-Site)
- Luxury "cash register" aesthetic
- Aman Resorts / Soho House vibes
- Cormorant Garamond headings
- Sophisticated neutrals (#FAFAF9, #92400E)
- 500ms+ transitions

### DISCOVER MODE (Off-Site)
- Luxury marketplace aesthetic
- Mapbox with custom styling
- Asymmetric venue cards
- Curated event feed (not social media)
- Massive whitespace

**Standard:** Would a design agency charge $20,000+ for this?

---

## 🔧 TECHNICAL ARCHITECTURE

### Session Management (With Manual Exit!)

**The Problem:** Tourist leaves beach at 2 PM (3 hours), opens app at hotel, still sees ordering menu (WRONG!)

**The Solution:** 4-hour expiry + manual "Leave Venue" button

```javascript
// SessionManager.js - Utility for session management
export const SessionManager = {
  // Start a new session
  startSession: (venueId, unitId) => {
    const session = {
      venueId,
      unitId,
      startTime: Date.now(),
      manuallyExited: false
    };
    localStorage.setItem('riviera_session', JSON.stringify(session));
    return session;
  },

  // Get current session
  getSession: () => {
    const sessionData = localStorage.getItem('riviera_session');
    if (!sessionData) return null;
    
    try {
      return JSON.parse(sessionData);
    } catch {
      return null;
    }
  },

  // Check if session is active (< 4 hours and not manually exited)
  isSessionActive: () => {
    const session = SessionManager.getSession();
    if (!session) return false;
    
    // Check manual exit flag
    if (session.manuallyExited) return false;
    
    // Check 4-hour expiry
    const fourHours = 4 * 60 * 60 * 1000;
    const elapsed = Date.now() - session.startTime;
    return elapsed < fourHours;
  },

  // Manual exit (user clicks "Leave Venue")
  exitSession: () => {
    const session = SessionManager.getSession();
    if (session) {
      session.manuallyExited = true;
      localStorage.setItem('riviera_session', JSON.stringify(session));
    }
  },

  // Clear session completely
  clearSession: () => {
    localStorage.removeItem('riviera_session');
  }
};
```

**Main App Logic:**
```javascript
// App.jsx or main routing component
import { SessionManager } from './utils/SessionManager';

function App() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('DISCOVER');

  useEffect(() => {
    // Check URL for QR params
    const venueId = searchParams.get('v');
    const unitId = searchParams.get('u');

    if (venueId && unitId) {
      // QR code scanned - start new session
      SessionManager.startSession(venueId, unitId);
      setMode('SPOT');
    } else {
      // No QR params - check for active session
      if (SessionManager.isSessionActive()) {
        setMode('SPOT');
      } else {
        setMode('DISCOVER');
      }
    }
  }, [searchParams]);

  const handleLeaveVenue = () => {
    SessionManager.exitSession();
    setMode('DISCOVER');
  };

  return mode === 'SPOT' 
    ? <SpotMode onLeaveVenue={handleLeaveVenue} />
    : <DiscoverMode />;
}
```

**CRITICAL FIX:** Add "Leave Venue" button in SPOT MODE header:
```jsx
// SpotMode.jsx
function SpotMode({ onLeaveVenue }) {
  const session = SessionManager.getSession();

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <header className="bg-gradient-to-br from-white to-stone-50/50 border-b border-stone-200/40">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-4 h-4 text-[#92400E]" />
              <p className="text-xs tracking-widest uppercase text-[#78716C]">
                Unit {session?.unitId}
              </p>
            </div>
            <h1 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#1C1917]">
              {venue.name}
            </h1>
          </div>
          
          {/* NEW: Manual exit button */}
          <button
            onClick={onLeaveVenue}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#78716C] hover:text-[#1C1917] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Leave Venue
          </button>
        </div>
      </header>

      {/* Menu/Nightlife toggle and content */}
      <MenuNightlifeToggle />
    </div>
  );
}
```

**Why This Matters:**
- Tourist leaves beach at 2 PM (3 hours) → Still in session
- Opens app at hotel → Sees ordering menu (WRONG!)
- Clicks "Leave Venue" → Switches to DISCOVER mode (CORRECT!)
- Prevents "trapped in ordering mode" scenario

**Future Enhancement (Phase 4):**
- Add geo-fence check using browser Geolocation API
- Auto-exit when user is > 500m from venue
- Requires venue latitude/longitude in database

---

## 📊 FRONTEND COMPONENTS TO BUILD

### Phase 1: SPOT MODE
- [ ] SpotMode.jsx (refactor from SpotPage)
- [ ] SessionManager.js (4-hour expiry + manual exit)
- [ ] MenuNightlifeToggle.jsx (luxury styled)
- [ ] EventCard.jsx (for nightlife tab)
- [ ] FeedbackModal.jsx (negative review shield)
- [ ] Add "Leave Venue" button to header

### Phase 2: DISCOVER MODE - Day
- [ ] DiscoverMode.jsx (main component)
- [ ] VenueMap.jsx (Mapbox integration - use Dark preset!)
- [ ] VenueBottomSheet.jsx (swipeable list)
- [ ] VenueCard.jsx (luxury styled)
- [ ] DayNightToggle.jsx

**MAPBOX STYLING - MVP APPROACH:**
```javascript
// VenueMap.jsx
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11', // ✅ Use standard Dark preset
  center: [19.6, 40.1], // Albanian Riviera
  zoom: 10
});

// DON'T over-customize colors for MVP
// DON'T spend 5 days tweaking map styles
// Standard Dark preset matches zinc-950 aesthetic perfectly
```

**Mapbox Setup Checklist:**
1. Create Mapbox account (free tier: 50k loads/month)
2. Get access token
3. Add to `.env`: `VITE_MAPBOX_TOKEN=pk.xxx`
4. Install: `npm install mapbox-gl`
5. Use `dark-v11` style (matches design system)
6. Add custom markers for venues (green/red dots)

**Custom Markers:**
```javascript
// Green dot for available venues
venues.forEach(venue => {
  const el = document.createElement('div');
  el.className = 'venue-marker';
  el.style.backgroundColor = venue.hasAvailability ? '#10b981' : '#ef4444';
  el.style.width = '12px';
  el.style.height = '12px';
  el.style.borderRadius = '50%';
  el.style.border = '2px solid white';
  el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

  new mapboxgl.Marker(el)
    .setLngLat([venue.longitude, venue.latitude])
    .addTo(map);
});
```

### Phase 3: DISCOVER MODE - Night
- [ ] NightlifeFeed.jsx (vertical scroll)
- [ ] EventPoster.jsx (large format)
- [ ] VIPTableBooking.jsx (modal)

### Phase 4: Experience Deck
- [ ] ExperienceDeck.jsx (post-order content)
- [ ] ContentCard.jsx (articles, photos, tips)

---

## 🧪 TESTING CHECKLIST

### SPOT MODE
- [ ] QR code scan starts session
- [ ] Session persists for 4 hours
- [ ] Session expires after 4 hours
- [ ] Menu tab shows categories and products
- [ ] Nightlife tab shows tonight's events
- [ ] Order placement works
- [ ] Negative feedback saves before WhatsApp
- [ ] Review submission works

### DISCOVER MODE
- [ ] Opens when no QR params and no session
- [ ] Day/Night toggle switches views
- [ ] Map shows all venues with pins
- [ ] Pins show availability (green/red)
- [ ] Bottom sheet displays venue cards
- [ ] Venue cards show real-time availability
- [ ] Nightlife feed shows events
- [ ] VIP table booking works

### Session Management
- [ ] Session starts on QR scan
- [ ] Session persists across page refreshes
- [ ] Session expires after 4 hours
- [ ] Expired session redirects to DISCOVER
- [ ] Manual "Leave Venue" button works
- [ ] Manual exit flag prevents re-entering SPOT mode
- [ ] Test scenario: Leave beach at 2 PM, open app at hotel (should show DISCOVER)
- [ ] Test scenario: Click "Leave Venue", refresh page (should stay in DISCOVER)

---

## 🚀 DEPLOYMENT STRATEGY

### Week 1 Deployment
- Deploy SPOT MODE to Vercel
- Test with real QR codes
- Verify ordering + events work
- Monitor for errors

### Week 2 Deployment
- Deploy DISCOVER MODE to Vercel
- Test map on mobile devices
- Verify venue discovery works
- Monitor performance

### Week 3 Deployment
- Deploy complete system
- Full end-to-end testing
- Performance optimization
- Launch to production

---

## 📈 SUCCESS METRICS

### Technical
- [ ] Session management works 100%
- [ ] Mode switching is instant (< 100ms)
- [ ] Map loads in < 2 seconds
- [ ] All APIs respond in < 500ms
- [ ] No JavaScript errors

### Business
- [ ] Negative feedback tracking captures all bad reviews
- [ ] Manual zone override used by managers
- [ ] Event bookings increase
- [ ] Venue discovery drives reservations

### Design
- [ ] Luxury score: 95/100+
- [ ] Passes $20K design test
- [ ] Mobile-first responsive
- [ ] Smooth animations (500ms+)

---

## 🎯 NEXT STEPS

### Immediate (Today)
1. ✅ Review this plan
2. ✅ Confirm timeline with Prof Kristi
3. ✅ Set up Mapbox account
4. ✅ Start Phase 1 frontend work

### This Week
1. Prof Kristi: Implement critical APIs (feedback + zone override)
2. You: Build SPOT MODE with session management
3. Test ordering + events integration
4. Deploy to Vercel

### Next Week
1. Prof Kristi: Implement venues list + availability APIs
2. You: Build DISCOVER MODE map interface
3. Test venue discovery
4. Deploy to Vercel

---

## 💡 KEY INSIGHTS

### What We Learned
1. **90% of APIs already exist** - Prof Kristi has been building ahead!
2. **Events system is complete** - No need to build from scratch
3. **Two critical gaps** - Feedback tracking and zone override
4. **Frontend can start immediately** - Phase 1 needs no new APIs

### What Changed
1. **Removed "Call Waiter" button** - Not needed per user feedback
2. **Events already exist** - Removed from "to build" list
3. **Added critical missing pieces** - Feedback tracking and zone override
4. **Simplified timeline** - From 3 weeks to 2-3 weeks

### What's Next
1. **Start Phase 1** - Transform SpotPage into SPOT MODE
2. **Prof Kristi builds critical APIs** - Feedback + zone override
3. **Test and iterate** - Get feedback from real users
4. **Launch incrementally** - Phase by phase deployment

---

**Created:** February 25, 2026  
**Status:** Ready to implement  
**Confidence:** HIGH - Most APIs exist, clear plan, achievable timeline

**Let's build this! 🚀**
