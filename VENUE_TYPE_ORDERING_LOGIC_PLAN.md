# Venue Type-Based Ordering Logic - Implementation Plan

**Date:** February 13, 2026  
**Goal:** Implement venue-specific ordering behavior based on venue type

---

## Business Requirements Analysis

### Current Situation
- All venues show the same menu (filtered by exclusions)
- All venues allow digital ordering via QR codes
- No differentiation between venue types

### New Requirements

**Restaurant Venues:**
- QR code shows menu in READ-ONLY mode (catalog view)
- NO "Add to Cart" buttons
- NO ordering functionality
- Shows "View Only" or "Menu Catalog - Please order with your waiter"
- Can reserve tables from OTHER venues (cross-venue reservation)

**Non-Restaurant Venues (Beach, Pool, Bar, etc.):**
- QR code allows full digital ordering
- "Add to Cart" buttons enabled
- Can place orders normally
- Can reserve restaurant tables (cross-venue reservation)

---

## Technical Analysis

### Existing Infrastructure

**1. Venue Type Field** ✅
- Database: `Venues` table has `Type` field (nvarchar)
- Backend: VenueController exposes `Type` in DTOs
- Frontend: Venue data includes `type` field

**2. Digital Ordering Toggle** ✅
- Database: `Venues.IsDigitalOrderingEnabled` (boolean)
- Currently used for venue-wide ordering control
- MenuPage already respects this flag

**3. Venue Exclusions** ✅
- Just implemented
- Controls which products show at which venues
- Works independently of ordering logic

### Current MenuPage Logic
```javascript
// MenuPage.jsx line ~200
const [isDigitalOrderingEnabled, setIsDigitalOrderingEnabled] = useState(true);

// Fetches venue data and sets ordering flag
const venueResponse = await fetch(`${API_URL}/venues/${VENUE_ID}`);
const venue = await venueResponse.json();
setIsDigitalOrderingEnabled(venue.isDigitalOrderingEnabled ?? true);

// Conditionally renders ordering controls
{isDigitalOrderingEnabled ? (
  <button onClick={() => addToCart(item)}>Add to Order</button>
) : (
  <div>View Only</div>
)}
```

---

## Implementation Strategy

### Option 1: Use Existing `IsDigitalOrderingEnabled` Flag (Recommended)
**Pros:**
- Already implemented and working
- No backend changes needed
- Simple and clean

**Cons:**
- Manual configuration required per venue
- Not automatic based on type

**Implementation:**
1. Business Admin/SuperAdmin sets `IsDigitalOrderingEnabled = false` for restaurant venues
2. MenuPage already handles this correctly
3. Done!

### Option 2: Automatic Based on Venue Type
**Pros:**
- Automatic behavior based on type
- No manual configuration needed
- Consistent across all restaurants

**Cons:**
- Requires backend logic changes
- Need to define which types disable ordering

**Implementation:**
1. Backend: Add logic to automatically set ordering behavior based on type
2. Frontend: Fetch venue type and apply rules
3. More complex but more maintainable

### Option 3: Hybrid Approach (Best)
**Pros:**
- Automatic defaults based on type
- Manual override capability
- Flexible and maintainable

**Cons:**
- Requires both backend and frontend changes

**Implementation:**
1. Backend: Add computed property that considers both type and manual flag
2. Frontend: Use computed property for ordering logic
3. Dashboard: Show automatic behavior with override option

---

## Recommended Implementation: Option 3 (Hybrid)

### Phase 1: Backend - Add Computed Property

**File:** `Entities/Venue.cs`

Add computed property:
```csharp
[NotMapped]
public bool AllowsDigitalOrdering
{
    get
    {
        // If manually set, respect that
        if (IsDigitalOrderingEnabled.HasValue)
            return IsDigitalOrderingEnabled.Value;
        
        // Otherwise, auto-determine based on type
        return Type?.ToLower() != "restaurant";
    }
}
```

**File:** `DTOs/VenueDto.cs`

Add to all venue DTOs:
```csharp
public bool AllowsDigitalOrdering { get; set; }
```

**File:** `Controllers/VenuesController.cs`

Map in all GET endpoints:
```csharp
AllowsDigitalOrdering = venue.AllowsDigitalOrdering
```

### Phase 2: Frontend - Update MenuPage

**File:** `frontend/src/pages/MenuPage.jsx`

Update to use new property:
```javascript
// Change from:
setIsDigitalOrderingEnabled(venue.isDigitalOrderingEnabled ?? true);

// To:
setIsDigitalOrderingEnabled(venue.allowsDigitalOrdering ?? true);
```

### Phase 3: Dashboard - Show Automatic Behavior

**Files:** 
- `BusinessAdminDashboard.jsx`
- `SuperAdminDashboard.jsx`

Update venue form to show:
```jsx
<div>
  <label>Digital Ordering</label>
  <select value={venueForm.isDigitalOrderingEnabled}>
    <option value="">Auto (based on type)</option>
    <option value="true">Enabled</option>
    <option value="false">Disabled</option>
  </select>
  {venueForm.type === 'Restaurant' && !venueForm.isDigitalOrderingEnabled && (
    <p className="text-xs text-zinc-400">
      Restaurants default to view-only mode
    </p>
  )}
</div>
```

---

## Table Reservation Logic (Cross-Venue)

### Current State
- Table reservation system exists (RESTAURANT_TABLE_RESERVATION_BACKEND_TASK.md)
- Backend endpoints ready
- Frontend not implemented yet

### Requirements
- Users at Beach/Pool/Bar can reserve restaurant tables
- Users at Restaurant can also reserve tables (for later time)
- Reservation button shows on MenuPage regardless of venue type

