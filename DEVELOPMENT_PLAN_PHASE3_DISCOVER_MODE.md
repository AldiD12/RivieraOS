# Phase 3: DISCOVER MODE - Detailed Development Plan

**Duration:** 4-5 days  
**Goal:** Build map with venue markers + booking flow  
**Depends on:** Phase 2 complete

---

## STEP 1: Install Mapbox Dependencies (10 minutes)

**Command:**
```bash
cd frontend
npm install react-map-gl mapbox-gl
```

**Add to `.env`:**
```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

**Get Mapbox Token:**
1. Go to https://account.mapbox.com/
2. Create account (free tier)
3. Copy default public token
4. Paste into `.env`

---

## STEP 2: Create DiscoveryPage with Map (3 hours)

**File:** `frontend/src/pages/DiscoveryPage.jsx`

**Implementation:**
```javascript
import { useState, useEffect } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { venueApi } from '../services/venueApi';
import VenueBottomSheet from '../components/VenueBottomSheet';

export default function DiscoveryPage() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await venueApi.getVenues();
      setVenues(data);
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50">
        <p className="text-lg text-stone-600">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="h-screen relative">
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

## STEP 3: Create VenueMarker Component (1 hour)

**File:** `frontend/src/components/VenueMarker.jsx`

**Purpose:** Custom marker with availability badge

**Implementation:**
```javascript
export default function VenueMarker({ venue }) {
  return (
    <div className="relative cursor-pointer group">
      {/* Marker Pin */}
      <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
        <span className="text-white text-xl">🏖️</span>
      </div>
      
      {/* Availability Badge */}
      {venue.availableUnitsCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {venue.availableUnitsCount}
        </div>
      )}
      
      {/* Venue Name Tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-3 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        <p className="text-sm font-medium text-stone-900">{venue.name}</p>
        <p className="text-xs text-stone-600">
          {venue.availableUnitsCount} available
        </p>
      </div>
    </div>
  );
}
```

---

## STEP 4: Create VenueBottomSheet Component (2 hours)

**File:** `frontend/src/components/VenueBottomSheet.jsx`

**Purpose:** Slide-up sheet with venue details

**Implementation:**
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VenueBottomSheet({ venue, onClose }) {
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-2xl p-8 max-h-[70vh] overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
      >
        ✕
      </button>

      {/* Venue Header */}
      <h2 className="text-4xl font-light text-stone-900 mb-2">
        {venue.name}
      </h2>
      <p className="text-sm text-stone-500 uppercase tracking-widest mb-6">
        {venue.type}
      </p>

      {/* Availability Summary */}
      <div className="bg-stone-50 rounded-2xl p-6 mb-6">
        <p className="text-lg text-stone-600 mb-2">
          {venue.availability?.availableUnits} sunbeds available
        </p>
        <p className="text-sm text-stone-500">
          From €{Math.min(...venue.availability?.zones.map(z => z.basePrice) || [0])}
        </p>
      </div>

      {/* Zones */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm uppercase tracking-widest text-stone-500">
          Available Zones
        </h3>
        {venue.availability?.zones.map(zone => (
          <div
            key={zone.id}
            className="bg-gradient-to-br from-white to-stone-50/50 rounded-2xl p-6 border border-stone-200/40"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-medium text-stone-900 mb-1">
                  {zone.name}
                </h4>
                <p className="text-sm text-stone-600">
                  {zone.availableUnits} / {zone.totalUnits} available
                </p>
              </div>
              <p className="text-2xl font-light text-amber-900">
                €{zone.basePrice}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowBooking(true)}
          className="flex-1 bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase hover:bg-stone-800 transition-all duration-300"
        >
          Book Now
        </button>
        <button
          onClick={onClose}
          className="flex-1 border border-stone-300 text-stone-700 px-8 py-4 rounded-full hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
        >
          Close
        </button>
      </div>

      {/* Booking Modal (placeholder) */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md">
            <h3 className="text-2xl font-light mb-4">Booking Flow</h3>
            <p className="text-stone-600 mb-6">
              Connect to existing reservation flow...
            </p>
            <button
              onClick={() => setShowBooking(false)}
              className="w-full bg-stone-900 text-white py-3 rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## STEP 5: Connect Booking Flow (2 hours)

**Update:** `VenueBottomSheet.jsx`

**Connect to existing reservation system:**

```javascript
import { reservationApi } from '../services/reservationApi';

const handleBookNow = async (zone) => {
  try {
    // Get zones with units
    const zones = await reservationApi.getZones(venue.id);
    const selectedZone = zones.find(z => z.id === zone.id);
    
    // Navigate to booking flow with zone data
    navigate('/booking', {
      state: {
        venue,
        zone: selectedZone
      }
    });
  } catch (error) {
    console.error('Failed to start booking:', error);
  }
};
```

---

## STEP 6: Test Map Functionality (1 hour)

**Test Scenarios:**

### Test 1: Map Loads
```
1. Open DiscoveryPage
2. Verify map loads
3. Verify centered on Albanian Riviera
4. Verify dark theme applied
```

### Test 2: Venue Markers
```
1. Verify all venues show as markers
2. Verify availability badges show
3. Hover over marker
4. Verify tooltip appears
```

### Test 3: Bottom Sheet
```
1. Click venue marker
2. Verify bottom sheet slides up
3. Verify venue details displayed
4. Verify zones listed
5. Verify prices shown
```

### Test 4: Booking Flow
```
1. Click "Book Now"
2. Verify connects to reservation system
3. Verify can select zone
4. Verify can complete booking
```

---

## Phase 3 Checklist:

- [ ] Mapbox installed and configured
- [ ] DiscoveryPage with map created
- [ ] VenueMarker component created
- [ ] VenueBottomSheet component created
- [ ] Booking flow connected
- [ ] All test scenarios pass
- [ ] Mobile responsive
- [ ] Premium design applied
- [ ] No console errors

---

**Next:** Phase 4 - Admin Controls + Experience Deck
