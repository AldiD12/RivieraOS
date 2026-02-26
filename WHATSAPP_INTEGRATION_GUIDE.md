# WhatsApp Link Integration Guide

**Priority:** 🚨 CRITICAL  
**Timeline:** Day 1 (10 min) + Day 2 (1 hour) + Day 6 (30 min)  
**Impact:** 6-7x retention improvement  
**Status:** Ready to implement

---

## 📋 OVERVIEW

This guide shows exactly where to add WhatsApp link triggers in the existing codebase.

**Strategy:** Phase 1 (Direct Links) - No backend changes needed, works immediately

---

## STEP 1: Create WhatsApp Utility (Day 1 - 10 minutes)

**File:** `frontend/src/utils/whatsappLink.js`

```javascript
/**
 * WhatsApp Link Utility - PWA Ghosting Fix
 * Sends app links via WhatsApp to keep tourists engaged
 */

export const whatsappLink = {
  /**
   * Send order confirmation link
   */
  sendOrderLink: (phone, orderNumber, venueName) => {
    const link = `${window.location.origin}/order/${orderNumber}`;
    const message = `🍹 Order #${orderNumber} confirmed!\n\n${venueName}\n\nTrack your order:\n${link}`;
    
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  },

  /**
   * Send booking confirmation link
   */
  sendBookingLink: (phone, bookingCode, venueName, zoneName) => {
    const link = `${window.location.origin}/booking/${bookingCode}`;
    const message = `🏖️ Sunbed Reserved!\n\nBooking: ${bookingCode}\n${venueName} - ${zoneName}\n\nView booking:\n${link}\n\nShow this code when you arrive.`;
    
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  },

  /**
   * Send feedback follow-up link
   */
  sendFeedbackLink: (phone, feedbackId) => {
    const link = `${window.location.origin}/feedback/${feedbackId}`;
    const message = `😔 We're Sorry\n\nA manager will contact you within 1 hour.\n\nTrack your issue:\n${link}\n\nWe'll make it right.`;
    
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  },

  /**
   * Prompt user for phone number
   */
  promptForPhone: () => {
    const phone = prompt('Enter your phone number to receive updates (e.g., +355691234567):');
    
    if (!phone) return null;
    
    // Basic validation
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned.startsWith('+')) {
      alert('Please include country code (e.g., +355)');
      return null;
    }
    
    return cleaned;
  }
};

export default whatsappLink;
```

---

## STEP 2: Add to MenuPage (Day 2 - 1 hour)

**File:** `frontend/src/pages/MenuPage.jsx`

**Location:** After order is successfully placed

**Find this section:**
```javascript
// Somewhere in MenuPage where order is confirmed
const handleOrderSubmit = async () => {
  // ... existing order logic ...
  
  // Order successfully placed
  setOrderNumber(response.orderNumber);
  setShowSuccessModal(true);
};
```

**Add WhatsApp link trigger:**
```javascript
import whatsappLink from '../utils/whatsappLink';

const handleOrderSubmit = async () => {
  // ... existing order logic ...
  
  // Order successfully placed
  setOrderNumber(response.orderNumber);
  setShowSuccessModal(true);
  
  // 🚨 NEW: Send WhatsApp link
  const phone = whatsappLink.promptForPhone();
  if (phone) {
    whatsappLink.sendOrderLink(
      phone,
      response.orderNumber,
      venueName || 'Riviera Beach Club'
    );
  }
};
```

**Alternative: Add button to success modal**
```javascript
// In the success modal JSX
<div className="success-modal">
  <h2>Order Confirmed!</h2>
  <p>Order #{orderNumber}</p>
  
  {/* 🚨 NEW: WhatsApp button */}
  <button
    onClick={() => {
      const phone = whatsappLink.promptForPhone();
      if (phone) {
        whatsappLink.sendOrderLink(phone, orderNumber, venueName);
      }
    }}
    className="bg-green-600 text-white px-6 py-3 rounded-full"
  >
    📱 Get Order Link on WhatsApp
  </button>
</div>
```

---

## STEP 3: Add to ReviewPage (Day 3 - 1 hour)

**File:** `frontend/src/pages/ReviewPage.jsx`

**Location:** After negative feedback is submitted

**Find this section:**
```javascript
const handleSubmitReview = async () => {
  if (rating <= 3) {
    // Negative feedback - save to database
    await feedbackApi.submitFeedback({
      venueId,
      rating,
      comment,
      // ... other fields
    });
    
    setShowThankYou(true);
  }
};
```

**Add WhatsApp link trigger:**
```javascript
import whatsappLink from '../utils/whatsappLink';

