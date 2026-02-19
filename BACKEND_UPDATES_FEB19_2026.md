# Backend Updates - February 19, 2026

## Overview
Prof Kristi has deployed 5 new commits to the backend (fori99/main). These are critical updates that affect frontend functionality.

---

## ✅ COMMIT 1: Include unitCode and unitStatus in notifications
**Commit**: `c04dee6`
**Date**: Most Recent

### What Changed:
- Booking creation response now includes `unitCode`
- SignalR `BookingStatusChanged` events now include:
  - `unitCode` (e.g., "1", "2", "3")
  - `unitStatus` ("Occupied" or "Available")
- Fixed missing `BookingStatusChanged` broadcast in release endpoint

### Frontend Impact:
- ✅ CollectorDashboard can now display unit codes in real-time notifications
- ✅ Status changes show which specific unit changed
- ✅ Better UX for collectors tracking unit occupancy

### Action Required:
- **NONE** - Frontend already handles these fields if present
- **OPTIONAL**: Update CollectorDashboard to display unitCode in notifications

---

## ✅ COMMIT 2: Add ZoneUnitId to Order and booking hub events
**Commit**: `4e1dc6e`
**Date**: Recent

### What Changed:
- Orders can now be associated with specific zone units
- New field: `Order.ZoneUnitId` (nullable)
- Public OrdersController accepts `zoneUnitId` parameter
- Business OrdersController exposes `unitCode` in responses
- SignalR events for bookings:
  - `BookingCreated` event
  - `BookingStatusChanged` event

### Frontend Impact:
- ✅ SpotPage can now send `zoneUnitId` when placing orders
- ✅ Collectors can see which unit an order belongs to
- ✅ Real-time booking updates via SignalR

### Action Required:
1. **Update SpotPage**: Add `zoneUnitId` to order payload (if available from QR code)
2. **Update CollectorDashboard**: Listen for SignalR booking events
3. **Update BarDisplay**: Show unit code with orders

---

## ✅ COMMIT 3: Change user->venue FK to NoAction
**Commit**: `125bf86`
**Date**: Recent

### What Changed:
- User->Venue foreign key behavior changed from `SetNull` to `NoAction`
- Consolidated migrations for cleaner database schema
- Migration: `AddUserVenueAndDigitalOrdering`

### Frontend Impact:
- ✅ No direct impact
- ✅ Database integrity improved

### Action Required:
- **NONE** - Backend database change only

---

## ✅ COMMIT 4: Add IsDigitalOrderingEnabled to Venue
**Commit**: `6125f0d`
**Date**: Recent

### What Changed:
- New field: `Venue.IsDigitalOrderingEnabled` (nullable bool)
- Computed property: `Venue.AllowsDigitalOrdering`
- Default behavior:
  - Restaurants: Digital ordering OFF by default
  - Beach/Pool: Digital ordering ON by default
- Exposed in all venue DTOs (Business, Public, SuperAdmin)

### Frontend Impact:
- ✅ SpotPage should check if digital ordering is enabled
- ✅ Admin dashboards can toggle digital ordering per venue
- ✅ Discovery page can show "Order Now" button conditionally

### Action Required:
1. **Update SpotPage**: Check `venue.allowsDigitalOrdering` before showing menu
2. **Update DiscoveryPage**: Show "Order Now" only if enabled
3. **Update SuperAdminDashboard**: Add toggle for digital ordering
4. **Update BusinessAdminDashboard**: Add toggle for digital ordering

---

## ✅ COMMIT 5: Add venue assignment to users and staff APIs
**Commit**: `c01cd82`
**Date**: Deployed (we already knew about this)

### What Changed:
- User entity has `VenueId` (nullable)
- Login response includes `venueId` and `venueName`
- Staff DTOs include venue info
- New endpoint: `GET /api/business/staff/me/profile`
- Validation: Staff can only be assigned to venues in their business

### Frontend Impact:
- ✅ Already implemented in LoginPage
- ✅ Already implemented in CollectorDashboard
- ✅ Fixes "No venue assigned" error

