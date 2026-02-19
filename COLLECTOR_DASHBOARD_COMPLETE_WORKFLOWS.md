# Collector Dashboard - Complete Workflows & Features

## Role Definition

**Collector** = Beach/venue staff member who:
- Walks around the venue with a mobile device
- Checks guests in/out at their sunbeds/tables
- Manages bookings in real-time
- Handles walk-in guests
- Monitors venue occupancy

---

## Core Workflows

### Workflow 1: Morning Shift Start

**Steps:**
1. Collector arrives at venue
2. Opens app on phone
3. Logs in with phone number + 4-digit PIN
4. Dashboard loads showing:
   - Venue name (BEACH)
   - Today's date
   - Total bookings for today
   - Current occupancy status
5. Reviews pending bookings for the day
6. Starts walking around venue

**Success Criteria:**
- ✅ Login successful
- ✅ Venue name displayed
- ✅ Today's bookings loaded
- ✅ Online status indicator shows "Connected"

---

### Workflow 2: Guest Arrives (Pre-booked)

**Scenario:** Guest with reservation arrives at sunbed A1

**Steps:**
1. Collector walks to sunbed A1
2. Guest says "I have a reservation"
3. Collector opens app
4. Sees booking in "Pending" list:
   ```
   A1 • VIP Section
   John Doe
   +355 69 123 4567
   2 guests
   [✓ Check In]
   ```
5. Taps "Check In" button
6. Button shows loading spinner
7. Success: Card turns green, status changes to "Checked In"
8. Toast notification: "John Doe checked in successfully"
9. Guest settles in

**Success Criteria:**
- ✅ Booking found quickly
- ✅ Check-in completes in <2 seconds
- ✅ Visual feedback (green card)
- ✅ Real-time update to backend

**Edge Cases:**
- Guest arrives at wrong sunbed → Collector searches by name
- Guest arrives early → Still allow check-in
- Guest no-show → Mark as no-show (future feature)

---

### Workflow 3: Guest Leaves

**Scenario:** Guest at sunbed A1 is leaving

**Steps:**
1. Guest signals they're leaving
2. Collector opens app
3. Finds booking (already "Checked In", green card)
4. Taps "Check Out" button
5. Button shows loading spinner
6. Success: Card turns gray/faded, status changes to "Checked Out"
7. Toast notification: "John Doe checked out successfully"
8. Sunbed A1 now available for next guest

**Success Criteria:**
- ✅ Check-out completes in <2 seconds
- ✅ Visual feedback (gray card)
- ✅ Unit becomes available
- ✅ Real-time update to backend

---

### Workflow 4: Walk-In Guest (No Reservation)

**Scenario:** Guest arrives without reservation, wants sunbed B3

**Steps:**
1. Guest asks "Is B3 available?"
2. Collector checks app
3. Sees B3 is not in bookings list (available)
4. Taps "➕ New Booking" button (floating action button)
5. Modal opens:
   ```
   Create Walk-In Booking
   
   Unit: [B3 ▼]
   Zone: [Regular Area ▼]
   Guest Name: [_____________]
   Phone: [_____________]
   Number of Guests: [2 ▼]
   
   [Cancel] [Create & Check In]
   ```
6. Fills in guest details
7. Taps "Create & Check In"
8. New booking created and immediately checked in
9. Guest settles in

**Success Criteria:**
- ✅ Quick unit selection
- ✅ Minimal required fields
- ✅ Auto check-in after creation
- ✅ Unit marked as occupied

**Backend Endpoint Needed:**
```
POST /api/collector/bookings
{
  "unitId": 123,
  "guestName": "Jane Smith",
  "guestPhone": "+355691234567",
  "numberOfGuests": 2,
  "autoCheckIn": true
}
```

---

### Workflow 5: Search for Guest

**Scenario:** Guest says "I have a reservation" but collector doesn't know which unit

**Steps:**
1. Collector taps search icon (🔍)
2. Search bar appears at top
3. Types guest name: "John"
4. Results filter in real-time:
   ```
   A1 • VIP Section
   John Doe
   +355 69 123 4567
   [✓ Check In]
   
   C5 • Regular Area
   John Smith
   +355 69 234 5678
   [✓ Check In]
   ```
