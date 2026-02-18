# Bartender & Collector Dashboard Analysis

**Date:** February 18, 2026  
**Status:** ANALYSIS ONLY - NO CODE CHANGES

---

## 🔍 CURRENT LOGIC BREAKDOWN

### 1. AUTHENTICATION FLOW (LoginPage.jsx)

**Staff Login Process:**

1. User enters phone number + 4-digit PIN
2. Frontend tries multiple phone formats:
   - Normalized (no spaces/dashes)
   - Original format
   - With leading 0
   - Without leading 0
3. Calls: `POST /api/auth/login/pin`
4. Backend returns:
   ```json
   {
     "token": "jwt-token",
     "userId": 123,
     "fullName": "John Doe",
     "role": "Bartender" or "Collector",
     "businessId": 1,
     "venueId": 5,        // Only for Collectors
     "venueName": "Beach Club"  // Only for Collectors
   }
   ```
5. Frontend stores in localStorage:
   - `token`
   - `userId`
   - `userName`
   - `phoneNumber`
   - `businessId`
   - `role` (exact role: "Bartender" or "Collector")
   - `venueId` (Collectors only)
   - `venueName` (Collectors only)

**Routing Logic:**
```javascript
const roleRoutes = {
  'Manager': '/admin',
  'Bartender': '/bar',
  'Collector': '/collector'
};
```

---

### 2. BAR DISPLAY (/bar) - Bartender Dashboard

**File:** `frontend/src/pages/BarDisplay.jsx`

**Purpose:** Kitchen/Bar order queue management

**Current Logic:**

#### A. Initial Load
```javascript
useEffect(() => {
  fetchOrders();  // Fetch active orders on mount
}, []);
```

#### B. Data Fetching
```javascript
const fetchOrders = async () => {
  const data = await businessApi.orders.getActive();
  // API: GET /api/business/orders/active
  // Uses token from localStorage
  setOrders(data);
};
```

#### C. SignalR Real-Time Updates
```javascript
// Listens for:
connection.on('NewOrder', (order) => {
  fetchOrders(); // Refresh when new order arrives
});

connection.on('OrderStatusChanged', (data) => {
  fetchOrders(); // Refresh when status changes
});
```

#### D. Order Status Management
```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  await businessApi.orders.updateStatus(orderId, { status: newStatus });
  // API: PUT /api/business/orders/{orderId}/status
  await fetchOrders();
};
```

#### E. Status Flow
```
Pending/New → Preparing → Ready → Delivered
```

#### F. Display Logic
- Groups orders by status (4 columns)
- Shows order number, unit code, zone, customer name
- Shows order items with quantities
- Shows time since order placed
- Action button: "Mark as [NextStatus]"

---

### 3. COLLECTOR DASHBOARD (/collector) - Collector Dashboard

**File:** `frontend/src/pages/CollectorDashboard.jsx`

**Purpose:** Sunbed/table booking management

**Current Logic:**

#### A. Venue Assignment (NEW LOGIC)
```javascript
const loadAssignedVenue = async () => {
  // Get assigned venue from localStorage (set during login)
  const venueId = localStorage.getItem('venueId');
  const venueName = localStorage.getItem('venueName');
  
  if (!venueId) {
    alert('No venue assigned. Please contact your manager.');
    return;
  }
  
  setSelectedVenue({
    id: parseInt(venueId),
    name: venueName
  });
};
```

**Key Point:** Collectors are now assigned to a specific venue during login. They can ONLY see/manage that venue.

#### B. Zone Selection
```javascript
useEffect(() => {
  if (selectedVenue) {
    fetchZones();  // Fetch zones for assigned venue
  }
}, [selectedVenue]);

const fetchZones = async () => {
  const data = await businessApi.zones.list(selectedVenue.id);
  // API: GET /api/business/venues/{venueId}/zones
  setZones(data);
  if (data.length > 0) {
    setSelectedZone(data[0]);  // Auto-select first zone
  }
};
```

#### C. Units Display
```javascript
const fetchUnits = async () => {
  const data = await businessApi.units.list(selectedVenue.id, { zoneId: selectedZone.id });
  // API: GET /api/business/venues/{venueId}/units?zoneId={zoneId}
  setUnits(data);
};
```

**Unit Display:**
- Grid of units (8 columns)
- Each unit shows:
  - Unit code (e.g., "1", "2", "3")
  - Status badge (Available/Reserved/Occupied)
  - Guest name (if occupied/reserved)
- Color-coded by status:
  - Green: Available
  - Blue: Reserved
  - Red: Occupied
  - Gray: Maintenance

