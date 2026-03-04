# Public Events Display - Discovery Page Integration

**Date:** March 4, 2026  
**Status:** IN PROGRESS

---

## Strategic Approach

### Design Philosophy
Events should feel like a natural extension of Discovery Mode, not a separate feature. Users are already in "discovery mindset" - show them what's happening tonight.

### UX Flow
1. User opens Discovery Page (default: map view with venues)
2. Sees "EVENTS" tab in bottom navigation
3. Taps Events → Smooth transition to events grid
4. Filters by vibe (Techno, House, etc.) or date
5. Taps event card → WhatsApp booking flow

---

## Implementation Plan

### 1. Add Events API Service (✅ EXISTS)
**File:** `frontend/src/services/eventsApi.js`

Already has `publicEventsApi`:
- `getEvents()` - Get all published events
- `getEventDetails(id)` - Get event details
- `getEventsByVenue(venueId)` - Filter by venue
- `getEventsByBusiness(businessId)` - Filter by business

### 2. Add Events State to DiscoveryPage
**Location:** `frontend/src/pages/DiscoveryPage.jsx`

```javascript
const [events, setEvents] = useState([]);
const [eventsLoading, setEventsLoading] = useState(false);
const [selectedEvent, setSelectedEvent] = useState(null);
const [eventVibeFilter, setEventVibeFilter] = useState('all');
const [eventDateFilter, setEventDateFilter] = useState('all'); // all, today, thisWeek
```

### 3. Add Events Tab to Bottom Navigation
**Current tabs:** Map, List, Bookings, Profile  
**New structure:** Map, List, Events, Bookings, Profile

Or simpler: Keep 4 tabs, replace one with Events (Events > Bookings for discovery)

### 4. Create EventsView Component
**Design:** Luxury card grid (not industrial - this is customer-facing)

```jsx
function EventsView({ events, loading, vibeFilter, onVibeChange, onEventClick, isDayMode }) {
  // Vibe filter chips
  // Event cards grid
  // Empty state
}
```

### 5. Event Card Design (Luxury)
**Inspiration:** Soho House events, Aman experiences

```jsx
function EventCard({ event, isDayMode, onClick }) {
  return (
    <div className="luxury-card-with-image">
      {/* Flyer image (full bleed) */}
      {/* Vibe badge (top-left) */}
      {/* Event name (overlay, bottom) */}
      {/* Venue name */}
      {/* Date/time */}
      {/* Entry type badge (Free/Ticketed/Reservation) */}
      {/* CTA: "Book Table" or "Get Tickets" */}
    </div>
  );
}
```

### 6. Vibe Filter Chips
**Vibes:** All, House, Techno, Commercial, Live Music, Hip Hop, Chill

**Design:** Horizontal scrollable chips (like venue filters)

### 7. WhatsApp Booking Integration
**Flow:**
1. User taps "Book Table" on event card
2. Opens WhatsApp with pre-filled message:
   ```
   Hi! I'd like to book a table for [Event Name] at [Venue Name] on [Date].
   
   Event: [Event Name]
   Venue: [Venue Name]
   Date: [Date & Time]
   Minimum Spend: €[Amount] (if reservation type)
   
   How many people: 
   Preferred time:
   ```

---

## Design System Compliance

### Customer-Facing (Luxury)
- ✅ Sophisticated neutrals (stone-50, zinc-900)
- ✅ Soft rounded corners (rounded-[2rem])
- ✅ Subtle shadows
- ✅ Large, elegant typography
- ✅ Generous whitespace
- ✅ Smooth animations (500ms+)