### Implementation

**File:** `frontend/src/pages/MenuPage.jsx`

Add reservation button:
```jsx
{/* Show reservation button if venue has restaurant type OR if viewing from non-restaurant */}
{(venueData?.type === 'Restaurant' || hasRestaurantVenues) && (
  <button
    onClick={() => setCurrentScreen('reservation')}
    className="w-full border border-stone-300 text-stone-700 py-4 px-6 rounded-full hover:bg-stone-50"
  >
    Reserve a Table
  </button>
)}
```

Add reservation screen (similar to checkout screen):
```jsx
if (currentScreen === 'reservation') {
  return <ReservationScreen />;
}
```

---

## User Experience Flow

### Scenario 1: Customer at Beach Club (Non-Restaurant)
1. Scans QR code at sunbed
2. MenuPage loads with `allowsDigitalOrdering = true`
3. Sees full menu with "Add to Cart" buttons
4. Can place food/drink orders
5. Can also click "Reserve a Table" to book restaurant

### Scenario 2: Customer at Restaurant
1. Scans QR code at table
2. MenuPage loads with `allowsDigitalOrdering = false`
3. Sees menu in READ-ONLY mode
4. Shows "Menu Catalog - Please order with your waiter"
5. Can click "Reserve a Table" to book for later time

### Scenario 3: Business Admin Configuration
1. Opens venue management
2. Creates new venue with type "Restaurant"
3. Digital ordering automatically set to "Disabled"
4. Can override if needed (e.g., for takeout counter)

---

## Implementation Steps

### Step 1: Backend Changes (Prof Kristi)
- [ ] Add `AllowsDigitalOrdering` computed property to `Venue` entity
- [ ] Add `AllowsDigitalOrdering` to all venue DTOs
- [ ] Map property in all venue controllers
- [ ] Test: GET /api/venues/{id} returns `allowsDigitalOrdering`

### Step 2: Frontend MenuPage Update
- [ ] Update `fetchVenueData()` to use `allowsDigitalOrdering`
- [ ] Test at restaurant venue (should show view-only)
- [ ] Test at beach venue (should allow ordering)

### Step 3: Dashboard Updates
- [ ] Add digital ordering dropdown to venue forms
- [ ] Show automatic behavior hint based on type
- [ ] Allow manual override

### Step 4: Table Reservation UI
- [ ] Add "Reserve a Table" button to MenuPage
- [ ] Create ReservationScreen component
- [ ] Integrate with backend reservation API
- [ ] Test cross-venue reservations

---

## Testing Checklist

### Ordering Logic
- [ ] Restaurant venue shows view-only mode
- [ ] Beach venue allows ordering
- [ ] Pool venue allows ordering
- [ ] Bar venue allows ordering
- [ ] Manual override works (restaurant with ordering enabled)

### Reservation Logic
- [ ] Can reserve from beach venue
- [ ] Can reserve from restaurant venue
- [ ] Reservation shows available times
- [ ] Confirmation works correctly

### Edge Cases
- [ ] Venue with no type defaults to ordering enabled
- [ ] Venue with type "Other" allows ordering
- [ ] Multiple restaurants show in reservation list
- [ ] Reservation from restaurant to same restaurant works

---

## Database Schema

### Current Schema
```sql
CREATE TABLE Venues (
    Id INT PRIMARY KEY,
    Name NVARCHAR(150),
    Type NVARCHAR(50),  -- 'Restaurant', 'Beach', 'Pool', 'Bar', etc.
    IsDigitalOrderingEnabled BIT,  -- NULL = auto, 0 = disabled, 1 = enabled
    ...
)
```

### Venue Types (Suggested)
- `Restaurant` - View-only menu, table reservations
- `Beach` - Full ordering, sunbed bookings
- `Pool` - Full ordering, sunbed bookings
- `Bar` - Full ordering
- `Rooftop` - Full ordering
- `Spa` - View-only or custom logic
- `Other` - Full ordering (default)

---

## API Endpoints Needed

### Existing (Already Available)
```
GET  /api/venues/{id}  - Get venue details (includes type, isDigitalOrderingEnabled)
GET  /api/venues/{id}/menu  - Get venue menu (respects exclusions)
POST /api/orders  - Place order
```

### Needed for Reservations
```
GET  /api/venues?type=Restaurant  - Get all restaurant venues
GET  /api/reservations/availability  - Get available time slots
POST /api/reservations  - Create reservation
```

---

## Timeline

**Estimated Time:** 4-6 hours

1. Backend computed property (Prof Kristi): 1 hour
2. Frontend MenuPage update: 30 minutes
3. Dashboard updates: 1 hour
4. Reservation UI: 2-3 hours
5. Testing: 1 hour

---

## Success Criteria

✅ Restaurant venues show view-only menu  
✅ Non-restaurant venues allow full ordering  
✅ Manual override works in dashboards  
✅ Reservation button shows on all venues  
✅ Can reserve restaurant tables from any venue  
✅ Automatic behavior based on venue type  
✅ Clear UI indicators for view-only mode  

---

## Next Steps

1. **Immediate:** Use existing `IsDigitalOrderingEnabled` flag
   - Set to `false` for restaurant venues in dashboard
   - MenuPage already handles this correctly
   - Quick win, works today!

2. **Short-term:** Implement hybrid approach
   - Backend adds computed property
   - Frontend uses new property
   - Dashboard shows automatic behavior

3. **Medium-term:** Add table reservation UI
   - Create ReservationScreen component
   - Integrate with backend API
   - Test cross-venue flow

---

**Ready to implement! Start with Step 1 (use existing flag) for immediate results, then enhance with automatic behavior.**