#### D. Booking Management

**Quick Booking (Walk-ins):**
```javascript
// When clicking an Available unit
const handleQuickBook = async (e) => {
  // POST /api/business/venues/{venueId}/bookings
  const response = await fetch(API_URL + '/business/venues/' + selectedVenue.id + '/bookings', {
    method: 'POST',
    body: JSON.stringify({
      zoneUnitId: selectedUnit.id,
      guestName: quickBookForm.customerName,
      guestPhone: quickBookForm.customerPhone,
      guestCount: quickBookForm.guestCount,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
    })
  });
  
  // Auto check-in for walk-ins
  await handleCheckIn(booking.id);
};
```

**Check-In:**
```javascript
const handleCheckIn = async (bookingId) => {
  // POST /api/business/venues/{venueId}/bookings/{bookingId}/check-in
  await fetch(API_URL + '/business/venues/' + selectedVenue.id + '/bookings/' + bookingId + '/check-in', {
    method: 'POST'
  });
};
```

**Check-Out:**
```javascript
const handleCheckOut = async (bookingId) => {
  // POST /api/business/venues/{venueId}/bookings/{bookingId}/check-out
  await fetch(API_URL + '/business/venues/' + selectedVenue.id + '/bookings/' + bookingId + '/check-out', {
    method: 'POST'
  });
};
```

**Cancel:**
```javascript
const handleCancelBooking = async (bookingId) => {
  // POST /api/business/venues/{venueId}/bookings/{bookingId}/cancel
  await fetch(API_URL + '/business/venues/' + selectedVenue.id + '/bookings/' + bookingId + '/cancel', {
    method: 'POST'
  });
};
```

#### E. SignalR Real-Time Updates
```javascript
connection.on('BookingCreated', (booking) => {
  if (booking.venueId === selectedVenue.id) {
    fetchUnits();
    fetchBookings();
  }
});

connection.on('BookingStatusChanged', (data) => {
  fetchUnits();
  fetchBookings();
});
```

---

## 🚨 WHAT COULD BE MISSING / NOT WORKING

### Potential Issues:

#### 1. **Backend API Endpoints**
**Check if these exist:**
- ✅ `POST /api/auth/login/pin` - Should exist (role mismatch was fixed)
- ❓ `GET /api/business/orders/active` - Does this exist?
- ❓ `PUT /api/business/orders/{orderId}/status` - Does this exist?
- ❓ `GET /api/business/venues/{venueId}/zones` - Does this exist?
- ❓ `GET /api/business/venues/{venueId}/units` - Does this exist?
- ❓ `GET /api/business/venues/{venueId}/bookings/active` - Does this exist?
- ❓ `POST /api/business/venues/{venueId}/bookings/{bookingId}/check-in` - Does this exist?
- ❓ `POST /api/business/venues/{venueId}/bookings/{bookingId}/check-out` - Does this exist?
- ❓ `POST /api/business/venues/{venueId}/bookings/{bookingId}/cancel` - Does this exist?

#### 2. **Authorization Issues**
**Check backend policies:**
- Does `[Authorize(Policy = "Bartender")]` exist on orders endpoints?
- Does `[Authorize(Policy = "Collector")]` exist on bookings endpoints?
- Are the policies correctly configured in backend?

#### 3. **JWT Token Claims**
**Check if token includes:**
- `role` claim (should be "Bartender" or "Collector")
- `businessId` claim (needed for business-scoped queries)
- `venueId` claim (needed for Collectors)

#### 4. **SignalR Hub**
**Check if BeachHub has:**
- `NewOrder` event
- `OrderStatusChanged` event
- `BookingCreated` event
- `BookingStatusChanged` event

#### 5. **Data Structure Mismatches**
**Check if backend returns:**
- Orders with: `id`, `orderNumber`, `status`, `items`, `unitCode`, `zoneName`, `customerName`, `createdAt`
- Units with: `id`, `unitCode`, `unitType`, `status`, `basePrice`
- Bookings with: `id`, `zoneUnitId`, `guestName`, `guestPhone`, `guestCount`, `startTime`, `status`, `checkedInAt`, `checkedOutAt`

---


## 📊 WHAT TO CHECK FIRST

### Step 1: Test Login
1. Create a Bartender staff member in BusinessAdminDashboard
2. Set phone number and PIN
3. Try to login at `/login`
4. Check browser console for errors
5. Check if redirected to `/bar`

### Step 2: Check Network Requests
**Open browser DevTools → Network tab**

