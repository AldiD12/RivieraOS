# SuperAdmin Venues & Zones Implementation Plan

## Current Status
❌ SuperAdmin Venues tab is INCOMPLETE - missing all features from Business Admin

## What Business Admin Has (That SuperAdmin Needs)

### 1. Venue Management
- ✅ List all venues for selected business
- ✅ Create venue button
- ✅ Create venue modal with form:
  - Name (required)
  - Type dropdown (BEACH, POOL, RESTAURANT, BAR, CAFE, OTHER) - required
  - Description
  - Address
  - Image URL
  - Latitude/Longitude
  - Ordering Enabled toggle
- ✅ Edit venue (click venue card)
- ✅ Delete venue button
- ✅ Toggle venue active/inactive
- ✅ Venue cards showing: name, type, address, status

### 2. Zone Management (Two-Column Layout)
- ✅ Left column: Venue list
- ✅ Right column: Zones for selected venue
- ✅ Create zone button (when venue selected)
- ✅ Create zone modal with form:
  - Name (required)
  - Zone Type dropdown (sunbed, table, cabana, vip, regular)
  - Capacity Per Unit (number)
  - Base Price (number)
  - Auto-generated Prefix (from zone name)
  - Preview of unit codes (e.g., "VIP-1, VIP-2, VIP-3...")
- ✅ Edit zone
- ✅ Delete zone
- ✅ Zone cards showing: name, type, capacity, price, unit count

### 3. Unit Management
- ✅ "Manage Units" button on each zone card
- ✅ Navigate to `/admin/zones/{zoneId}/units` (ZoneUnitsManager page)
- ✅ Bulk create units
- ✅ Individual unit management

### 4. Visual Sunbed Mapper
- ✅ "Visual Mapper" button on venue cards
- ✅ Navigate to `/admin/venues/{venueId}/mapper` (SunbedMapper page)
- ✅ Drag-and-drop unit positioning

### 5. QR Code Generation
- ✅ "Generate QR" button on zone cards
- ✅ Navigate to QR Generator with pre-selected venue/zone

## What SuperAdmin ADDITIONALLY Needs

### 6. Cross-Business Management
- ❌ View venues across ALL businesses
- ❌ Filter venues by business
- ❌ Business selector dropdown at top
- ❌ Bulk operations across businesses

### 7. Platform-Level Controls
- ❌ Enable/disable booking features per business
- ❌ Set platform-wide venue limits
- ❌ Override business settings
- ❌ View venue analytics across all businesses

---

## Implementation Steps

### Step 1: Copy Venue List & Create Modal ✅ COMPLETE
**Status:** DONE - Duplicate modals removed, all handlers verified
**File:** `frontend/src/pages/SuperAdminDashboard.jsx`
**What was added:**
- ✅ Venue list grid (same as Business Admin)
- ✅ Create Venue button
- ✅ Create Venue modal with all fields
- ✅ Edit Venue modal
- ✅ Create Zone modal
- ✅ Edit Zone modal
- ✅ handleCreateVenue function
- ✅ handleEditVenue function
- ✅ handleDeleteVenue function
- ✅ handleCreateZone function
- ✅ handleEditZone function
- ✅ handleDeleteZone function
- ✅ handleVenueFormChange function
- ✅ handleZoneFormChange function
- ✅ Two-column layout (venues left, zones right)
- ✅ Visual Mapper button (navigate to `/admin/venues/{id}/mapper`)
- ✅ Manage Units button (navigate to `/admin/zones/{id}/units`)
- ✅ Business selector check

**See:** `SUPERADMIN_DUPLICATE_MODALS_FIX.md` for details

### Step 2: Add Two-Column Layout for Zones ✅
**What to add:**
- Left column: Venue cards (clickable)
- Right column: Zones for selected venue
- selectedVenue state
- Create Zone button (when venue selected)
- Create Zone modal with all fields
- handleCreateZone function
- handleEditZone function
- handleDeleteZone function

### Step 3: Add Zone Unit Management Links ✅
**What to add:**
- "Manage Units" button on zone cards
- Navigate to `/admin/zones/{zoneId}/units`
- Ensure ZoneUnitsManager works for SuperAdmin

### Step 4: Add Visual Mapper Links ✅
**What to add:**
- "Visual Mapper" button on venue cards
- Navigate to `/admin/venues/{venueId}/mapper`
- Ensure SunbedMapper works for SuperAdmin

