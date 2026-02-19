# Collector Dashboard - Mobile-First Design Specification

## Overview

The Collector Dashboard is a **mobile-first, field-use application** for beach/venue staff who manage guest check-ins, check-outs, and bookings while walking around the venue.

**Primary Use Case:** Collector walks around with phone/tablet, checking guests in/out at their sunbeds/tables.

**Design Philosophy:** Industrial Minimalist (from premium-design-system.md)
- Fast, efficient, readable
- High contrast: white on black
- Large touch targets (min 44px)
- No decorative elements
- Sharp corners, flat design

---

## User Flow

1. **Login** → Collector logs in with phone + PIN
2. **Dashboard** → See venue name, today's bookings
3. **Filter** → Filter by zone or status
4. **Action** → Tap booking to check-in/check-out
5. **Real-time** → See new bookings appear via SignalR

---

## Screen Breakdown

### 1. Header (Sticky)

**Mobile (320px-768px):**
```
┌─────────────────────────────────┐
│ 🏖️ BEACH          [Logout] │
│ Collector: John Doe            │
│ ⚡ Online                       │
└─────────────────────────────────┘
```

**Desktop (768px+):**
```
┌──────────────────────────────────────────────┐
│ 🏖️ BEACH                    [Logout Button] │
│ Collector: John Doe  •  ⚡ Online            │
└──────────────────────────────────────────────┘
```

**Elements:**
- Venue name (large, bold)
- Collector name
- Online/Offline status indicator
- Logout button

**Styling:**
```css
bg-zinc-900
border-b border-zinc-800
px-4 py-3
sticky top-0 z-50
```

---

### 2. Stats Cards (Horizontal Scroll on Mobile)

**Mobile:**
```
┌─────────────────────────────────┐
│ ← [Card] [Card] [Card] →       │
└─────────────────────────────────┘
```

**Desktop:**
```
┌─────────────────────────────────┐
│ [Card]  [Card]  [Card]  [Card] │
└─────────────────────────────────┘
```

**Cards:**
1. **Total Bookings Today**
   - Number: 42
   - Label: "Total Today"

2. **Checked In**
   - Number: 35
   - Label: "Checked In"
   - Color: Green

3. **Pending**
   - Number: 7
   - Label: "Pending"
   - Color: Yellow

4. **Occupied Units**
   - Number: 35/50
   - Label: "Occupied"

**Card Styling:**
```css
bg-zinc-800
rounded-lg
p-4
min-w-[120px]
border border-zinc-700
```

**Number Styling:**
```css
text-4xl font-black text-white
```

---

### 3. Filters (Sticky Below Header)

**Mobile:**
```
┌─────────────────────────────────┐
│ [All Zones ▼]  [All Status ▼]  │
└─────────────────────────────────┘
```

**Desktop:**
```
┌──────────────────────────────────────────────┐
│ [All Zones ▼]  [All Status ▼]  [🔄 Refresh] │
└──────────────────────────────────────────────┘
```

**Filters:**
1. **Zone Dropdown**
   - All Zones
   - VIP Section
   - Regular Area
   - etc.

2. **Status Dropdown**
   - All Status
   - Pending
   - Checked In
   - Checked Out

3. **Refresh Button** (desktop only)

**Styling:**
```css
bg-zinc-900
border-b border-zinc-800
px-4 py-3
sticky top-[60px]
flex gap-2
```

**Dropdown Styling:**
```css
bg-zinc-800
border border-zinc-700
rounded-md
px-3 py-2
text-white
min-w-[140px]
```

---

### 4. Bookings List (Main Content)

