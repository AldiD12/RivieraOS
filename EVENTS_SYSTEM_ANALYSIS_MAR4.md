# Events System - Deep Analysis & Implementation Plan
**Date:** March 4, 2026  
**Status:** Ready for Implementation  
**Priority:** High (Nightlife Revenue Stream)

---

## Executive Summary

The Events system is ALREADY BUILT in the backend. Prof. Kristi has deployed complete APIs for:
- SuperAdmin: Full CRUD + publish/unpublish/restore
- Business Admin: Create/manage events for their venues
- Public: Browse events by venue/business, view details

We just need to build the frontend UI in 3 places:
1. Business Admin Dashboard - Events tab
2. Super Admin Dashboard - Events tab  
3. Discovery Page - Night mode events display

---

## Backend APIs Available

### SuperAdmin Events APIs
```
GET    /api/superadmin/Events (paginated list)
POST   /api/superadmin/Events (create)
GET    /api/superadmin/Events/{id} (details)
PUT    /api/superadmin/Events/{id} (update)
DELETE /api/superadmin/Events/{id} (soft delete)
POST   /api/superadmin/Events/{id}/publish
POST   /api/superadmin/Events/{id}/unpublish
POST   /api/superadmin/Events/{id}/restore
```

### Business Admin Events APIs
```
GET    /api/business/Events (list my events)
POST   /api/business/Events (create)
GET    /api/business/Events/{id} (details)
PUT    /api/business/Events/{id} (update)
DELETE /api/business/Events/{id} (soft delete)
POST   /api/business/Events/{id}/publish
POST   /api/business/Events/{id}/unpublish
```

### Public Events APIs (for DiscoveryPage)
```
GET /api/public/Events (all published events)
GET /api/public/Events/{id} (event details)
GET /api/public/Events/venue/{venueId} (events at specific venue)
GET /api/public/Events/business/{businessId} (events by business)
```

---

## Event Data Model

### CreateEventRequest (Business/SuperAdmin)
```typescript
{
  name: string (required, max 200 chars)
  description: string (optional)
  flyerImageUrl: string (optional, max 500 chars)
  startTime: DateTime (required)
  endTime: DateTime (required)
  isTicketed: boolean
  ticketPrice: number (double)
  maxGuests: number (int32)
  isPublished: boolean
  venueId: number (required)
}
```

### EventDetailDto (Response)
```typescript
{
  id: number
  name: string
  description: string
  flyerImageUrl: string
  startTime: DateTime
  endTime: DateTime
  isTicketed: boolean
  ticketPrice: number
  maxGuests: number
  isPublished: boolean
  createdAt: DateTime
  venueId: number
  venueName: string
  businessId: number (SuperAdmin only)
  businessName: string (SuperAdmin only)
  bookingCount: number
  totalGuests: number
}
```

### PublicEventListItemDto (DiscoveryPage)
```typescript
{
  id: number
  name: string
  flyerImageUrl: string
  startTime: DateTime
  endTime: DateTime
  isTicketed: boolean
  ticketPrice: number
  maxGuests: number
  venueId: number
  venueName: string
  venueAddress: string
  businessName: string
  spotsRemaining: number
}
```

---

## Implementation Plan

### Phase 1: Business Admin Dashboard (2-3 hours)

**Location:** `frontend/src/pages/BusinessAdminDashboard.jsx`

**Current Structure:**
- Dashboard has tabs: Venues, Zones, Units, Menu, Staff
- Uses modal system for CRUD operations
- Already has API service pattern

**Add Events Tab:**
1. Create new "Events" tab in navigation
2. Build Events list view (table/cards)
3. Create EventModals.jsx component with:
   - CreateEventModal
   - EditEventModal
   - ViewEventModal
4. Create eventsApi.js service
5. Add publish/unpublish toggle
6. Show booking stats (bookingCount, totalGuests)

**UI Features:**
- List all events for business's venues
- Filter by venue
- Filter by date (upcoming/past)
- Filter by status (published/draft)
- Create new event (select venue from dropdown)
- Edit event details
- Upload flyer image
- Publish/unpublish toggle
- Delete event (soft delete)
- View booking stats

---

### Phase 2: Super Admin Dashboard (2-3 hours)

**Location:** `frontend/src/pages/SuperAdminDashboard.jsx`

**Current Structure:**
- Has BusinessTab, StaffTab, MenuTab
- Uses same modal pattern as Business Admin
- Has business/venue filtering

**Add Events Tab:**
1. Create EventsTab component
2. Reuse EventModals.jsx (with businessId field)
3. Add to superAdminApi.js service
4. Add restore functionality (SuperAdmin only)

**UI Features:**
- List ALL events across all businesses
- Filter by business
- Filter by venue
- Filter by date
- Filter by status (published/draft/deleted)
- Create event (select business + venue)
- Edit any event
- Publish/unpublish any event
- Restore deleted events
- View booking stats

---

### Phase 3: Discovery Page - Night Mode Events (3-4 hours)

