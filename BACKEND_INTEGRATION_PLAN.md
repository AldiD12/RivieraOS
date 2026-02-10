# Backend Integration Plan

**Date:** February 10, 2026  
**Status:** In Progress

---

## Integration Status Overview

### ✅ Already Integrated (Working in Production)
1. **Venue Type System** - SpotPage.jsx
   - Fetches venue type from backend
   - Context-aware QR: BEACH/POOL vs RESTAURANT
   - Uses: `GET /api/public/venues/{id}` and zones endpoint

2. **SignalR Real-Time** - BarDisplay.jsx
   - SignalR connection established
   - Listens for `NewOrder` and `OrderStatusChanged` events
   - Auto-reconnection logic
   - Package installed: `@microsoft/signalr@^10.0.0`

3. **Unit Management APIs** - ZoneUnitsManager.jsx
   - Full CRUD operations via businessApi
   - Bulk unit creation working
   - Uses: `/business/venues/{venueId}/Units/*`

---

## What's Working Right Now

### BarDisplay.jsx - SignalR Implementation
```javascript
// ✅ Already implemented:
- createConnection() from signalr.js
- Listens for 'NewOrder' event
- Listens for 'OrderStatusChanged' event
- Auto-reconnect on disconnect
- Visual connection status indicator (Wifi icon)
- Refreshes order list on events
```

**Status:** LIVE and functional!

### ZoneUnitsManager.jsx - Unit Management
```javascript
// ✅ Already implemented:
- businessApi.units.list(venueId)
- businessApi.units.bulkCreate(venueId, bulkData)
- businessApi.units.delete(venueId, unitId)
- Bulk creation with prefix + numbering
- Unit status display (Available/Occupied)
```

**Status:** LIVE and functional!

---

## Remaining Integrations

### 1. Booking Management (CollectorDashboard)
**Priority:** HIGH  
**Status:** Not Started

**Current State:**
- CollectorDashboard exists but uses mock/localStorage data
- No backend integration for bookings

**Backend APIs Available:**
```
GET    /api/business/bookings
GET    /api/business/bookings/{id}
POST   /api/business/bookings
PUT    /api/business/bookings/{id}
DELETE /api/business/bookings/{id}
PUT    /api/business/bookings/{id}/status
PUT    /api/business/bookings/{id}/checkin
PUT    /api/business/bookings/{id}/checkout
```

**What Needs to Be Done:**
1. Create `businessApi.bookings` service methods
2. Update CollectorDashboard to fetch real bookings
3. Implement check-in/check-out functionality
4. Add booking status management
5. Remove localStorage fallbacks

**Estimated Time:** 2-3 hours

---

### 2. Orders API Integration
**Priority:** MEDIUM  
**Status:** Partially Done

**Current State:**
- BarDisplay fetches orders via `businessApi.orders.getActive()`
- Order status updates work
- SignalR provides real-time updates

**What's Missing:**
- Order details view
- Order history
- Order filtering by venue/zone
- Order analytics

**Backend APIs Available:**
```
GET  /api/business/orders?venueId=X&status=Y&zoneId=Z
GET  /api/business/orders/active?venueId=X
GET  /api/business/orders/{id}
PUT  /api/business/orders/{id}/status
```

**What Needs to Be Done:**
1. Add order filtering UI to BarDisplay
2. Create order details modal
3. Add order history page
4. Implement order search

**Estimated Time:** 1-2 hours

---

### 3. Enhanced SignalR Features
**Priority:** LOW  
**Status:** Basic Implementation Done

**Current State:**
- Basic SignalR connection works
- Listens to all events (Clients.All)

**What Could Be Added:**
- Join specific venue groups (reduce noise)
- Join specific zone groups
- Notification sounds for new orders
- Toast notifications
- Order animation on arrival

**Backend Hub Methods:**
```csharp
// Currently: Broadcasts to Clients.All
// Could add: JoinVenueGroup(venueId)
// Could add: JoinZoneGroup(zoneId)
```

**What Needs to Be Done:**
1. Add notification sound on new order
2. Add toast notification library
3. Animate new orders sliding in
4. Add venue/zone group filtering (backend change needed)

**Estimated Time:** 1-2 hours

---

## Implementation Priority

### Phase 1: Booking Management (TODAY)
**Goal:** Full booking lifecycle in CollectorDashboard

**Tasks:**
1. ✅ Create businessApi.bookings service
2. ✅ Update CollectorDashboard to fetch bookings
3. ✅ Implement check-in functionality
4. ✅ Implement check-out functionality
5. ✅ Add booking status management
6. ✅ Test end-to-end booking flow

**Deliverable:** Collectors can manage bookings from dashboard

---

### Phase 2: Enhanced Orders (OPTIONAL)
**Goal:** Better order management in BarDisplay

**Tasks:**
1. Add order filtering by venue/zone
2. Create order details modal
3. Add order history view
4. Implement order search

**Deliverable:** Bartenders have full order visibility

---

### Phase 3: Polish (OPTIONAL)
**Goal:** Better UX with notifications and animations

**Tasks:**
1. Add notification sounds
2. Add toast notifications
3. Animate new orders
4. Add venue/zone filtering

**Deliverable:** Smoother operational experience

---

## Testing Checklist

### SignalR (Already Working)
- [x] BarDisplay connects to SignalR hub
- [x] New orders appear automatically
- [x] Order status changes update in real-time
- [x] Connection status indicator works
- [x] Auto-reconnect on disconnect

### Unit Management (Already Working)
- [x] Bulk create units with prefix
- [x] Units display in grid
- [x] Delete units
- [x] Unit status shows correctly
- [x] Data persists after refresh

### Booking Management (To Test)
- [ ] Fetch today's bookings
- [ ] Check-in guest
- [ ] Check-out guest
- [ ] Update booking status
- [ ] Cancel booking
- [ ] Create new booking

---

## Success Metrics

**Current:**
- ✅ 3/5 major features integrated (60%)
- ✅ SignalR real-time updates working
- ✅ Unit management working
- ✅ Venue type system working

**After Phase 1:**
- 🎯 4/5 major features integrated (80%)
- 🎯 Full booking lifecycle management
- 🎯 Collectors can operate independently

**After Phase 2:**
- 🎯 5/5 major features integrated (100%)
- 🎯 Complete operational platform
- 🎯 Ready for production launch

---

## Next Steps

1. **NOW:** Implement booking management in CollectorDashboard
2. **THEN:** Test booking flow end-to-end
3. **FINALLY:** Deploy and verify in production

---

**Last Updated:** February 10, 2026  
**Current Focus:** Booking Management Integration
