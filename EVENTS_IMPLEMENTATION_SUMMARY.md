# Events System - Quick Summary

## TL;DR
Backend is DONE. We just need to build 3 frontend UIs:
1. Business Admin Dashboard - Events tab (3-4 hours)
2. Super Admin Dashboard - Events tab (3-4 hours)
3. Discovery Page - Night mode events display (4-5 hours)

**Total: 12-16 hours (2-3 days)**

---

## What's Already Built (Backend)

✅ SuperAdmin can create/edit/delete/publish/unpublish/restore events  
✅ Business Admin can create/edit/delete/publish/unpublish their events  
✅ Public API to browse published events  
✅ Events linked to venues  
✅ Ticketing support (price, max guests, spots remaining)  
✅ Booking stats (bookingCount, totalGuests)  

---

## What We Need to Build (Frontend)

### 1. Business Admin Dashboard
**File:** `frontend/src/pages/BusinessAdminDashboard.jsx`

Add new "Events" tab with:
- List all events for business's venues
- Create new event (name, description, flyer, dates, venue, ticketing)
- Edit/delete events
- Publish/unpublish toggle
- View booking stats

**New Files:**
- `frontend/src/components/dashboard/modals/EventModals.jsx`
- `frontend/src/services/eventsApi.js`

---

### 2. Super Admin Dashboard
**File:** `frontend/src/pages/SuperAdminDashboard.jsx`

Add new "Events" tab with:
- List ALL events across all businesses
- Filter by business/venue/date
- Create/edit/delete any event
- Publish/unpublish any event
- Restore deleted events

**Reuses:** EventModals.jsx, eventsApi.js

---

### 3. Discovery Page - Night Mode
**File:** `frontend/src/pages/DiscoveryPage.jsx`

Add "EVENTS" filter to existing filters:
```
[ALL VENUES] [BEACH CLUBS] [BOATS] [DINING] [EVENTS] 🪩
```

When EVENTS filter is active:
- Show event cards instead of venues
- Event markers on map (with 🪩 icon)
- Click event → EventBottomSheet
- Show only published, future events
- Sort by date (soonest first)

**New Files:**
- `frontend/src/components/EventBottomSheet.jsx`

---

## Event Data Structure

```typescript
{
  name: string (required)
  description: string
  flyerImageUrl: string
  startTime: DateTime (required)
  endTime: DateTime (required)
  isTicketed: boolean
  ticketPrice: number
  maxGuests: number
  isPublished: boolean
  venueId: number (required)
}
```

---

## Design Guidelines

### Admin Dashboards (Industrial)
- Black background (bg-zinc-900, bg-black)
- White text (text-white, text-zinc-400)
- White buttons (bg-white text-black)
- Sharp corners (rounded-md)

### Discovery Page Night Mode (Neon Luxury)
- Dark background (bg-zinc-950)
- Neon green accent (#10FF88)
- Glowing effects (shadow-[0_0_12px_rgba(16,255,136,0.4)])
- Soft corners (rounded-sm, rounded-xl)
- Backdrop blur (backdrop-blur-xl)

---

## Implementation Order

1. **Day 1:** Business Admin Events tab (easiest to test)
2. **Day 2:** Super Admin Events tab (reuse components)
3. **Day 3:** Discovery Page events display (most visible)
4. **Day 4:** Testing & polish

---

## Questions for You

1. **Events Display:** Should events be a filter (recommended), separate section, or separate tab?
2. **Ticketing:** WhatsApp booking link or in-app ticketing?
3. **Image Upload:** Reuse existing ImageUpload component?

---

## Why This Matters

- Unlocks nightlife revenue stream (clubs, parties, concerts)
- Night mode is PERFECT for events
- Events are high-margin (ticket sales)
- Differentiates XIXA from competitors
- Drives repeat visits (users check for new events)

---

**Ready to start? Let me know which part you want to build first!**
