# Phase 1: Foundation - Detailed Development Plan

**Duration:** 1 day  
**Goal:** Set up core utilities and API services  
**Status:** Ready to start

---

## STEP 1: Create SessionManager Utility (30 minutes)

**File:** `frontend/src/utils/SessionManager.js`

**Purpose:** Manage SPOT MODE sessions (QR code scans, 4-hour expiry, manual exit)

**Implementation:**
```javascript
// Complete code already specified in SESSION_MANAGER_UTILITY_SPEC.md
// Copy the full implementation from that file
```

**Test:**
```javascript
// In browser console:
SessionManager.createSession(1, 'Folie Beach Club', '42');
console.log(SessionManager.getSession());
SessionManager.exitSession();
```

---

## STEP 2: Create Venue API Service (20 minutes)

**File:** `frontend/src/services/venueApi.js`

**Purpose:** Fetch venues for map and availability data

**Implementation:**
```javascript
const API_URL = import.meta.env.VITE_API_URL;

export const venueApi = {
  // Get all venues for map
  async getVenues() {
    const response = await fetch(`${API_URL}/api/public/venues`);
    if (!response.ok) throw new Error('Failed to fetch venues');
    return response.json();
  },

  // Get venue availability
  async getVenueAvailability(venueId) {
    const response = await fetch(
      `${API_URL}/api/public/venues/${venueId}/availability`
    );
    if (!response.ok) throw new Error('Failed to fetch availability');
    return response.json();
  }
};
```

**Test:**
```javascript
import { venueApi } from './services/venueApi';
const venues = await venueApi.getVenues();
console.log(venues);
```

---

## STEP 3: Create Feedback API Service (15 minutes)

**File:** `frontend/src/services/feedbackApi.js`

**Purpose:** Submit negative feedback (Review Shield)

**Implementation:**
```javascript
const API_URL = import.meta.env.VITE_API_URL;

export const feedbackApi = {
  // Submit negative feedback
  async submitFeedback(feedbackData) {
    const response = await fetch(`${API_URL}/api/public/Feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    if (!response.ok) throw new Error('Failed to submit feedback');
    return response.json();
  }
};
```

---

## STEP 4: Create Content API Service (15 minutes)

**File:** `frontend/src/services/contentApi.js`

**Purpose:** Fetch curated content for Experience Deck

**Implementation:**
```javascript
const API_URL = import.meta.env.VITE_API_URL;

export const contentApi = {
  // Get curated content
  async getContent(venueId = null, limit = 10) {
    const params = new URLSearchParams();
    if (venueId) params.append('venueId', venueId);
    params.append('limit', limit);
    
    const response = await fetch(
      `${API_URL}/api/public/content?${params}`
    );
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  }
};
```

---

## STEP 5: Update App.jsx with Context-Aware Routing (30 minutes)

**File:** `frontend/src/App.jsx`

**Changes:**
1. Import SessionManager
2. Add mode detection logic
3. Route to SPOT or DISCOVER mode

**Implementation:**
```javascript
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SessionManager } from './utils/SessionManager';

// Existing imports
import SpotPage from './pages/SpotPage';
import MenuPage from './pages/MenuPage';
import ReviewPage from './pages/ReviewPage';

// New imports
import DiscoveryPage from './pages/DiscoveryPage';

function App() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    // Check if user is in SPOT MODE or DISCOVER MODE
    const session = SessionManager.getSession();
    
    if (session && !session.manuallyExited) {
      setMode('SPOT');
    } else {
      setMode('DISCOVER');
    }
  }, []);

  if (mode === null) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {mode === 'SPOT' ? (
          <>
            <Route path="/" element={<SpotPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<DiscoveryPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## STEP 6: Create Placeholder DiscoveryPage (10 minutes)

**File:** `frontend/src/pages/DiscoveryPage.jsx`

**Purpose:** Temporary placeholder (will build properly in Phase 3)

**Implementation:**
```javascript
export default function DiscoveryPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-light text-stone-900 mb-4">
          Discover Mode
        </h1>
        <p className="text-lg text-stone-600">
          Map view coming soon...
        </p>
      </div>
    </div>
  );
}
```

---

## Phase 1 Checklist:

- [ ] SessionManager.js created and tested
- [ ] venueApi.js created
- [ ] feedbackApi.js created
- [ ] contentApi.js created
- [ ] App.jsx updated with mode detection
- [ ] DiscoveryPage placeholder created
- [ ] All files compile without errors
- [ ] Can switch between SPOT and DISCOVER modes

---

**Next:** Phase 2 - SPOT MODE Implementation