### Action Required:
- **NONE** - Already implemented
- **TEST**: Verify on production that collector venue assignment works

---

## Priority Action Items

### HIGH PRIORITY (Affects Core Functionality)

1. **SpotPage - Digital Ordering Check**
   - Check `venue.allowsDigitalOrdering` before showing menu
   - Show message: "Digital ordering is not available at this venue"
   - Affects: Restaurants that don't want digital ordering

2. **SpotPage - Send ZoneUnitId with Orders**
   - Extract `unitId` from QR code URL
   - Send `zoneUnitId` in order payload
   - Affects: Collectors need to know which unit ordered

3. **CollectorDashboard - SignalR Booking Events**
   - Listen for `BookingCreated` event
   - Listen for `BookingStatusChanged` event
   - Show real-time booking updates
   - Affects: Real-time sunbed booking notifications

### MEDIUM PRIORITY (Improves UX)

4. **BarDisplay - Show Unit Code**
   - Display `unitCode` with each order
   - Helps bartenders know which unit to deliver to
   - Affects: Order fulfillment efficiency

5. **Admin Dashboards - Digital Ordering Toggle**
   - Add toggle in venue form: "Enable Digital Ordering"
   - SuperAdmin and BusinessAdmin
   - Affects: Venue configuration flexibility

6. **CollectorDashboard - Display Unit Code in Notifications**
   - Show `unitCode` in booking status notifications
   - Show `unitStatus` ("Occupied" / "Available")
   - Affects: Collector awareness of unit status

### LOW PRIORITY (Nice to Have)

7. **DiscoveryPage - Conditional "Order Now" Button**
   - Only show "Order Now" if `venue.allowsDigitalOrdering === true`
   - Affects: User expectations

---

## Testing Checklist

After implementing frontend changes:

- [ ] Test SpotPage with restaurant venue (should block ordering)
- [ ] Test SpotPage with beach venue (should allow ordering)
- [ ] Test order placement with unitId (check collector sees it)
- [ ] Test collector dashboard real-time booking updates
- [ ] Test bar display shows unit codes
- [ ] Test admin toggle for digital ordering
- [ ] Test collector venue assignment on production

---

## Technical Notes

### SignalR Events (New)
```typescript
// BookingCreated event
{
  bookingId: number,
  unitCode: string,
  guestName: string,
  guestPhone: string,
  status: string
}

// BookingStatusChanged event
{
  bookingId: number,
  unitCode: string,
  unitStatus: "Occupied" | "Available",
  newStatus: string
}
```

### Order Payload (Updated)
```typescript
// POST /api/public/orders
{
  venueId: number,
  zoneUnitId?: number,  // NEW - optional
  items: [
    { productId: number, quantity: number }
  ],
  guestName: string,
  guestPhone: string
}
```

### Venue DTO (Updated)
```typescript
{
  id: number,
  name: string,
  type: string,
  isDigitalOrderingEnabled?: boolean,  // NEW - nullable
  allowsDigitalOrdering: boolean       // NEW - computed
}
```

---

## Coordination with Prof Kristi

### Questions to Ask:
1. ✅ Is unit prefix removal deployed? (Check if zones create units without prefix)
2. ✅ Are SignalR events working on production?
3. ✅ Should restaurants have digital ordering OFF by default?

### Backend Tasks Still Pending:
- ❓ Unit prefix removal (BACKEND_UNIT_PREFIX_REMOVAL_TASK.md)
- ❓ Venue type ordering (BACKEND_VENUE_TYPE_ORDERING_TASK.md)

---

## Summary

Prof Kristi has deployed 5 major updates:
1. ✅ Unit codes in booking notifications
2. ✅ Orders can be linked to specific units
3. ✅ Database FK behavior improved
4. ✅ Digital ordering can be toggled per venue
5. ✅ Venue assignment for collectors (already implemented)

**Next Steps**: Implement HIGH PRIORITY frontend changes to take advantage of new backend features.

**Estimated Time**: 2-3 hours for all HIGH PRIORITY items

**Deployment**: Push to GitHub → Vercel auto-deploys → Test on production
