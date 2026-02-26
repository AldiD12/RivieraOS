# Session Manager Utility - Complete Specification

**Date:** February 25, 2026  
**Purpose:** Prevent "4-hour session trap" where tourists are stuck in ordering mode after leaving venue  
**Priority:** CRITICAL for Phase 1

---

## 🎯 THE PROBLEM

Tourist scans QR code at beach at 11 AM. They leave at 2 PM (3 hours later). They open the app at their hotel. The session hasn't expired yet (< 4 hours), so they see the ordering menu even though they're not at the beach anymore.

**This is a terrible user experience.**

---

## ✅ THE SOLUTION

Two-layer session management:
1. **4-hour automatic expiry** - Session expires after 4 hours
2. **Manual "Leave Venue" button** - User can exit session immediately

---

## 📁 FILE STRUCTURE

```
frontend/src/
├── utils/
│   └── SessionManager.js (NEW)
├── pages/
│   ├── SpotMode.jsx (NEW - refactored from SpotPage)
│   └── DiscoverMode.jsx (NEW)
└── App.jsx (MODIFIED - add mode switching)
```

---

## 📝 COMPLETE CODE

### 1. SessionManager.js (NEW)

```javascript
// frontend/src/utils/SessionManager.js

/**
 * Session Manager for Context-Aware Routing
 * Handles SPOT MODE (on-site) vs DISCOVER MODE (off-site) switching
 */

const SESSION_KEY = 'riviera_session';
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

export const SessionManager = {
  /**
   * Start a new session when QR code is scanned
   * @param {string} venueId - Venue ID from QR code
   * @param {string} unitId - Unit ID from QR code
   * @returns {object} Session object
   */
  startSession: (venueId, unitId) => {
    const session = {
      venueId,
      unitId,
      startTime: Date.now(),
      manuallyExited: false
    };
    
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      console.log('✅ Session started:', { venueId, unitId });
      return session;
    } catch (error) {
      console.error('❌ Failed to start session:', error);
      return null;
    }
  },

  /**
   * Get current session from localStorage
   * @returns {object|null} Session object or null if not found
   */
  getSession: () => {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return null;
      
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      return null;
    }
  },

  /**
   * Check if session is active (< 4 hours and not manually exited)
   * @returns {boolean} True if session is active
   */
  isSessionActive: () => {
    const session = SessionManager.getSession();
    if (!session) return false;
    
    // Check manual exit flag
    if (session.manuallyExited) {
      console.log('⚠️ Session manually exited');
      return false;
    }
    
    // Check 4-hour expiry
    const elapsed = Date.now() - session.startTime;
    const isActive = elapsed < SESSION_DURATION;
    
    if (!isActive) {
      console.log('⚠️ Session expired (> 4 hours)');
    }
    
    return isActive;
  },

  /**
   * Manual exit - user clicks "Leave Venue" button
   * Marks session as manually exited without clearing data
   */
  exitSession: () => {
    const session = SessionManager.getSession();
    if (!session) return;
    
    try {
      session.manuallyExited = true;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      console.log('✅ Session manually exited');
    } catch (error) {
      console.error('❌ Failed to exit session:', error);
    }
  },

  /**
   * Clear session completely (for logout or reset)
   */
  clearSession: () => {
    try {
      localStorage.removeItem(SESSION_KEY);
      console.log('✅ Session cleared');
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
    }
  },

  /**
   * Get session duration in minutes
   * @returns {number} Minutes since session started
   */
  getSessionDuration: () => {
    const session = SessionManager.getSession();
    if (!session) return 0;
    
    const elapsed = Date.now() - session.startTime;
    return Math.floor(elapsed / (60 * 1000));
  },

  /**
   * Get remaining session time in minutes
   * @returns {number} Minutes until session expires
   */
  getRemainingTime: () => {
    const session = SessionManager.getSession();
    if (!session) return 0;
    
    const elapsed = Date.now() - session.startTime;
    const remaining = SESSION_DURATION - elapsed;
    return Math.max(0, Math.floor(remaining / (60 * 1000)));
  }
};

export default SessionManager;
```

---

## 🔧 INTEGRATION GUIDE

### 2. App.jsx (MODIFIED)