**For Bartender (/bar):**
- Look for: `GET /api/business/orders/active`
- Status code: 200 = working, 401 = auth issue, 404 = endpoint missing
- Check response data structure

**For Collector (/collector):**
- Look for: `GET /api/business/venues/{venueId}/zones`
- Look for: `GET /api/business/venues/{venueId}/units`
- Look for: `GET /api/business/venues/{venueId}/bookings/active`
- Check status codes and responses

### Step 3: Check Console Errors
**Look for:**
- "Failed to fetch" = Network/CORS issue
- "401 Unauthorized" = Token/auth issue
- "404 Not Found" = Endpoint doesn't exist
- "403 Forbidden" = Authorization policy issue
- "500 Internal Server Error" = Backend crash

### Step 4: Check localStorage
**Open DevTools → Application → Local Storage**

**Should have:**
- `token` = JWT token
- `role` = "Bartender" or "Collector"
- `businessId` = number
- `venueId` = number (Collectors only)
- `venueName` = string (Collectors only)

---

## 🔧 MOST LIKELY ISSUES

### Issue #1: Missing Backend Endpoints
**Symptom:** 404 errors in network tab

**Solution:** Prof Kristi needs to create:
- Orders controller with `getActive()` and `updateStatus()` methods
- Bookings controller with check-in/check-out/cancel methods

---

### Issue #2: Authorization Policy Not Configured
**Symptom:** 403 Forbidden errors

**Backend needs:**
```csharp
// In Startup.cs or Program.cs
services.AddAuthorization(options =>
{
    options.AddPolicy("Bartender", policy => 
        policy.RequireRole("Bartender"));
    
    options.AddPolicy("Collector", policy => 
        policy.RequireRole("Collector"));
});
```

---

### Issue #3: JWT Token Missing Claims
**Symptom:** Backend can't identify user's role/business

**Backend needs to include in JWT:**
```csharp
var claims = new[]
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Role, user.Role),
    new Claim("businessId", user.BusinessId.ToString()),
    new Claim("venueId", user.VenueId?.ToString() ?? ""), // For Collectors
};
```

---

### Issue #4: Venue Assignment Not Saved
**Symptom:** Collector sees "No venue assigned" alert

**Check:**
1. Does User entity have `VenueId` field?
2. Is `VenueId` set when creating Collector staff?
3. Does login endpoint return `venueId` and `venueName`?

---

### Issue #5: SignalR Not Working
**Symptom:** No real-time updates, must refresh manually

**Check:**
1. Is SignalR hub configured in backend?
2. Is CORS configured for SignalR?
3. Are events being broadcast from backend?

---

## 📝 TESTING CHECKLIST

### Bartender Dashboard (/bar)
- [ ] Can login with phone + PIN
- [ ] Redirects to `/bar`
- [ ] Shows "Loading orders..." initially
- [ ] Displays active orders (or "No orders")
- [ ] Can click "Mark as Preparing" on Pending orders
- [ ] Can click "Mark as Ready" on Preparing orders
- [ ] Can click "Mark as Delivered" on Ready orders
- [ ] SignalR shows "LIVE" (green) when connected
- [ ] New orders appear automatically (test with customer order)
- [ ] Status changes update automatically

### Collector Dashboard (/collector)
- [ ] Can login with phone + PIN
- [ ] Redirects to `/collector`
- [ ] Shows assigned venue name
- [ ] Shows zones dropdown
- [ ] Shows units grid
- [ ] Units show correct status colors
- [ ] Can click Available unit → Quick booking modal opens
- [ ] Can create walk-in booking
- [ ] Booking auto-checks-in
- [ ] Unit changes to "Occupied" status
- [ ] Can click Occupied unit → Booking details modal opens
- [ ] Can check-out guest
- [ ] Unit changes back to "Available"
- [ ] Can cancel booking
- [ ] SignalR shows "LIVE" when connected

---

## 🎯 SUMMARY

**Current Logic:**
1. ✅ Login flow is implemented
2. ✅ Routing is configured
3. ✅ Frontend UI is complete
4. ✅ SignalR integration is ready
5. ✅ Venue assignment logic is implemented

**What's Likely Missing:**
1. ❓ Backend API endpoints for orders
2. ❓ Backend API endpoints for bookings
3. ❓ Authorization policies for Bartender/Collector
4. ❓ JWT token claims (role, businessId, venueId)
5. ❓ SignalR hub events

**Next Steps:**
1. Test login for Bartender and Collector
2. Check browser console and network tab for errors
3. Identify which specific endpoints are missing
4. Create task list for Prof Kristi based on findings