### Step 5: Add QR Generator Integration ✅
**What to add:**
- "Generate QR" button on zone cards
- Navigate to QR Generator tab with pre-selected venue/zone
- Pass venue/zone context via state

### Step 6: Add Business Selector (SuperAdmin Only) ✅
**What to add:**
- Business dropdown at top of Venues tab
- Filter venues by selected business
- Show "All Businesses" option
- Cross-business venue view

### Step 7: Add Platform Controls (SuperAdmin Only) ✅
**What to add:**
- Enable/disable booking toggle per business
- Venue limit settings
- Override controls
- Platform analytics

---

## Code Structure

### State Variables Needed
```javascript
// Venues
const [venues, setVenues] = useState([]);
const [selectedVenue, setSelectedVenue] = useState(null);
const [venuesLoading, setVenuesLoading] = useState(false);

// Zones
const [zones, setZones] = useState([]);
const [zonesLoading, setZonesLoading] = useState(false);

// Modals
const [showCreateVenueModal, setShowCreateVenueModal] = useState(false);
const [showEditVenueModal, setShowEditVenueModal] = useState(false);
const [showCreateZoneModal, setShowCreateZoneModal] = useState(false);
const [showEditZoneModal, setShowEditZoneModal] = useState(false);
const [editingVenue, setEditingVenue] = useState(null);
const [editingZone, setEditingZone] = useState(null);

// Forms
const [venueForm, setVenueForm] = useState({
  name: '',
  type: '',
  description: '',
  address: '',
  imageUrl: '',
  latitude: null,
  longitude: null,
  orderingEnabled: true
});

const [zoneForm, setZoneForm] = useState({
  name: '',
  zoneType: '',
  capacityPerUnit: 1,
  basePrice: 0,
  prefix: ''
});
```

### API Calls Needed
```javascript
// Venues
await venueApi.list(businessId);
await venueApi.create(businessId, venueData);
await venueApi.update(businessId, venueId, venueData);
await venueApi.delete(businessId, venueId);
await venueApi.toggleActive(businessId, venueId);

// Zones
await zoneApi.list(businessId, venueId);
await zoneApi.create(businessId, venueId, zoneData);
await zoneApi.update(businessId, venueId, zoneId, zoneData);
await zoneApi.delete(businessId, venueId, zoneId);
```

---

## Priority Order

1. **HIGH**: Venue list + Create/Edit/Delete (Step 1)
2. **HIGH**: Zone management + Two-column layout (Step 2)
3. **MEDIUM**: Unit management links (Step 3)
4. **MEDIUM**: Visual mapper links (Step 4)
5. **MEDIUM**: QR generator integration (Step 5)
6. **LOW**: Business selector (Step 6)
7. **LOW**: Platform controls (Step 7)

---

## Estimated Time
- Step 1: 30 minutes
- Step 2: 45 minutes
- Step 3: 15 minutes
- Step 4: 15 minutes
- Step 5: 20 minutes
- Step 6: 30 minutes
- Step 7: 45 minutes

**Total: ~3 hours**

---

## Testing Checklist

After implementation:
- [ ] Can create venue for selected business
- [ ] Can edit venue details
- [ ] Can delete venue
- [ ] Can toggle venue active/inactive
- [ ] Can create zone for selected venue
- [ ] Can edit zone details
- [ ] Can delete zone
- [ ] "Manage Units" button navigates correctly
- [ ] "Visual Mapper" button navigates correctly
- [ ] "Generate QR" button works
- [ ] Business selector filters venues correctly
- [ ] All modals open/close properly
- [ ] Form validation works
- [ ] Error messages display correctly

---

## Current Implementation Status

**SuperAdmin Venues Tab:**
- ❌ No venue list
- ❌ No create venue button
- ❌ No zone management
- ❌ No unit management links
- ❌ No visual mapper links
- ❌ No QR generator links

**Business Admin Venues Tab:**
- ✅ Complete venue management
- ✅ Complete zone management
- ✅ Unit management links
- ✅ Visual mapper links
- ✅ QR generator integration

**Goal:** SuperAdmin = Business Admin features + Cross-business controls

---

## Next Action
Start with Step 1: Copy venue list and create modal from Business Admin to SuperAdmin.