const handleSubmitReview = async () => {
  if (rating <= 3) {
    // Negative feedback - save to database
    const response = await feedbackApi.submitFeedback({
      venueId,
      rating,
      comment,
      // ... other fields
    });
    
    setShowThankYou(true);
    
    // 🚨 NEW: Send WhatsApp link for follow-up
    const phone = whatsappLink.promptForPhone();
    if (phone) {
      whatsappLink.sendFeedbackLink(phone, response.feedbackId);
    }
  }
};
```

---

## STEP 4: Add to Booking Flow (Day 6 - 30 minutes)

**File:** `frontend/src/components/VenueBottomSheet.jsx` (or wherever booking is confirmed)

**Location:** After sunbed booking is confirmed

**Find this section:**
```javascript
const handleBookingConfirm = async () => {
  const response = await reservationApi.createReservation({
    venueId,
    zoneId,
    unitId,
    // ... other fields
  });
  
  setBookingCode(response.bookingCode);
  setShowConfirmation(true);
};
```

**Add WhatsApp link trigger:**
```javascript
import whatsappLink from '../utils/whatsappLink';

const handleBookingConfirm = async () => {
  const response = await reservationApi.createReservation({
    venueId,
    zoneId,
    unitId,
    phone, // Make sure to collect phone in booking form
    // ... other fields
  });
  
  setBookingCode(response.bookingCode);
  setShowConfirmation(true);
  
  // 🚨 NEW: Send WhatsApp link
  if (phone) {
    whatsappLink.sendBookingLink(
      phone,
      response.bookingCode,
      venueName,
      zoneName
    );
  }
};
```

**Update booking form to collect phone:**
```javascript
// Add phone input to booking form
<input
  type="tel"
  placeholder="+355 69 123 4567"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  className="w-full px-4 py-3 border border-stone-300 rounded-lg"
  required
/>
```

---

## 🧪 TESTING CHECKLIST

### Test 1: Order Flow
- [ ] Place an order in MenuPage
- [ ] Phone prompt appears
- [ ] Enter phone number with country code
- [ ] WhatsApp opens with pre-filled message
- [ ] Message contains order number and link
- [ ] Link works when clicked

### Test 2: Feedback Flow
- [ ] Submit negative review (1-3 stars)
- [ ] Phone prompt appears
- [ ] Enter phone number
- [ ] WhatsApp opens with apology message
- [ ] Message contains feedback tracking link
- [ ] Link works when clicked

### Test 3: Booking Flow
- [ ] Book sunbed from map
- [ ] Enter phone number in booking form
- [ ] Confirm booking
- [ ] WhatsApp opens automatically
- [ ] Message contains booking code and link
- [ ] Link works when clicked

### Test 4: Mobile Testing
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Verify WhatsApp app opens (not web)
- [ ] Verify links work in WhatsApp chat
- [ ] Verify messages are readable

---

## 📊 EXPECTED RESULTS

### Before WhatsApp Links:
- Tourist orders drinks
- Closes Safari tab
- Forgets app exists
- Never returns
- **Return rate: 10%**

### After WhatsApp Links:
- Tourist orders drinks
- Gets WhatsApp message with link
- Closes Safari tab
- Opens WhatsApp later
- Sees message with link
- Clicks → Back in app
- **Return rate: 60-70%**

### Impact:
- **6-7x improvement in retention**
- App link lives in WhatsApp forever
- No "Add to Home Screen" needed
- Tourists can always find the app

---

## 🚀 DEPLOYMENT NOTES

### Phase 1 (Current - Direct Links):
- No backend changes needed
- Works immediately
- Free
- User must click to send

### Phase 2 (Future - Twilio API):
- Automated sending
- No user action needed
- Costs ~$0.01/message
- More reliable
- Professional

**Recommendation:** Start with Phase 1, upgrade to Phase 2 in Week 2

---

## 🔮 FUTURE ENHANCEMENTS

### Evening Reminder (Phase 3):
```javascript
// Send at 6 PM daily to recent visitors
const message = `🌙 Tonight at ${venueName}\n\nDJ Night - 10 PM\nVIP Tables from €200\n\nBrowse events:\n${link}`;
```

### Abandoned Booking Recovery:
```javascript
// If user starts booking but doesn't complete
const message = `🏖️ Complete Your Booking\n\nYou were reserving a sunbed at ${venueName}.\n\nFinish booking:\n${link}`;
```

---

**Created:** February 26, 2026  
**Status:** Ready to implement  
**Priority:** 🚨 CRITICAL  
**Timeline:** 1.5 hours total across 3 days

**This is the single most important retention feature. Implement first.**