5. Collector confirms with guest: "John Doe?"
6. Guest confirms
7. Taps "Check In" on correct booking

**Success Criteria:**
- ✅ Real-time search (no delay)
- ✅ Search by name or phone
- ✅ Clear results
- ✅ Easy to distinguish between similar names

---

### Workflow 6: Filter by Zone

**Scenario:** Collector is working in VIP Section only

**Steps:**
1. Taps "All Zones" dropdown
2. Selects "VIP Section"
3. List filters to show only VIP bookings
4. Collector focuses on VIP area
5. Later, taps "All Zones" to see everything again

**Success Criteria:**
- ✅ Instant filtering
- ✅ Clear visual indication of active filter
- ✅ Easy to reset filter

---

### Workflow 7: Handle Guest Issue

**Scenario:** Guest at A1 requests to move to A2

**Steps:**
1. Collector checks if A2 is available
2. Opens booking for A1
3. Taps "⋮" (more options)
4. Selects "Move to Different Unit"
5. Modal shows available units in same zone
6. Selects A2
7. Confirms move
8. Booking updates to show A2
9. Guest moves to A2

**Success Criteria:**
- ✅ See available units
- ✅ Move within same zone
- ✅ Update booking record
- ✅ Maintain check-in status

**Backend Endpoint Needed:**
```
PUT /api/collector/bookings/{id}/move
{
  "newUnitId": 124
}
```

---

### Workflow 8: Add Notes to Booking

**Scenario:** Guest has special request (extra towels, umbrella, etc.)

**Steps:**
1. Collector opens booking
2. Taps "Add Note" button
3. Text area appears
4. Types: "Requested extra towels"
5. Taps "Save"
6. Note saved to booking
7. Note visible to other staff (bartender, manager)

**Success Criteria:**
- ✅ Quick note entry
- ✅ Notes persist
- ✅ Notes visible to all staff

**Backend Endpoint Needed:**
```
PUT /api/collector/bookings/{id}/notes
{
  "notes": "Requested extra towels"
}
```

---

### Workflow 9: Real-Time Booking Notification

**Scenario:** Guest books online while collector is working

**Steps:**
1. Guest books sunbed C3 via mobile app
2. Booking created in backend
3. SignalR sends `BookingCreated` event
4. Collector's phone receives notification
5. New booking card appears at top of list with animation
6. Card has "NEW" badge
7. Collector sees: "C3 • Regular Area - New Booking!"
8. Collector walks to C3 to prepare

**Success Criteria:**
- ✅ Instant notification (<1 second)
- ✅ Visual indication (animation, badge)
- ✅ Sound/vibration (optional)
- ✅ No need to refresh

---

### Workflow 10: End of Shift

**Steps:**
1. Collector reviews all bookings
2. Checks for any still "Checked In" (guests still present)
3. Walks around to verify
4. Checks out any guests who left
5. Reviews stats:
   - Total bookings today: 42
   - Checked in: 38
   - Checked out: 38
   - No-shows: 4
6. Logs out
7. Hands off to next shift

**Success Criteria:**
- ✅ Clear overview of day's activity
- ✅ Easy to see outstanding check-ins
- ✅ Stats for reporting

---

## Additional Features

### Feature 1: Offline Mode

**Scenario:** Internet connection drops

**Behavior:**
1. App detects offline status
2. Shows "⚠️ Offline" indicator in header
3. Queues check-in/check-out actions locally
4. When connection returns:
   - Shows "⚡ Syncing..." indicator
   - Uploads queued actions
   - Shows "✓ Synced" confirmation
5. Continues normal operation

**Implementation:**
- Use IndexedDB for local storage
- Queue actions with timestamps
- Sync when online
- Handle conflicts (if any)

---

### Feature 2: Quick Actions

**Floating Action Button (FAB):**
```
[➕] (bottom right corner)
  ↓ Tap
  ┌─────────────────────┐
  │ ➕ New Walk-In      │
  │ 🔍 Search Guest     │
  │ 📊 View Stats       │
  │ 🔄 Refresh          │
  └─────────────────────┘
```

**Quick Swipe Actions (on booking cards):**
- Swipe right → Check In
- Swipe left → Check Out
- Long press → More options

---

