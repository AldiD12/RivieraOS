# SuperAdmin Events Tab - Implementation Summary

**Date:** March 4, 2026  
**Status:** IN PROGRESS (90% complete)

---

## What's Been Done

### 1. SuperAdmin Events API (✅ COMPLETE)
**File:** `frontend/src/services/superAdminApi.js`

Added complete events API with all CRUD operations:
- `list(filters)` - Get all events with pagination and filters
- `getById(eventId)` - Get event details
- `create(eventData)` - Create new event
- `update(eventId, eventData)` - Update event
- `delete(eventId)` - Soft delete event
- `publish(eventId)` - Publish event
- `unpublish(eventId)` - Unpublish event
- `restore(eventId)` - Restore deleted event (SuperAdmin only)

### 2. EventsTab Component (✅ COMPLETE)
**File:** `frontend/src/pages/SuperAdminDashboard.jsx`

Created full-featured EventsTab component with:
- Business filter dropdown
- Venue filter dropdown (filtered by selected business)
- Status filter (all/published/draft/deleted)
- Event cards with flyer images
- Status badges (Published/Draft/Deleted)
- Business & venue info display
- Date/time display
- Ticket info (price, spots remaining)
- Action buttons:
  - Edit (for non-deleted events)
  - Publish/Unpublish toggle
  - Delete (soft delete)
  - Restore (for deleted events, SuperAdmin only)

### 3. State Management (✅ COMPLETE)
Added to SuperAdminDashboard:
```javascript
// Events state
const [events, setEvents] = useState([]);
const [eventsLoading, setEventsLoading] = useState(false);
const [editingEvent, setEditingEvent] = useState(null);
const [deletingEvent, setDeletingEvent] = useState(null);

// Modal states
const [showCreateEventModal, setShowCreateEventModal] = useState(false);
const [showEditEventModal, setShowEditEventModal] = useState(false);
const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
```

### 4. Navigation Tab (✅ COMPLETE)
Added "Events" tab to SuperAdmin navigation between "Venues & Zones" and "QR Codes"

### 5. Imports (✅ COMPLETE)
- Added `eventsApi` to superAdminApi imports
- Added EventModals imports (CreateEventModal, EditEventModal, DeleteEventModal)

---

## What's Left To Do

### 1. Add Events Tab Content to Switch Statement (⏳ TODO)
**Location:** `frontend/src/pages/SuperAdminDashboard.jsx` - around line 1720

Need to add before `case 'qr-generator':`:

```javascript
case 'events':
  return (
    <EventsTab
      events={events}
      businesses={businesses}
      venues={venues}
      selectedBusiness={selectedBusiness}
      onCreateEvent={() => setShowCreateEventModal(true)}
      onEditEvent={(event) => {
        setEditingEvent(event);
        setShowEditEventModal(true);
      }}
      onDeleteEvent={(event) => {
        setDeletingEvent(event);
        setShowDeleteEventModal(true);
      }}
      onTogglePublish={handleToggleEventPublish}
      onRestoreEvent={handleRestoreEvent}
      eventsLoading={eventsLoading}
    />
  );
```

### 2. Add Event Handler Functions (⏳ TODO)
**Location:** After other handler functions in SuperAdminDashboard

```javascript
// Fetch events
const fetchEvents = useCallback(async () => {
  try {
    setEventsLoading(true);
    const response = await eventsApi.list();
    setEvents(response.items || response);
  } catch (err) {
    console.error('Error fetching events:', err);
  } finally {
    setEventsLoading(false);
  }
}, []);

// Toggle publish/unpublish
const handleToggleEventPublish = async (event) => {
  try {
    if (event.isPublished) {
      await eventsApi.unpublish(event.id);
    } else {
      await eventsApi.publish(event.id);
    }
    await fetchEvents();
  } catch (err) {
    console.error('Error toggling event publish status:', err);
  }
};

// Restore deleted event
const handleRestoreEvent = async (eventId) => {
  try {
    await eventsApi.restore(eventId);
    await fetchEvents();
  } catch (err) {
    console.error('Error restoring event:', err);
  }
};

// Create event
const handleCreateEvent = async (eventData) => {
  try {
    await eventsApi.create(eventData);
    setShowCreateEventModal(false);
    await fetchEvents();
  } catch (err) {
    console.error('Error creating event:', err);
  }
};

// Update event
const handleUpdateEvent = async (eventId, eventData) => {
  try {
    await eventsApi.update(eventId, eventData);
    setShowEditEventModal(false);
    setEditingEvent(null);
    await fetchEvents();
  } catch (err) {
    console.error('Error updating event:', err);
  }
};

// Delete event
const handleDeleteEvent = async () => {
  if (!deletingEvent) return;
  
  try {
    await eventsApi.delete(deletingEvent.id);
    setShowDeleteEventModal(false);
    setDeletingEvent(null);
    await fetchEvents();
  } catch (err) {
    console.error('Error deleting event:', err);
  }
};
```