### Theme-Aware
- Day Mode: Light, airy, stone tones
- Night Mode: Dark, neon accents (#10FF88)

---

## Component Structure

```
DiscoveryPage
├── Map View (existing)
├── List View (existing)
└── Events View (NEW)
    ├── Vibe Filter Chips
    ├── Date Filter Chips
    ├── Events Grid
    │   └── EventCard
    │       ├── Flyer Image
    │       ├── Vibe Badge
    │       ├── Event Info
    │       └── Book Button
    └── Empty State
```

---

## API Integration

### Fetch Events
```javascript
const loadEvents = async () => {
  try {
    setEventsLoading(true);
    const data = await publicEventsApi.getEvents();
    // Filter only published events
    const published = data.filter(e => e.isPublished && !e.isDeleted);
    setEvents(published);
  } catch (err) {
    console.error('Failed to load events:', err);
  } finally {
    setEventsLoading(false);
  }
};
```

### Filter by Vibe
```javascript
const filteredEvents = events.filter(event => {
  if (eventVibeFilter === 'all') return true;
  return event.vibe === eventVibeFilter;
});
```

### Filter by Date
```javascript
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const thisWeekEnd = new Date(today);
thisWeekEnd.setDate(today.getDate() + 7);

const dateFilteredEvents = filteredEvents.filter(event => {
  const eventDate = new Date(event.startTime);
  
  if (eventDateFilter === 'today') {
    return eventDate >= today && eventDate < new Date(today.getTime() + 86400000);
  }
  if (eventDateFilter === 'thisWeek') {
    return eventDate >= today && eventDate < thisWeekEnd;
  }
  return true; // 'all'
});
```

---

## WhatsApp Message Template

```javascript
const generateEventBookingMessage = (event, venue) => {
  const eventDate = new Date(event.startTime).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const eventTime = new Date(event.startTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let message = `Hi! I'd like to book for ${event.name} at ${venue.name} on ${eventDate}.\n\n`;
  message += `📅 Event: ${event.name}\n`;
  message += `📍 Venue: ${venue.name}\n`;
  message += `🕐 Date & Time: ${eventDate} at ${eventTime}\n`;
  
  if (event.minimumSpend > 0) {
    message += `💎 Minimum Spend: €${event.minimumSpend} per table\n`;
  } else if (event.isTicketed && event.ticketPrice > 0) {
    message += `🎫 Ticket Price: €${event.ticketPrice}\n`;
  }
  
  message += `\nHow many people: \n`;
  message += `Preferred arrival time: `;
  
  return encodeURIComponent(message);
};
```

---

## Empty States

### No Events
```
🎉 No Events Yet

Check back soon for upcoming events at the hottest venues on the Albanian Riviera.
```

### No Events for Filter
```
🎵 No [Vibe] Events

Try a different vibe or check back later.
```

---

## Performance Considerations

1. **Lazy Load Images** - Use loading="lazy" on event flyers
2. **Cache Events** - Store in state, refresh every 5 minutes
3. **Optimize Filters** - Client-side filtering (no API calls)
4. **Smooth Transitions** - Use CSS transitions for view changes

---

## Testing Checklist

- [ ] Events load on Discovery Page
- [ ] Vibe filter works
- [ ] Date filter works
- [ ] Event cards display correctly
- [ ] Flyer images load
- [ ] Entry type badges show correctly
- [ ] WhatsApp booking link works
- [ ] Message pre-fills correctly
- [ ] Empty states display
- [ ] Day/Night mode theming works
- [ ] Smooth transitions between views
- [ ] Mobile responsive
- [ ] Loading states work

---

## Files to Modify

1. ✅ `frontend/src/services/eventsApi.js` (already exists)
2. ⏳ `frontend/src/pages/DiscoveryPage.jsx` (add events view)
3. ⏳ Create `frontend/src/components/EventCard.jsx` (new)
4. ⏳ Create `frontend/src/components/EventsView.jsx` (new)

---

## Estimated Time

- Events state & API integration: 10 min
- EventCard component: 15 min
- EventsView component: 15 min
- Filters implementation: 10 min
- WhatsApp integration: 5 min
- Testing & polish: 10 min

**Total:** ~65 minutes (slightly over estimate, but thorough)

---

## Next Steps

1. Add events state to DiscoveryPage
2. Create EventCard component (luxury design)
3. Create EventsView component
4. Add Events tab to navigation
5. Implement filters
6. Add WhatsApp booking
7. Test end-to-end
8. Deploy

Let's build this. 🚀
