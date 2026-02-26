# Phase 2: SPOT MODE - Detailed Development Plan

**Duration:** 2-3 days  
**Goal:** Refactor SpotPage with session management + Review Shield  
**Depends on:** Phase 1 complete

---

## STEP 1: Refactor SpotPage with SessionManager (2 hours)

**File:** `frontend/src/pages/SpotPage.jsx`

**Changes:**
1. Replace localStorage with SessionManager
2. Add session expiry check
3. Add "Leave Venue" button
4. Redirect to DISCOVER MODE if session expired

**Key Updates:**

### Import SessionManager
```javascript
import { SessionManager } from '../utils/SessionManager';
import { useNavigate } from 'react-router-dom';
```

### Check Session on Mount
```javascript
useEffect(() => {
  const session = SessionManager.getSession();
  
  if (!session || session.manuallyExited) {
    // Session expired or user left - redirect to DISCOVER MODE
    navigate('/');
    return;
  }

  // Load venue data
  setVenueId(session.venueId);
  setVenueName(session.venueName);
  setUnitCode(session.unitCode);
}, [navigate]);
```

### Add Leave Venue Button
```javascript
const handleLeaveVenue = () => {
  if (confirm('Are you sure you want to leave the venue?')) {
    SessionManager.exitSession();
    navigate('/');
  }
};

// In JSX:
<button
  onClick={handleLeaveVenue}
  className="px-6 py-3 border border-stone-300 text-stone-700 rounded-full"
>
  Leave Venue
</button>
```

---

## STEP 2: Update ReviewPage with Review Shield (1 hour)

**File:** `frontend/src/pages/ReviewPage.jsx`

**Changes:**
1. Import feedbackApi
2. Save negative feedback before WhatsApp redirect
3. Keep existing 4-5 star Google redirect

**Implementation:**

### Import Feedback API
```javascript
import { feedbackApi } from '../services/feedbackApi';
import { SessionManager } from '../utils/SessionManager';
```

### Update Submit Handler
```javascript
const handleSubmitReview = async (rating, comment) => {
  const session = SessionManager.getSession();
  
  // If rating is 1-3 stars, save feedback FIRST
  if (rating <= 3) {
    try {
      await feedbackApi.submitFeedback({
        venueId: session?.venueId || venue.id,
        rating,
        comment,
        unitCode: session?.unitCode,
        guestName,
        guestPhone
      });
      
      console.log('✅ Negative feedback saved for analytics');
    } catch (error) {
      console.error('❌ Failed to save feedback:', error);
      // Continue anyway - don't block WhatsApp redirect
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

## STEP 3: Test Session Management (30 minutes)

**Test Scenarios:**

### Test 1: QR Code Scan
```
1. Scan QR code with venueId=1, unitCode=42
2. Verify session created
3. Verify SpotPage loads
4. Verify venue name and unit code displayed
```

### Test 2: Session Persistence
```
1. Create session
2. Refresh page
3. Verify still in SPOT MODE
4. Verify data persists
```

### Test 3: Manual Exit
```
1. Create session
2. Click "Leave Venue"
3. Verify redirected to DISCOVER MODE
4. Verify session cleared
```

### Test 4: Session Expiry
```
1. Create session
2. Manually set timestamp to 5 hours ago:
   SessionManager.createSession(1, 'Test', '42');
   const session = JSON.parse(localStorage.getItem('venueSession'));
   session.timestamp = Date.now() - (5 * 60 * 60 * 1000);
   localStorage.setItem('venueSession', JSON.stringify(session));
3. Refresh page
4. Verify redirected to DISCOVER MODE
```

---

## STEP 4: Test Review Shield (30 minutes)

**Test Scenarios:**

### Test 1: Negative Feedback (1-3 stars)
```
1. Go to ReviewPage
2. Select 2 stars
3. Enter comment: "Test negative feedback"
4. Enter name and phone
5. Submit
6. Verify feedback saved (check network tab)
7. Verify redirected to WhatsApp
```

### Test 2: Positive Feedback (4-5 stars)
```
1. Go to ReviewPage
2. Select 5 stars
3. Enter comment: "Amazing!"
4. Submit
5. Verify redirected to Google Reviews
6. Verify NO feedback API call (check network tab)
```

### Test 3: Feedback Save Failure
```
1. Disconnect internet
2. Submit 2-star review
3. Verify still redirects to WhatsApp (doesn't block)
4. Check console for error message
```

---

## STEP 5: Add Loading States (30 minutes)

**Files to Update:**
- `SpotPage.jsx`
- `ReviewPage.jsx`

**Add Loading Indicators:**

```javascript
const [isLoading, setIsLoading] = useState(false);

const handleSubmitReview = async (rating, comment) => {
  setIsLoading(true);
  
  try {
    // ... existing code
  } finally {
    setIsLoading(false);
  }
};

// In JSX:
<button disabled={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit Review'}
</button>
```

---

## STEP 6: Add Error Handling (30 minutes)

**Add Error States:**

```javascript
const [error, setError] = useState(null);

const handleSubmitReview = async (rating, comment) => {
  setError(null);
  
  try {
    // ... existing code
  } catch (err) {
    setError('Failed to submit review. Please try again.');
    console.error(err);
  }
};

// In JSX:
{error && (
  <div className="bg-red-50 text-red-800 p-4 rounded-lg">
    {error}
  </div>
)}
```

---

## Phase 2 Checklist:

- [ ] SpotPage refactored with SessionManager
- [ ] "Leave Venue" button added and working
- [ ] Session expiry check implemented
- [ ] ReviewPage updated with Review Shield
- [ ] Negative feedback saved before WhatsApp redirect
- [ ] All test scenarios pass
- [ ] Loading states added
- [ ] Error handling added
- [ ] No console errors
- [ ] Mobile responsive

---

**Next:** Phase 3 - DISCOVER MODE (Map + Booking)