### 3. Add useEffect to Fetch Events (⏳ TODO)
**Location:** With other useEffect hooks

```javascript
// Fetch events on mount
useEffect(() => {
  fetchEvents();
}, [fetchEvents]);
```

### 4. Add Event Modals to JSX (⏳ TODO)
**Location:** At the end of the component, with other modals

```javascript
{/* Event Modals */}
{showCreateEventModal && (
  <CreateEventModal
    isOpen={showCreateEventModal}
    onClose={() => setShowCreateEventModal(false)}
    onSubmit={handleCreateEvent}
    businesses={businesses}
    venues={venues}
  />
)}

{showEditEventModal && editingEvent && (
  <EditEventModal
    isOpen={showEditEventModal}
    onClose={() => {
      setShowEditEventModal(false);
      setEditingEvent(null);
    }}
    onSubmit={(data) => handleUpdateEvent(editingEvent.id, data)}
    event={editingEvent}
    businesses={businesses}
    venues={venues}
  />
)}

{showDeleteEventModal && deletingEvent && (
  <DeleteEventModal
    isOpen={showDeleteEventModal}
    onClose={() => {
      setShowDeleteEventModal(false);
      setDeletingEvent(null);
    }}
    onConfirm={handleDeleteEvent}
    event={deletingEvent}
  />
)}
```

---

## Features Implemented

### SuperAdmin-Specific Features
1. **Cross-Business View** - See events from all businesses
2. **Business Filtering** - Filter events by business
3. **Venue Filtering** - Filter events by venue (within selected business)
4. **Status Filtering** - Filter by published/draft/deleted
5. **Restore Deleted Events** - SuperAdmin can restore soft-deleted events
6. **Full CRUD** - Create, edit, delete any event
7. **Publish Control** - Publish/unpublish any event

### UI Features
1. **Event Cards** - Visual cards with flyer images
2. **Status Badges** - Color-coded status indicators
3. **Business/Venue Info** - Clear display of event location
4. **Date/Time Display** - Formatted event timing
5. **Ticket Info** - Price and availability display
6. **Action Buttons** - Context-aware actions based on event status

---

## Design System Compliance

✅ Industrial Minimalist (Staff-Facing)
- Black/zinc color scheme
- Sharp corners (rounded-lg)
- Flat design with borders
- High contrast white on black
- Tight spacing (p-4, p-6)
- Dense grid layouts

---

## Next Steps

1. Complete the remaining TODO items above
2. Build and test
3. Commit changes
4. Deploy to production
5. Test with real data

---

## Testing Checklist

After implementation:
- [ ] Events tab appears in navigation
- [ ] Can view all events across businesses
- [ ] Business filter works
- [ ] Venue filter works (filtered by business)
- [ ] Status filter works
- [ ] Can create new event
- [ ] Can edit existing event
- [ ] Can delete event (soft delete)
- [ ] Can restore deleted event
- [ ] Can publish/unpublish event
- [ ] Event cards display correctly
- [ ] Flyer images load
- [ ] Status badges show correct colors
- [ ] Date/time formats correctly
- [ ] Ticket info displays when applicable

---

## Backend Requirements

The SuperAdmin Events API endpoints must be deployed and working:
- `GET /api/superadmin/Events` - List events (paginated)
- `GET /api/superadmin/Events/{id}` - Get event details
- `POST /api/superadmin/Events` - Create event
- `PUT /api/superadmin/Events/{id}` - Update event
- `DELETE /api/superadmin/Events/{id}` - Delete event
- `POST /api/superadmin/Events/{id}/publish` - Publish event
- `POST /api/superadmin/Events/{id}/unpublish` - Unpublish event
- `POST /api/superadmin/Events/{id}/restore` - Restore event

**Note:** These endpoints should already be deployed based on the Events API documentation.

---

## Files Modified

1. `frontend/src/services/superAdminApi.js` - Added eventsApi
2. `frontend/src/pages/SuperAdminDashboard.jsx` - Added EventsTab component, state, navigation

## Files To Be Modified

1. `frontend/src/pages/SuperAdminDashboard.jsx` - Add handlers, useEffect, tab content case, modals JSX

---

## Estimated Time Remaining

- Add remaining code: 15 minutes
- Build and test: 10 minutes
- Fix any issues: 15 minutes
- **Total:** ~40 minutes