**Mobile - Card Layout:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ A1  •  VIP Section          │ │
│ │ John Doe                    │ │
│ │ +355 69 123 4567            │ │
│ │ 2 guests                    │ │
│ │                             │ │
│ │ [✓ Check In]  [× Check Out] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ B3  •  Regular Area         │ │
│ │ Jane Smith                  │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Desktop - Table Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Unit  Zone         Guest        Phone         Actions    │
├──────────────────────────────────────────────────────────┤
│ A1    VIP Section  John Doe     +355691234567 [Check In] │
│ B3    Regular      Jane Smith   +355691234568 [Check Out]│
└──────────────────────────────────────────────────────────┘
```

**Booking Card (Mobile):**

**Status Colors:**
- Pending: `bg-yellow-900/20 border-yellow-800`
- Checked In: `bg-green-900/20 border-green-800`
- Checked Out: `bg-zinc-800 border-zinc-700 opacity-60`

**Card Structure:**
```jsx
<div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-3">
  {/* Header */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="text-2xl font-black text-white">A1</span>
      <span className="text-zinc-500">•</span>
      <span className="text-sm text-zinc-400">VIP Section</span>
    </div>
    <span className="px-2 py-1 bg-yellow-900/20 text-yellow-400 text-xs rounded">
      Pending
    </span>
  </div>
  
  {/* Guest Info */}
  <div className="space-y-1 mb-4">
    <p className="text-lg font-bold text-white">John Doe</p>
    <p className="text-sm text-zinc-400">+355 69 123 4567</p>
    <p className="text-sm text-zinc-400">2 guests</p>
  </div>
  
  {/* Actions */}
  <div className="flex gap-2">
    <button className="flex-1 bg-white text-black py-3 rounded-md font-bold">
      ✓ Check In
    </button>
    <button className="flex-1 bg-zinc-700 text-white py-3 rounded-md font-bold">
      × Check Out
    </button>
  </div>
</div>
```

---

### 5. Empty State

**When no bookings:**
```
┌─────────────────────────────────┐
│                                 │
│         📋                      │
│                                 │
│    No bookings found            │
│                                 │
│    Try changing filters or      │
│    wait for new bookings        │
│                                 │
└─────────────────────────────────┘
```

**Styling:**
```css
text-center py-12
text-zinc-500
```

---

### 6. Loading State

**Skeleton Cards:**
```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ ▓▓▓  ▓▓▓▓▓▓▓▓               │ │
│ │ ▓▓▓▓▓▓▓▓                    │ │
│ │ ▓▓▓▓▓▓▓▓▓▓▓                 │ │
│ │                             │ │
│ │ [▓▓▓▓▓▓▓]  [▓▓▓▓▓▓▓]        │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

---

## Component Hierarchy

```
CollectorDashboard
├── Header
│   ├── VenueName
│   ├── CollectorInfo
│   ├── OnlineStatus
│   └── LogoutButton
├── StatsCards (horizontal scroll on mobile)
│   ├── TotalBookingsCard
│   ├── CheckedInCard
│   ├── PendingCard
│   └── OccupiedUnitsCard
├── Filters (sticky)
│   ├── ZoneDropdown
│   ├── StatusDropdown
│   └── RefreshButton (desktop only)
└── BookingsList
    ├── BookingCard (mobile)
    │   ├── CardHeader (unit, zone, status)
    │   ├── GuestInfo (name, phone, guests)
    │   └── ActionButtons (check-in, check-out)
    └── BookingTable (desktop)
        └── BookingRow
```

---

## Responsive Breakpoints

```css
/* Mobile First */
.container {
  padding: 1rem; /* 16px */
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem; /* 24px */
  }
  
  .stats-cards {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .bookings-list {
    /* Switch to table layout */
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## Touch Targets

**Minimum sizes for mobile:**
- Buttons: 44px height
- Dropdowns: 44px height
- Cards: Full width, min 120px height
- Action buttons: 48px height (larger for primary actions)

---

## Real-Time Updates (SignalR)

**Events to Listen For:**
1. `BookingCreated` - New booking appears at top
2. `BookingStatusChanged` - Update booking status
3. `BookingDeleted` - Remove booking from list

**Visual Feedback:**
- New booking: Fade in with green flash
- Status change: Smooth transition
- Deleted: Fade out

---

## Interactions

### Check-In Flow
1. Tap "Check In" button
2. Button shows loading spinner
3. API call to `/api/collector/bookings/{id}/check-in`
4. Success: Card updates to "Checked In" status (green)
5. Toast notification: "Guest checked in successfully"

### Check-Out Flow
1. Tap "Check Out" button
2. Button shows loading spinner
3. API call to `/api/collector/bookings/{id}/check-out`
4. Success: Card updates to "Checked Out" status (gray, faded)
5. Toast notification: "Guest checked out successfully"

### Pull to Refresh (Mobile)
1. Pull down on bookings list
2. Show loading indicator
3. Refresh bookings from API
4. Update list

---

## API Integration

**Endpoints Used:**
1. `GET /api/collector/zones` - Load zones for filter
2. `GET /api/collector/bookings?zoneId={id}&status={status}` - Load bookings
3. `POST /api/collector/bookings/{id}/check-in` - Check in guest
4. `POST /api/collector/bookings/{id}/check-out` - Check out guest

**Data Flow:**
```
1. Component mounts
   ↓
2. Fetch zones (for filter dropdown)
   ↓
3. Fetch bookings (default: today, all zones, all status)
   ↓
4. Connect to SignalR hub
   ↓
5. Listen for real-time updates
   ↓
6. User filters → Refetch bookings
   ↓
7. User checks in/out → Update booking → Refetch list
```

---

## Color System (Industrial Minimalist)

**Background:**
- Primary: `bg-black`
- Secondary: `bg-zinc-900`
- Cards: `bg-zinc-800`

**Borders:**
- Default: `border-zinc-700`
- Subtle: `border-zinc-800`

**Text:**
- Primary: `text-white`
- Secondary: `text-zinc-400`
- Muted: `text-zinc-500`

**Status Colors:**
- Pending: `bg-yellow-900/20 text-yellow-400 border-yellow-800`
- Checked In: `bg-green-900/20 text-green-400 border-green-800`
- Checked Out: `bg-zinc-800 text-zinc-500 border-zinc-700`

**Buttons:**
- Primary: `bg-white text-black`
- Secondary: `bg-zinc-700 text-white`
- Danger: `bg-red-600 text-white`

---

## Typography

**Font:** Inter (Tailwind default)

**Sizes:**
- Venue name: `text-2xl font-bold` (24px)
- Unit code: `text-2xl font-black` (24px)
- Guest name: `text-lg font-bold` (18px)
- Stats numbers: `text-4xl font-black` (36px)
- Body text: `text-sm` (14px)
- Labels: `text-xs uppercase tracking-wider` (12px)

---

## Performance Considerations

1. **Lazy Loading:** Load bookings in batches (20 at a time)
2. **Virtual Scrolling:** For 100+ bookings
3. **Debounced Filters:** Wait 300ms after filter change
4. **Optimistic Updates:** Update UI immediately, rollback on error
5. **Offline Support:** Cache last fetched data, show offline indicator

---

## Accessibility

1. **Touch Targets:** Min 44px for all interactive elements
2. **Contrast:** WCAG AA compliant (white on black = 21:1)
3. **Focus States:** Visible focus rings on all interactive elements
4. **Screen Reader:** Proper ARIA labels for status badges
5. **Keyboard Navigation:** Tab through all interactive elements

---

## Error Handling

**Network Error:**
```
┌─────────────────────────────────┐
│ ⚠️ Connection lost              │
│ Retrying in 5 seconds...        │
│ [Retry Now]                     │
└─────────────────────────────────┘
```

**API Error:**
```
Toast notification:
"Failed to check in guest. Please try again."
```

**No Venue Assigned:**
```
┌─────────────────────────────────┐
│ ⚠️ No venue assigned            │
│                                 │
│ Please contact your manager     │
│ to assign you to a venue        │
│                                 │
│ [Logout]                        │
└─────────────────────────────────┘
```

---

## Implementation Priority

### Phase 1: Core Functionality (MVP)
1. ✅ Header with venue name
2. ✅ Bookings list (mobile cards)
3. ✅ Check-in/check-out buttons
4. ✅ Basic filtering (zone, status)
5. ✅ Loading states

### Phase 2: Enhanced UX
1. Stats cards
2. Real-time updates (SignalR)
3. Pull to refresh
4. Optimistic updates
5. Toast notifications

### Phase 3: Polish
1. Skeleton loading
2. Empty states
3. Error handling
4. Offline support
5. Animations

---

## Testing Checklist

**Mobile (iPhone SE - 375px):**
- [ ] All text readable
- [ ] Buttons easy to tap
- [ ] No horizontal scroll
- [ ] Cards stack vertically
- [ ] Filters work

**Tablet (iPad - 768px):**
- [ ] Stats cards in grid
- [ ] Larger touch targets
- [ ] More content visible
- [ ] Table layout option

**Desktop (1920px):**
- [ ] Centered layout (max-width)
- [ ] Table view for bookings
- [ ] Hover states
- [ ] Keyboard navigation

**Functionality:**
- [ ] Check-in updates status
- [ ] Check-out updates status
- [ ] Filters work correctly
- [ ] Real-time updates appear
- [ ] Logout works
- [ ] No venue assigned handled

---

## File Structure

```
frontend/src/
  pages/
    CollectorDashboard.jsx (main component)
  components/
    collector/
      CollectorHeader.jsx
      StatsCards.jsx
      BookingFilters.jsx
      BookingCard.jsx (mobile)
      BookingTable.jsx (desktop)
      EmptyState.jsx
  services/
    collectorApi.js (new file)
  hooks/
    useCollectorBookings.js
    useSignalR.js
```

---

## Next Steps

1. **Backend:** Prof Kristi implements collector endpoints
2. **Frontend:** Create `collectorApi.js` service
3. **Frontend:** Rebuild CollectorDashboard with mobile-first design
4. **Testing:** Test on real mobile devices
5. **Deploy:** Push to production

---

## Estimated Time

- Backend endpoints: 3-4 hours (Prof Kristi)
- Frontend rebuild: 6-8 hours
- Testing & polish: 2-3 hours
- **Total: 11-15 hours**