### Feature 3: Booking Details Modal

**Tap on booking card to see full details:**
```
┌─────────────────────────────────┐
│ Booking Details                 │
├─────────────────────────────────┤
│ Unit: A1                        │
│ Zone: VIP Section               │
│ Status: Checked In              │
│                                 │
│ Guest Information:              │
│ Name: John Doe                  │
│ Phone: +355 69 123 4567         │
│ Guests: 2                       │
│                                 │
│ Timing:                         │
│ Booked: 10:00 AM                │
│ Checked In: 10:15 AM            │
│ Duration: 1h 45m                │
│                                 │
│ Notes:                          │
│ Requested extra towels          │
│                                 │
│ [Add Note] [Move Unit]          │
│ [Check Out] [Cancel Booking]    │
└─────────────────────────────────┘
```

---

### Feature 4: Stats Dashboard

**Tap "📊 Stats" to see:**
```
┌─────────────────────────────────┐
│ Today's Statistics              │
├─────────────────────────────────┤
│ Total Bookings: 42              │
│ Checked In: 35                  │
│ Checked Out: 30                 │
│ Currently Occupied: 5           │
│ No-Shows: 4                     │
│ Walk-Ins: 8                     │
│                                 │
│ Occupancy Rate: 70%             │
│ Average Duration: 3h 15m        │
│                                 │
│ By Zone:                        │
│ VIP Section: 15/20 (75%)        │
│ Regular Area: 20/30 (67%)       │
└─────────────────────────────────┘
```

---

### Feature 5: Unit Status View

**Alternative view: See all units at a glance**

**Toggle button:** [List View] / [Grid View]

**Grid View:**
```
┌─────────────────────────────────┐
│ VIP SECTION                     │
├─────────────────────────────────┤
│ [A1]  [A2]  [A3]  [A4]  [A5]   │
│  🟢    🟢    🔴    🟡    ⚪     │
│                                 │
│ REGULAR AREA                    │
├─────────────────────────────────┤
│ [B1]  [B2]  [B3]  [B4]  [B5]   │
│  🟢    🔴    🟢    🟢    ⚪     │
└─────────────────────────────────┘

Legend:
🟢 Checked In (occupied)
🟡 Pending (reserved, not checked in)
🔴 Checked Out (recently vacated)
⚪ Available
```

**Tap unit to see booking details or create walk-in**

---

### Feature 6: Notifications & Alerts

**Types of notifications:**

1. **New Booking:**
   - "New booking: C3 - John Doe"
   - Sound + vibration
   - Badge on app icon

2. **Guest Overdue:**
   - "A1 - John Doe has been checked in for 5 hours"
   - Gentle reminder

3. **Shift Handoff:**
   - "5 guests still checked in"
   - Summary for next shift

4. **System Alerts:**
   - "Connection restored"
   - "Sync complete"

---

### Feature 7: Multi-Language Support

**Languages:**
- English (default)
- Albanian (Shqip)
- Italian (Italiano)
- German (Deutsch)

**Settings:**
```
┌─────────────────────────────────┐
│ Settings                        │
├─────────────────────────────────┤
│ Language: [English ▼]           │
│ Notifications: [On]             │
│ Sound: [On]                     │
│ Vibration: [On]                 │
│ Theme: [Dark]                   │
│                                 │
│ [Save] [Cancel]                 │
└─────────────────────────────────┘
```

---

## Complete Feature List

### ✅ Core Features (MVP)
1. View today's bookings
2. Check in guests
3. Check out guests
4. Filter by zone
5. Filter by status
6. Search by name/phone
7. Real-time updates (SignalR)
8. Offline indicator

### 🔄 Enhanced Features (Phase 2)
9. Create walk-in bookings
10. Add notes to bookings
11. View booking details
12. Stats dashboard
13. Pull to refresh
14. Swipe actions
15. Floating action button

### 🎯 Advanced Features (Phase 3)
16. Move guest to different unit
17. Cancel booking
18. Mark as no-show
19. Unit grid view
20. Offline mode with sync
21. Push notifications
22. Multi-language support
23. Shift handoff report
24. Export daily report

---

## Backend Endpoints Summary