```javascript
// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SessionManager from './utils/SessionManager';
import SpotMode from './pages/SpotMode';
import DiscoverMode from './pages/DiscoverMode';

function App() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('DISCOVER');
  const [loading, setLoading] = useState(true);

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

    setLoading(false);
  }, [searchParams]);

  const handleLeaveVenue = () => {
    SessionManager.exitSession();
    setMode('DISCOVER');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="text-[#57534E] text-lg">Loading...</div>
      </div>
    );
  }

  return mode === 'SPOT' 
    ? <SpotMode onLeaveVenue={handleLeaveVenue} />
    : <DiscoverMode />;
}

export default App;
```

---

### 3. SpotMode.jsx (NEW - Header with Leave Button)

```javascript
// frontend/src/pages/SpotMode.jsx
import { MapPin } from 'lucide-react';
import SessionManager from '../utils/SessionManager';

function SpotMode({ onLeaveVenue }) {
  const session = SessionManager.getSession();

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Header with Leave Venue button */}
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
              Venue Name
            </h1>
          </div>
          
          {/* Leave Venue button */}
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

      {/* Menu/Nightlife content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* TODO: Add MenuNightlifeToggle component */}
        <p className="text-[#78716C]">Menu and ordering interface goes here</p>
      </div>
    </div>
  );
}

export default SpotMode;
```

---

## 🧪 TESTING SCENARIOS

### Test 1: QR Code Scan
1. Open app with QR params: `?v=1&u=42`
2. ✅ Should start session and show SPOT MODE
3. ✅ localStorage should have session data
4. ✅ Header should show "Unit 42"

### Test 2: Session Persistence
1. Scan QR code (start session)
2. Refresh page
3. ✅ Should stay in SPOT MODE
4. ✅ Session should persist

### Test 3: Manual Exit
1. Scan QR code (start session)
2. Click "Leave Venue" button
3. ✅ Should switch to DISCOVER MODE
4. ✅ Session should be marked as `manuallyExited: true`
5. Refresh page
6. ✅ Should stay in DISCOVER MODE (not re-enter SPOT)

### Test 4: 4-Hour Expiry
1. Scan QR code (start session)
2. Manually set `startTime` to 5 hours ago in localStorage
3. Refresh page
4. ✅ Should switch to DISCOVER MODE
5. ✅ Session should be expired

### Test 5: The "Beach Exit" Scenario (Critical!)
1. Scan QR code at 11:00 AM (start session)
2. Leave beach at 2:00 PM (3 hours later)
3. Open app at hotel at 2:30 PM
4. ❌ WITHOUT manual exit: Shows SPOT MODE (WRONG!)
5. Click "Leave Venue"
6. ✅ WITH manual exit: Shows DISCOVER MODE (CORRECT!)

---

## 📊 SESSION DATA STRUCTURE

```javascript
{
  "venueId": "1",
  "unitId": "42",
  "startTime": 1708876800000, // Unix timestamp
  "manuallyExited": false // Key flag for manual exit
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Create `SessionManager.js` utility
- [ ] Add session logic to `App.jsx`
- [ ] Create `SpotMode.jsx` with "Leave Venue" button
- [ ] Test QR code scanning
- [ ] Test session persistence
- [ ] Test manual exit
- [ ] Test 4-hour expiry
- [ ] Test "beach exit" scenario
- [ ] Deploy to Vercel
- [ ] Test on mobile devices

---

## 🔮 FUTURE ENHANCEMENTS (Phase 4)

### Geo-Fence Check
```javascript
// Add to SessionManager.js
checkGeofence: async (venueLatitude, venueLongitude) => {
  if (!navigator.geolocation) return true; // Fallback if not supported
  
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          venueLatitude,
          venueLongitude
        );
        
        // Auto-exit if > 500m from venue
        if (distance > 500) {
          SessionManager.exitSession();
          resolve(false);
        } else {
          resolve(true);
        }
      },
      () => resolve(true) // Fallback on error
    );
  });
}
```

---

**Created:** February 25, 2026  
**Status:** Ready to implement  
**Priority:** CRITICAL for Phase 1

**This prevents the "4-hour session trap" and ensures tourists aren't stuck in ordering mode after leaving the beach.**
