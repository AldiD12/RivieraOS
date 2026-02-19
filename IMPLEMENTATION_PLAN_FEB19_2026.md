# Implementation Plan - February 19, 2026

## Backend Updates Analysis Complete

Prof Kristi has deployed 5 major backend updates. This document outlines the frontend implementation plan.

---

## HIGH PRIORITY (Implement Now)

### 1. SpotPage - Send ZoneUnitId with Orders ✅ READY TO IMPLEMENT
**Why**: Collectors need to know which unit placed the order  
**Backend Support**: ✅ Deployed (commit 4e1dc6e)  
**Complexity**: LOW (5 minutes)

**Changes**:
- Extract `unitId` from URL params (already available)
- Add `zoneUnitId` to order payload in `handlePlaceOrder()`
- Backend will return `unitCode` in response

**Code Location**: `frontend/src/pages/SpotPage.jsx` line ~230

**Implementation**:
```javascript
const orderData = {
  venueId: parseInt(venueId),
  zoneUnitId: unitId ? parseInt(unitId) : null, // NEW
  customerName: sanitizedName || 'Guest',
  notes: sanitizedNotes || '',
  items: cart.map(item => ({
    productId: item.id,
    quantity: item.quantity
  }))
};
```

---

### 2. SpotPage - Check Digital Ordering Enabled ✅ READY TO IMPLEMENT
**Why**: Restaurants may not want digital ordering  
**Backend Support**: ✅ Deployed (commit 6125f0d)  
**Complexity**: LOW (10 minutes)

**Changes**:
- Backend already returns `allowsDigitalOrdering` in venue details
- Frontend already fetches this field (line ~140)
- Frontend already uses `canOrder` variable (line ~370)
- **ALREADY IMPLEMENTED** - Just needs testing

**Current Implementation**:
```javascript
// Line 140 - Already fetching
const venueData = await venueResponse.json();
console.log('✅ Venue details loaded:', {
  allowsDigitalOrdering: venueData.allowsDigitalOrdering
});

// Line 370 - Already checking
const canOrder = venue?.allowsDigitalOrdering ?? false;
```

**Status**: ✅ ALREADY DONE - No changes needed!

---

### 3. CollectorDashboard - SignalR Booking Events ⚠️ NEEDS IMPLEMENTATION
**Why**: Real-time booking updates for collectors  
**Backend Support**: ✅ Deployed (commit 4e1dc6e)  
**Complexity**: MEDIUM (15 minutes)

**Changes**:
- Add listeners for `BookingCreated` event
- Add listeners for `BookingStatusChanged` event
- Display `unitCode` and `unitStatus` in notifications

**Code Location**: `frontend/src/pages/CollectorDashboard.jsx` line ~80

**Current State**: SignalR connection exists but no booking event listeners

**Implementation**:
```javascript
// Add to useEffect where SignalR listeners are set up
connection.on('BookingCreated', (booking) => {
  console.log('🆕 New booking:', booking);
  // Show notification
  // Refresh units and bookings
  fetchUnits();
  fetchBookings();
});

connection.on('BookingStatusChanged', (data) => {
  console.log('📝 Booking status changed:', data);
  // data includes: bookingId, unitCode, unitStatus, newStatus
  // Show notification with unit info
  fetchUnits();
  fetchBookings();
});
```

---

### 4. BarDisplay - Show Unit Code with Orders ⚠️ NEEDS IMPLEMENTATION
**Why**: Bartenders need to know which unit to deliver to  
**Backend Support**: ✅ Deployed (commit 4e1dc6e)  
**Complexity**: LOW (5 minutes)

**Changes**:
- Backend now returns `unitCode` in order DTOs
- Display unit code prominently in order cards

**Code Location**: `frontend/src/pages/BarDisplay.jsx` line ~280

**Current State**: Already has placeholder for unitCode (line 280)

**Implementation**:
```javascript
// Line 280 - Already exists!
{order.unitCode && (
  <span className="inline-block bg-amber-600 text-white px-3 py-1 rounded-full font-bold mr-2">
    {order.unitCode}
  </span>
)}
```

**Status**: ✅ ALREADY DONE - Just needs backend to send unitCode!

---

## MEDIUM PRIORITY (Implement Later)

### 5. Admin Dashboards - Digital Ordering Toggle
**Why**: Allow admins to enable/disable digital ordering per venue  
**Backend Support**: ✅ Deployed (commit 6125f0d)  
**Complexity**: MEDIUM (20 minutes)

**Changes**:
- Add toggle in SuperAdminDashboard venue form
- Add toggle in BusinessAdminDashboard venue form
- Field: `isDigitalOrderingEnabled` (nullable bool)

**Code Locations**:
- `frontend/src/components/dashboard/modals/VenueModals.jsx`
- `frontend/src/pages/SuperAdminDashboard.jsx`
- `frontend/src/pages/BusinessAdminDashboard.jsx`

---

### 6. CollectorDashboard - Display Unit Code in Notifications
**Why**: Better awareness of which unit has activity  
**Backend Support**: ✅ Deployed (commit c04dee6)  
**Complexity**: LOW (10 minutes)

**Changes**:
- Show `unitCode` in booking notifications
- Show `unitStatus` ("Occupied" / "Available")

---

### 7. DiscoveryPage - Conditional "Order Now" Button
**Why**: Don't show "Order Now" if venue doesn't allow ordering  
**Backend Support**: ✅ Deployed (commit 6125f0d)  
**Complexity**: LOW (5 minutes)

**Changes**:
- Check `venue.allowsDigitalOrdering` before showing button
- Hide button if false

---

## IMPLEMENTATION ORDER

### Phase 1: Critical Fixes (30 minutes)
1. ✅ SpotPage - Digital ordering check (ALREADY DONE)
2. ⚠️ SpotPage - Send zoneUnitId with orders (5 min)
3. ✅ BarDisplay - Show unit code (ALREADY DONE)
4. ⚠️ CollectorDashboard - SignalR booking events (15 min)

### Phase 2: Admin Features (20 minutes)
5. Admin dashboards - Digital ordering toggle (20 min)

### Phase 3: Polish (15 minutes)
6. CollectorDashboard - Unit code in notifications (10 min)
7. DiscoveryPage - Conditional order button (5 min)

---

## TESTING PLAN

### After Phase 1:
1. Test SpotPage order placement with unitId
2. Test BarDisplay shows unit codes
3. Test CollectorDashboard receives real-time booking updates
4. Test digital ordering disabled for restaurants

### After Phase 2:
5. Test admin toggle for digital ordering
6. Test venue with ordering disabled

### After Phase 3:
7. Test discovery page hides "Order Now" for restaurants
8. Test collector sees unit codes in notifications

---

## QUESTIONS FOR PROF KRISTI

1. ✅ Is unit prefix removal deployed? (Check if zones create units without prefix)
2. ✅ Are SignalR booking events working on production?
3. ✅ Should restaurants have digital ordering OFF by default? (Yes - backend handles this)

---

## SUMMARY

**Already Implemented**: 2/7 features (SpotPage digital ordering check, BarDisplay unit code display)

**Ready to Implement**: 5/7 features (all backend support is deployed)

**Estimated Time**: 65 minutes total (30 min critical, 35 min nice-to-have)

**Deployment**: Push to GitHub → Vercel auto-deploys → Test on production

**Next Step**: Implement Phase 1 (Critical Fixes) - 30 minutes