### Required for MVP:
1. `GET /api/collector/zones`
2. `GET /api/collector/bookings`
3. `POST /api/collector/bookings/{id}/check-in`
4. `POST /api/collector/bookings/{id}/check-out`

### Required for Phase 2:
5. `POST /api/collector/bookings` (create walk-in)
6. `PUT /api/collector/bookings/{id}/notes`
7. `GET /api/collector/stats`

### Required for Phase 3:
8. `PUT /api/collector/bookings/{id}/move`
9. `DELETE /api/collector/bookings/{id}` (cancel)
10. `POST /api/collector/bookings/{id}/no-show`
11. `GET /api/collector/units` (for grid view)

---

## User Stories

### As a Collector, I want to...

1. **See all bookings for my venue** so I know who's coming today
2. **Check in guests quickly** so they can start enjoying their time
3. **Check out guests** so the unit becomes available for others
4. **Filter by zone** so I can focus on my assigned area
5. **Search for guests** so I can find them even if I don't know their unit
6. **Create walk-in bookings** so I can accommodate guests without reservations
7. **Add notes** so I can remember special requests
8. **See real-time updates** so I don't miss new bookings
9. **Work offline** so I can continue working even with poor connection
10. **View stats** so I can report to my manager

---

## Success Metrics

**Performance:**
- Check-in/check-out: <2 seconds
- Search results: <500ms
- Real-time updates: <1 second
- App load time: <3 seconds

**Usability:**
- 95% of actions completed in <3 taps
- 100% mobile responsive
- Works on 3G connection
- Battery efficient (8+ hours)

**Business:**
- Reduce check-in time by 50%
- Increase occupancy tracking accuracy to 99%
- Enable real-time reporting
- Support 100+ bookings per day per collector

---

## Implementation Phases

### Phase 1: MVP (Week 1)
- Core booking list
- Check-in/check-out
- Basic filtering
- Real-time updates
- **Goal:** Functional for daily use

### Phase 2: Enhanced (Week 2)
- Walk-in bookings
- Search functionality
- Stats dashboard
- Notes feature
- **Goal:** Feature-complete

### Phase 3: Polish (Week 3)
- Offline mode
- Grid view
- Advanced actions
- Multi-language
- **Goal:** Production-ready

---

## Testing Scenarios

### Scenario 1: Busy Beach Day
- 50+ bookings
- Multiple check-ins happening simultaneously
- Walk-ins arriving
- Guests moving between units
- **Test:** App remains responsive

### Scenario 2: Poor Connection
- Intermittent WiFi
- 3G connection
- Offline periods
- **Test:** Actions queue and sync correctly

### Scenario 3: Multiple Collectors
- 3 collectors working same venue
- Simultaneous check-ins
- Real-time updates
- **Test:** No conflicts, all see same data

### Scenario 4: Edge Cases
- Guest arrives at wrong unit
- Double booking (system error)
- Guest leaves without checking out
- Collector forgets to check out guest
- **Test:** Graceful handling

---

## Next Steps

1. ✅ **Backend:** Prof Kristi implements collector endpoints
2. ✅ **Frontend:** Create collectorApi.js service
3. ✅ **Frontend:** Build MVP (Phase 1 features)
4. ✅ **Testing:** Test on real devices with real data
5. ✅ **Deploy:** Push to production
6. ✅ **Train:** Train collectors on how to use app
7. ✅ **Monitor:** Track usage and gather feedback
8. ✅ **Iterate:** Add Phase 2 & 3 features based on feedback

---

## Estimated Timeline

- **Backend Endpoints:** 3-4 hours (Prof Kristi)
- **Frontend MVP:** 8-10 hours
- **Testing & Bug Fixes:** 4-6 hours
- **Phase 2 Features:** 6-8 hours
- **Phase 3 Features:** 8-10 hours
- **Total:** 29-38 hours (4-5 days)

---

## Priority Matrix

```
High Priority (Must Have):
✅ View bookings
✅ Check-in/check-out
✅ Real-time updates
✅ Mobile responsive

Medium Priority (Should Have):
🔄 Walk-in bookings
🔄 Search
🔄 Stats
🔄 Notes

Low Priority (Nice to Have):
⏳ Offline mode
⏳ Grid view
⏳ Multi-language
⏳ Advanced actions
```