**Location:** `frontend/src/pages/DiscoveryPage.jsx`

**Current Structure:**
- Has Day/Night toggle
- Has Map/List view toggle
- Has venue filters (Beach, Boat, Restaurant)
- Night mode already styled with neon green (#10FF88)

**Add Events Display in Night Mode:**

**Option A: Events Filter (RECOMMENDED)**
```
Filters: [ALL VENUES] [BEACH CLUBS] [BOATS] [DINING] [EVENTS] 🪩
```
- When "EVENTS" filter is active, show events instead of venues
- Events appear as cards in list view
- Events appear as markers on map (with 🪩 icon)
- Click event → EventBottomSheet (similar to VenueBottomSheet)

**Option B: Separate Events Section**
```
[Venues Section]
- Map with venue markers
- Venue filters

[Events Section] (scroll down)
- Horizontal scrolling event cards
- "See All Events" button
```

**Option C: Events Tab in Bottom Nav**
```
Bottom Nav: [DISCOVER] [EVENTS] [SAVED] [BOOKINGS] [PROFILE]
```
- Separate page for events
- More complex navigation

**RECOMMENDATION: Option A (Events Filter)**
- Simplest UX
- Fits existing filter pattern
- No new navigation needed
- Events feel integrated, not separate

**Events Display Features:**
- Show only PUBLISHED events
- Show only FUTURE events (startTime > now)
- Filter by venue type (Beach, Boat, Restaurant)
- Sort by date (soonest first)
- Event cards show:
  - Flyer image (full bleed)
  - Event name
  - Venue name + location
  - Date + time
  - Ticket price (if ticketed)
  - Spots remaining
  - "Get Tickets" button
- Click event → EventBottomSheet with:
  - Full event details
  - Venue info
  - Get directions button
  - WhatsApp booking link (if ticketed)

---

## UI Design Guidelines

### Business/Super Admin (Industrial Minimalist)
```css
Background: bg-zinc-900, bg-black
Text: text-white, text-zinc-400
Borders: border-zinc-700, border-zinc-800
Buttons: bg-white text-black (primary)
Cards: bg-zinc-900 border border-zinc-800
```

### Discovery Page Night Mode (Neon Luxury)
```css
Background: bg-zinc-950
Accent: #10FF88 (neon green)
Text: text-white, text-zinc-400
Cards: bg-zinc-900/80 backdrop-blur-xl
Borders: border-zinc-800
Shadows: shadow-[0_0_12px_rgba(16,255,136,0.4)]
```

**Event Card Design (Night Mode):**
```jsx
<div className="relative overflow-hidden rounded-sm bg-zinc-900 border border-zinc-800">
  {/* Flyer Image */}
  <div className="relative h-64 w-full overflow-hidden">
    <img src={event.flyerImageUrl} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-80" />
    
    {/* Status Badge */}
    <div className="absolute top-3 left-3">
      <span className="px-2.5 py-1 text-[10px] font-bold uppercase bg-zinc-950 border-r border-b border-zinc-800 text-white">
        <span className="w-1.5 h-1.5 bg-[#10FF88] inline-block mr-1.5"></span>
        LIVE EVENT
      </span>
    </div>
    
    {/* Date Badge */}
    <div className="absolute top-3 right-3 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 rounded-sm p-2">
      <div className="text-center">
        <div className="text-2xl font-bold text-[#10FF88]">15</div>
        <div className="text-[8px] uppercase text-zinc-400">MAR</div>
      </div>
    </div>
  </div>
  
  {/* Event Info */}
  <div className="p-5">
    <h3 className="font-serif text-2xl text-white mb-1">{event.name}</h3>
    <p className="text-xs text-zinc-400 mb-3">{event.venueName}</p>
    
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2 text-xs text-zinc-400">
        <svg className="w-4 h-4" />
        <span>22:00 - 04:00</span>
      </div>
      {event.isTicketed && (
        <div className="text-lg font-serif text-[#10FF88]">€{event.ticketPrice}</div>
      )}
    </div>
    
    <button className="w-full bg-zinc-950 text-[#10FF88] border border-[#10FF88] py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(16,255,136,0.6)]">
      Get Tickets
    </button>
  </div>
</div>
```

---

## File Structure

```
frontend/src/
├── pages/
│   ├── BusinessAdminDashboard.jsx (add Events tab)
│   ├── SuperAdminDashboard.jsx (add Events tab)
│   └── DiscoveryPage.jsx (add Events filter + display)
├── components/
│   ├── dashboard/
│   │   └── modals/
│   │       └── EventModals.jsx (NEW)
│   ├── VenueBottomSheet.jsx (reference for EventBottomSheet)
│   └── EventBottomSheet.jsx (NEW)
└── services/
    ├── eventsApi.js (NEW)
    └── venueApi.js (reference)
```

---

## API Service Implementation

### eventsApi.js
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Business Admin APIs
export const businessEventsApi = {
  getEvents: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/business/Events`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await axios.post(`${API_BASE_URL}/api/business/Events`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await axios.put(`${API_BASE_URL}/api/business/Events/${id}`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  deleteEvent: async (id) => {
    await axios.delete(`${API_BASE_URL}/api/business/Events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  publishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/business/Events/${id}/publish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  unpublishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/business/Events/${id}/unpublish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
};

// Super Admin APIs
export const superAdminEventsApi = {
  getEvents: async (page = 1, pageSize = 50) => {
    const response = await axios.get(`${API_BASE_URL}/api/superadmin/Events`, {
      params: { page, pageSize },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await axios.post(`${API_BASE_URL}/api/superadmin/Events`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await axios.put(`${API_BASE_URL}/api/superadmin/Events/${id}`, eventData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },
  
  deleteEvent: async (id) => {
    await axios.delete(`${API_BASE_URL}/api/superadmin/Events/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  publishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/superadmin/Events/${id}/publish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  unpublishEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/superadmin/Events/${id}/unpublish`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  },
  
  restoreEvent: async (id) => {
    await axios.post(`${API_BASE_URL}/api/superadmin/Events/${id}/restore`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
  }
};

// Public APIs (for DiscoveryPage)
export const publicEventsApi = {
  getEvents: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events`);
    return response.data;
  },
  
  getEventDetails: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events/${id}`);
    return response.data;
  },
  
  getEventsByVenue: async (venueId) => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events/venue/${venueId}`);
    return response.data;
  },
  
  getEventsByBusiness: async (businessId) => {
    const response = await axios.get(`${API_BASE_URL}/api/public/Events/business/${businessId}`);
    return response.data;
  }
};
```

---

## Implementation Timeline

### Day 1 (3-4 hours): Business Admin Events Tab
- Create eventsApi.js service
- Add Events tab to BusinessAdminDashboard
- Create EventModals.jsx (Create/Edit/View)
- Test CRUD operations
- Test publish/unpublish

### Day 2 (3-4 hours): Super Admin Events Tab
- Add Events tab to SuperAdminDashboard
- Reuse EventModals with businessId field
- Add restore functionality
- Test cross-business event management

### Day 3 (4-5 hours): Discovery Page Events Display
- Add "EVENTS" filter to DiscoveryPage
- Create EventBottomSheet component
- Fetch and display published events
- Add event markers to map
- Test filtering and sorting
- Polish night mode styling

### Day 4 (2-3 hours): Testing & Polish
- End-to-end testing
- Mobile responsiveness
- Image upload testing
- WhatsApp integration for ticketed events
- Performance optimization

**Total Estimated Time: 12-16 hours (2-3 days)**

---

## Success Metrics

### Business Admin
- Can create events in under 2 minutes
- Can upload flyer images easily
- Can publish/unpublish with one click
- Can see booking stats in real-time

### Super Admin
- Can manage all events across businesses
- Can restore deleted events
- Can filter by business/venue/date

### Discovery Page
- Events load in under 1 second
- Events filter feels natural
- Event cards are visually stunning
- Booking flow is seamless

---

## Next Steps

1. **Confirm approach with user** - Events filter vs separate section?
2. **Start with Business Admin** - Easiest to test
3. **Then Super Admin** - Reuse components
4. **Finally Discovery Page** - Most visible to customers

---

## Questions for User

1. **Events Display:** Do you prefer Events as a filter (Option A), separate section (Option B), or separate tab (Option C)?
2. ~~**Ticketing:** Should events link to WhatsApp for booking, or build in-app ticketing?~~ ✅ **CONFIRMED: WhatsApp booking (same as venues)**
3. **Image Upload:** Use same ImageUpload component as venues/products? ✅ **YES**
4. **Notifications:** Should users get notified about new events at their favorite venues?

## Event Booking Flow (WhatsApp)

✅ **CONFIRMED:** Events will use WhatsApp booking flow, same as venues:

```javascript
// When user clicks "Get Tickets" on event
const eventWhatsAppMessage = `Hi! I'd like to book tickets for:

📅 Event: ${event.name}
📍 Venue: ${event.venueName}
🗓️ Date: ${formatDate(event.startTime)}
⏰ Time: ${formatTime(event.startTime)}
💰 Price: €${event.ticketPrice} per person
👥 Guests: ${guestCount}

Total: €${event.ticketPrice * guestCount}

Please confirm availability!`;

const whatsappUrl = `https://wa.me/${venuePhone}?text=${encodeURIComponent(eventWhatsAppMessage)}`;
window.open(whatsappUrl, '_blank');
```

Backend will track:
- `bookingCount` - Number of confirmed bookings
- `totalGuests` - Total guests across all bookings
- Business manually updates these after WhatsApp confirmation

---

## Notes

- Backend is 100% ready - no Prof. Kristi tasks needed
- Events system will unlock nightlife revenue stream
- Night mode is perfect for events (clubs, parties, concerts)
- Can launch with manual event creation, add automation later
- Consider event analytics dashboard later (ticket sales, attendance)
