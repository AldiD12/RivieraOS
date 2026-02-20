# Frontend Implementation Plan - February 19, 2026

Based on Kristi's backend changes, here's what we need to implement in the frontend.

---

## Priority 1: CollectorDashboard (CRITICAL)

### Current State:
- Using mock/hardcoded data
- No real API integration
- Status updates don't persist

### What We Need to Do:

#### 1. Create Collector API Service
**File:** `frontend/src/services/collectorApi.js` (NEW)

```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://blackbear-services.azurewebsites.net';

export const collectorApi = {
  // Get all units for collector's venue
  getUnits: async () => {
    const response = await axios.get(`${API_URL}/api/collector/units`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // Update unit status
  updateUnitStatus: async (unitId, status, notes = null) => {
    const response = await axios.put(
      `${API_URL}/api/collector/units/${unitId}/status`,
      { status, notes },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    return response.data;
  }
};
```

#### 2. Update CollectorDashboard.jsx
**Changes needed:**
- Replace mock data with API call
- Handle loading states
- Handle "No venue assigned" error (403)
- Display current booking info
- Show only available transitions from API

---

## Priority 2: SuperAdminDashboard - Staff Management

### Current State:
- Staff creation modal exists
- No venue assignment field

### What We Need to Do:

#### 1. Update StaffModals.jsx
**Add venue dropdown to CreateStaffModal:**
```javascript
// Add venue selection
<select 
  value={formData.venueId || ''} 
  onChange={(e) => setFormData({...formData, venueId: e.target.value || null})}
>
  <option value="">No Venue (Office Staff)</option>
  {venues
    .filter(v => v.businessId === selectedBusinessId)
    .map(v => (
      <option key={v.id} value={v.id}>{v.name}</option>
    ))
  }
</select>
```

#### 2. Update superAdminApi.js
**Add venueId to user creation:**
```javascript
createUser: async (businessId, userData) => {
  const response = await axios.post(
    `${API_URL}/api/superadmin/businesses/${businessId}/users`,
    {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      pin: userData.pin,
      role: userData.role,
      venueId: userData.venueId || null  // ← NEW
    },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
  return response.data;
}
```

#### 3. Display Venue in Staff List
**Update SuperAdminDashboard.jsx:**
```javascript
// In staff table, add column:
<td>{user.venueName || 'No Venue'}</td>
```

---

## Priority 3: MenuPage - Digital Ordering Toggle

### Current State:
- Always shows "Add to Cart" buttons
- No check for venue settings

### What We Need to Do:

#### Update MenuPage.jsx
```javascript
// After fetching venue data:
const [venue, setVenue] = useState(null);

useEffect(() => {
  // ... fetch venue
  if (!venue.isDigitalOrderingEnabled) {
    // Show message instead of cart
  }
}, []);

// In product card:
{venue?.isDigitalOrderingEnabled ? (
  <button onClick={() => addToCart(product)}>Add to Cart</button>
) : (
  <p className="text-stone-500">Please order at the bar</p>
)}
```

---

## Priority 4: BarDisplay - Show Unit Code

### Current State:
- Shows orders without unit information
- SignalR receives unit data but doesn't display it

### What We Need to Do:

#### Update BarDisplay.jsx
```javascript
// In order card, add:
<div className="text-sm text-zinc-400">
  {order.unitCode && (
    <span>Unit: {order.unitCode}</span>
  )}
</div>
```

---

## Implementation Order

### Phase 1: CollectorDashboard (TODAY)
1. ✅ Create `collectorApi.js`
2. ✅ Update `CollectorDashboard.jsx` to use real API
3. ✅ Test with real collector account
4. ✅ Handle error cases (no venue, 403, etc.)

### Phase 2: SuperAdmin Staff (TODAY)
1. ✅ Update `StaffModals.jsx` - add venue dropdown
2. ✅ Update `superAdminApi.js` - include venueId
3. ✅ Update staff list to show venue
4. ✅ Test creating collector with venue

### Phase 3: MenuPage Toggle (OPTIONAL - LOW PRIORITY)
1. ⏸️ Add digital ordering check
2. ⏸️ Show appropriate UI based on flag

### Phase 4: BarDisplay Enhancement (OPTIONAL)
1. ⏸️ Display unit code on orders
2. ⏸️ Test with SignalR updates

---

## Testing Checklist

### CollectorDashboard:
- [ ] Login as collector with venue assigned
- [ ] Verify units load from API
- [ ] Change unit status (Available → Occupied)
- [ ] Verify booking auto-completion when setting to Available
- [ ] Test with collector without venue (should show error)
- [ ] Verify only valid transitions show as buttons

### SuperAdmin Staff:
- [ ] Create new collector with venue assignment
- [ ] Verify venue dropdown filters by business
- [ ] Create staff without venue (office staff)
- [ ] Edit existing staff to change venue
- [ ] Verify venue name shows in staff list

---

## Error Handling

### CollectorDashboard:
```javascript
try {
  const data = await collectorApi.getUnits();
  setUnits(data);
} catch (error) {
  if (error.response?.status === 403) {
    setError('No venue assigned to your account. Contact admin.');
  } else {
    setError('Failed to load units. Please try again.');
  }
}
```

### SuperAdmin Staff:
```javascript
try {
  await superAdminApi.createUser(businessId, userData);
} catch (error) {
  if (error.response?.data?.includes('Venue not found')) {
    setError('Selected venue does not belong to this business');
  } else {
    setError(error.response?.data || 'Failed to create user');
  }
}
```

---

## Ready to Start?

**Let me know if you want me to:**
1. ✅ Implement CollectorDashboard API integration (Priority 1)
2. ✅ Implement SuperAdmin venue assignment (Priority 2)
3. ✅ Both at the same time
4. ⏸️ Something else first

I recommend starting with CollectorDashboard since that's the most critical feature that's currently broken.
