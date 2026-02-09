# Booking Feature Toggle System - Two Business Models

## Overview
**SuperAdmin controls** which businesses get the booking feature:
1. **Full Booking System** - Customers can book sunbeds online (Premium - SuperAdmin enables)
2. **Call-Only System** - Show capacity/availability, customers call to book (Default - Free)

**Key Point:** Business owners CANNOT enable this themselves. Only SuperAdmin can grant access to the booking feature.

---

## Business Model Comparison

### Model 1: Full Booking System (Premium)
**Features:**
- ✅ Online sunbed booking
- ✅ Visual sunbed map in app
- ✅ Real-time availability
- ✅ Collector dashboard for sunbed management
- ✅ QR codes for each sunbed
- ✅ Digital ordering from sunbeds

**Staff Roles Needed:**
- Manager
- Collector (manages sunbeds)
- Bartender

**Customer Experience:**
- Browse venues in app
- See visual map of sunbeds
- Book specific sunbed (A1, B5, etc.)
- Check-in with QR code
- Order food/drinks from sunbed

---

### Model 2: Call-Only System (Basic)
**Features:**
- ✅ Show venue capacity (e.g., "50 sunbeds")
- ✅ Show zone capacity (e.g., "VIP: 10 sunbeds")
- ✅ Availability status: "Unknown" or "Call for availability"
- ✅ "Call Us" button with phone number
- ✅ "Like" button to save favorites
- ❌ No online booking
- ❌ No sunbed map
- ❌ No collector dashboard
- ❌ No individual sunbed management

**Staff Roles Needed:**
- Manager
- Bartender (optional)

**Customer Experience:**
- Browse venues in app
- See total capacity: "Beach Club - 50 sunbeds available"
- See zone info: "VIP Section - 10 sunbeds"
- Availability: "Call for availability"
- Click "Call Us" → Opens phone dialer
- Click "❤️ Like" → Saves to favorites

---

## Database Schema Changes

### Business Model - Add Feature Flag (SuperAdmin Controlled)
```csharp
public class Business
{
    public int Id { get; set; }
    public string Name { get; set; }
    
    // ✅ NEW: SuperAdmin controls this
    public bool EnableBookingFeature { get; set; } = false;  // Default: Call-only (Free)
    
    // Existing fields
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Venue Model - Simplified (No per-venue toggles)
```csharp
public class Venue
{
    public int Id { get; set; }
    public int BusinessId { get; set; }
    public string Name { get; set; }
    public int Capacity { get; set; }  // Total capacity (required for both models)
    
    // Contact info for call-only model
    public string? PhoneNumber { get; set; }
    public string? WhatsAppNumber { get; set; }
    
    // Existing fields
    public bool OrderingEnabled { get; set; }
    public bool IsActive { get; set; }
}
```

**Note:** The booking feature is controlled at the **Business level**, not per-venue. If SuperAdmin enables it for a business, ALL venues under that business get the booking feature.

### Zone Model - Add Capacity Display
```csharp
public class VenueZone
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public string Name { get; set; }
    public int Capacity { get; set; }  // Total zone capacity
    
    // Only used if EnableOnlineBooking = true
    public int? CapacityPerUnit { get; set; }  // Nullable
}
```

---

## Frontend: SuperAdmin Panel - Business Management

### Create Business Modal - Add Booking Feature Toggle
```jsx
function CreateBusinessModal() {
  const [businessForm, setBusinessForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    enableBookingFeature: false  // ✅ SuperAdmin decides
  });
  
  return (
    <form onSubmit={handleCreateBusiness}>
      <input 
        type="text" 
        placeholder="Business Name"
        value={businessForm.name}
        onChange={(e) => setBusinessForm({...businessForm, name: e.target.value})}
      />
      
      <input 
        type="email" 
        placeholder="Email"
        value={businessForm.email}
        onChange={(e) => setBusinessForm({...businessForm, email: e.target.value})}
      />
      
      {/* ✅ NEW: Booking Feature Toggle */}
      <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-white">Enable Booking System</h4>
            <p className="text-sm text-zinc-400">
              Premium feature: Online booking, sunbed map, collector dashboard
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={businessForm.enableBookingFeature}
              onChange={(e) => setBusinessForm({...businessForm, enableBookingFeature: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 peer-checked:bg-blue-600 rounded-full peer-focus:ring-4 peer-focus:ring-blue-800 transition-all">
              <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
          </label>
        </div>
        
        {businessForm.enableBookingFeature && (
          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-800 rounded text-sm text-blue-300">
            ✓ This business will have access to:
            <ul className="mt-2 space-y-1 ml-4">
              <li>• Online sunbed booking</li>
              <li>• Visual sunbed mapper</li>
              <li>• Collector dashboard</li>
              <li>• Real-time availability</li>
            </ul>
          </div>
        )}
      </div>
      
      <button type="submit" className="w-full bg-white text-black py-3 rounded-lg">
        Create Business
      </button>
    </form>
  );
}
```

### Edit Business Modal - Toggle Booking Feature Anytime
```jsx
function EditBusinessModal({ business }) {
  const [enableBookingFeature, setEnableBookingFeature] = useState(business.enableBookingFeature);
  
  const handleToggleBooking = async () => {
    const confirmed = window.confirm(
      enableBookingFeature 
        ? 'Disable booking feature? This will remove access to sunbed booking, mapper, and collector dashboard.'
        : 'Enable booking feature? This will grant access to premium features.'
    );
    
    if (confirmed) {
      await superAdminApi.businesses.updateFeatures(business.id, {
        enableBookingFeature: !enableBookingFeature
      });
      setEnableBookingFeature(!enableBookingFeature);
    }
  };
  
  return (
    <div className="p-4 bg-zinc-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-white">Booking System</h4>
          <p className="text-sm text-zinc-400">
            {enableBookingFeature ? 'Premium features enabled' : 'Call-only mode (Free)'}
          </p>
        </div>
        <button 
          onClick={handleToggleBooking}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            enableBookingFeature 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          {enableBookingFeature ? 'Enabled' : 'Disabled'}
        </button>
      </div>
    </div>
  );
}
```

### Business List - Show Feature Status
```jsx
function BusinessList({ businesses }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Business Name</th>
          <th>Email</th>
          <th>Booking Feature</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {businesses.map(business => (
          <tr key={business.id}>
            <td>{business.name}</td>
            <td>{business.email}</td>
            <td>
              {business.enableBookingFeature ? (
                <span className="px-2 py-1 bg-blue-900/20 text-blue-400 rounded text-xs">
                  ✓ Premium
                </span>
              ) : (
                <span className="px-2 py-1 bg-zinc-700 text-zinc-400 rounded text-xs">
                  Call-Only
                </span>
              )}
            </td>
            <td>
              <span className={`px-2 py-1 rounded text-xs ${
                business.isActive 
                  ? 'bg-green-900/20 text-green-400' 
                  : 'bg-red-900/20 text-red-400'
              }`}>
                {business.isActive ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td>
              <button onClick={() => handleEdit(business)}>Edit</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Frontend: Business Admin Dashboard - Read-Only Status

### Business Owner Sees Feature Status (Cannot Change)
```jsx
function BusinessAdminDashboard() {
  const [businessProfile, setBusinessProfile] = useState(null);
  
  useEffect(() => {
    // Fetch business profile including feature flags
    const profile = await businessApi.profile.get();
    setBusinessProfile(profile);
  }, []);
  
  return (
    <div>
      {/* Show feature status banner */}
      {!businessProfile?.enableBookingFeature && (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <h3 className="font-medium text-white mb-1">Call-Only Mode</h3>
              <p className="text-sm text-zinc-400 mb-3">
                Your business is currently in call-only mode. Customers can see your venue capacity and call to book.
              </p>
              <p className="text-xs text-zinc-500">
                Want online booking? Contact your administrator to upgrade to premium features.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {businessProfile?.enableBookingFeature && (
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✓</div>
            <div>
              <h3 className="font-medium text-blue-300 mb-1">Premium Features Enabled</h3>
              <p className="text-sm text-blue-400">
                Your business has access to online booking, sunbed mapper, and collector dashboard.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Rest of dashboard */}
    </div>
  );
}
```

## Frontend: Discovery Page (Customer App)

### Call-Only Mode Display (Default - Free Tier)
```jsx
function VenueCard({ venue }) {
  if (!venue.enableOnlineBooking) {
    // Call-Only Mode
    return (
      <div className="bg-gradient-to-br from-white to-stone-50/50 rounded-[2rem] p-8 border border-stone-200/40">
        <img src={venue.imageUrl} className="w-full h-48 object-cover rounded-2xl mb-6" />
        
        <h3 className="font-serif text-3xl text-stone-900 mb-2">{venue.name}</h3>
        <p className="text-stone-600 mb-4">{venue.address}</p>
        
        {/* Capacity Info */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500 uppercase tracking-widest">Total Capacity</span>
            <span className="font-serif text-2xl text-stone-900">{venue.capacity}</span>
          </div>
          
          {/* Zones */}
          {venue.zones?.map(zone => (
            <div key={zone.id} className="flex items-center justify-between text-sm">
              <span className="text-stone-500">{zone.name}</span>
              <span className="text-stone-700">{zone.capacity} sunbeds</span>
            </div>
          ))}
        </div>
        
        {/* Availability Status */}
        <div className="bg-stone-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-stone-400 text-sm uppercase tracking-widest">Availability</span>
          </div>
          <p className="text-stone-600 text-lg">Call for real-time availability</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <a 
            href={`tel:${venue.phoneNumber}`}
            className="flex-1 bg-stone-900 text-stone-50 px-8 py-4 rounded-full text-sm tracking-widest uppercase text-center hover:bg-stone-800 transition-all duration-300"
          >
            📞 Call Us
          </a>
          
          {venue.whatsAppNumber && (
            <a 
              href={`https://wa.me/${venue.whatsAppNumber.replace(/\D/g, '')}`}
              className="flex-1 border border-stone-300 text-stone-700 px-8 py-4 rounded-full text-sm tracking-widest uppercase text-center hover:border-stone-400 hover:bg-stone-50 transition-all duration-300"
            >
              💬 WhatsApp
            </a>
          )}
        </div>
        
        {/* Like Button */}
        <button className="w-full mt-4 py-3 text-stone-500 hover:text-stone-900 transition-colors">
          <span className="text-2xl">🤍</span> Save to Favorites
        </button>
      </div>
    );
  }
  
  // Full Booking Mode (existing implementation)
  return (
    <div className="bg-gradient-to-br from-white to-stone-50/50 rounded-[2rem] p-8 border border-stone-200/40">
      {/* Visual map, booking button, etc. */}
      <button className="w-full bg-stone-900 text-stone-50 px-8 py-4 rounded-full">
        View Sunbed Map & Book
      </button>
    </div>
  );
}
```

---

## Backend API Changes

### New Endpoints

#### Get Business with Feature Flag
```
GET /api/businesses/{businessId}
Response: {
  "id": 1,
  "name": "Beach Paradise Group",
  "email": "info@beachparadise.com",
  "enableBookingFeature": false,  // ✅ SuperAdmin controlled
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### SuperAdmin: Create Business with Feature Flag
```
POST /api/superadmin/businesses
Body: {
  "name": "Beach Paradise Group",
  "email": "info@beachparadise.com",
  "phoneNumber": "+355 69 123 4567",
  "address": "Durrës, Albania",
  "enableBookingFeature": true  // ✅ SuperAdmin decides at creation
}
```

#### SuperAdmin: Update Business Features (Anytime)
```
PATCH /api/superadmin/businesses/{businessId}/features
Body: {
  "enableBookingFeature": true  // ✅ Can enable/disable anytime
}
Response: {
  "id": 1,
  "name": "Beach Paradise Group",
  "enableBookingFeature": true,
  "message": "Booking feature enabled successfully"
}
```

#### Get Venue (Includes Business Feature Status)
```
GET /api/venues/{venueId}
Response: {
  "id": 1,
  "businessId": 1,
  "name": "Beach Club",
  "capacity": 50,
  "phoneNumber": "+355 69 123 4567",
  "business": {
    "id": 1,
    "name": "Beach Paradise Group",
    "enableBookingFeature": false  // ✅ Inherited from business
  },
  "zones": [
    {
      "id": 1,
      "name": "VIP Section",
      "capacity": 10
    }
  ]
}
```

---

## Staff Dashboard Conditional Rendering

### Hide Collector Dashboard if Feature Disabled
```jsx
function BusinessAdminDashboard() {
  const [businessProfile, setBusinessProfile] = useState(null);
  
  useEffect(() => {
    const profile = await businessApi.profile.get();
    setBusinessProfile(profile);
  }, []);
  
  // Check if booking feature is enabled for this business
  const hasBookingFeature = businessProfile?.enableBookingFeature;
  
  return (
    <div>
      <nav>
        <Tab>Overview</Tab>
        <Tab>Staff Management</Tab>
        <Tab>Menu Management</Tab>
        <Tab>Venues</Tab>
        
        {/* Only show if SuperAdmin enabled booking feature */}
        {hasBookingFeature && <Tab>Sunbed Manager</Tab>}
        {hasBookingFeature && <Tab>Sunbed Mapper</Tab>}
        
        <Tab>QR Codes</Tab>
      </nav>
    </div>
  );
}
```

### Staff Creation - Hide Collector Role if Feature Disabled
```jsx
function CreateStaffModal() {
  const [businessProfile, setBusinessProfile] = useState(null);
  
  useEffect(() => {
    const profile = await businessApi.profile.get();
    setBusinessProfile(profile);
  }, []);
  
  const hasBookingFeature = businessProfile?.enableBookingFeature;
  
  // Available roles based on feature flag
  const availableRoles = hasBookingFeature 
    ? ['Manager', 'Bartender', 'Collector']
    : ['Manager', 'Bartender'];
  
  return (
    <div>
      <label>Role *</label>
      <select name="role" required>
        {availableRoles.map(role => (
          <option key={role} value={role}>{role}</option>
        ))}
      </select>
      
      {!hasBookingFeature && (
        <p className="text-xs text-zinc-500 mt-1">
          Collector role requires premium booking feature
        </p>
      )}
    </div>
  );
}
```

---

## Migration Path for Existing Businesses

### Default Settings for Existing Businesses
```sql
-- Set all existing businesses to call-only mode (free tier) by default
UPDATE catalog_businesses 
SET enable_booking_feature = false
WHERE enable_booking_feature IS NULL;
```

### SuperAdmin Can Upgrade Anytime
1. SuperAdmin logs into SuperAdmin panel
2. Goes to Business Management
3. Clicks "Edit" on a business
4. Toggles "Enable Booking Feature"
5. System shows: "This will enable premium features for this business. Continue?"
6. Once enabled, business gets:
   - Online booking capability
   - Sunbed mapper access
   - Collector dashboard
   - Real-time availability tracking

### Business Owner Experience After Upgrade
1. Business owner logs in
2. Sees banner: "✓ Premium Features Enabled"
3. New tabs appear: "Sunbed Manager", "Sunbed Mapper"
4. Can create Collector staff members
5. Can configure sunbed layouts

---

## Pricing Tiers (Future)

### Free Tier (Default)
- Call-only mode
- Show venue capacity
- Show zone capacity
- Basic venue info
- Phone/WhatsApp contact buttons
- No online booking
- No collector role
- No sunbed mapper

### Premium Tier (SuperAdmin Enables)
- ✅ Online booking
- ✅ Visual sunbed map
- ✅ Sunbed mapper tool
- ✅ Collector dashboard
- ✅ Real-time availability
- ✅ QR code ordering
- ✅ Advanced analytics

**Note:** SuperAdmin controls who gets premium features. This can be used for:
- Paid subscriptions (charge businesses monthly)
- Trial periods (enable for 30 days)
- Partner benefits (enable for strategic partners)
- Tiered pricing (different feature sets)

---

## Implementation Checklist

### Phase 1: Backend - Feature Flag (Week 1)
- [ ] Add `enable_booking_feature` column to Business table
- [ ] Update Business entity and DTOs
- [ ] Create SuperAdmin endpoint: POST /businesses (with feature flag)
- [ ] Create SuperAdmin endpoint: PATCH /businesses/{id}/features
- [ ] Update GET /businesses/{id} to include feature flag
- [ ] Update GET /venues/{id} to include business.enableBookingFeature
- [ ] Migration: Set all existing businesses to false

### Phase 2: SuperAdmin UI (Week 2)
- [ ] Add feature toggle to Create Business modal
- [ ] Add feature toggle to Edit Business modal
- [ ] Show feature status in Business list table
- [ ] Add confirmation dialog when toggling
- [ ] Test enable/disable functionality

### Phase 3: Business Admin UI (Week 3)
- [ ] Fetch business profile with feature flag
- [ ] Show feature status banner (read-only)
- [ ] Hide "Sunbed Manager" tab if disabled
- [ ] Hide "Sunbed Mapper" tab if disabled
- [ ] Hide "Collector" role in staff creation if disabled
- [ ] Show upgrade message if disabled

### Phase 4: Discovery Page (Week 4)
- [ ] Check business.enableBookingFeature in venue data
- [ ] Show call-only UI if disabled
- [ ] Show booking UI if enabled
- [ ] Add phone/WhatsApp buttons for call-only
- [ ] Add "Like" button for favorites
- [ ] Test both modes thoroughly

### Phase 5: Testing & Migration (Week 5)
- [ ] Test SuperAdmin enable/disable flow
- [ ] Test business owner experience (both modes)
- [ ] Test customer app (both modes)
- [ ] Migrate existing businesses to free tier
- [ ] Document upgrade process
- [ ] Train SuperAdmin on feature management

---

## User Flow Examples

### Example 1: Call-Only Business (Free Tier - Default)
**SuperAdmin:**
1. Creates business "Beach Paradise"
2. Leaves "Enable Booking Feature" unchecked (default)
3. Business is in free tier

**Business Owner:**
1. Logs in → Sees "Call-Only Mode" banner
2. Can manage: Staff (Manager, Bartender only), Menu, Venues
3. Cannot see: Sunbed Manager, Sunbed Mapper, Collector role
4. Banner says: "Contact administrator to upgrade"

**Customer:**
1. Opens app → Sees "Beach Paradise - 50 sunbeds"
2. Sees "VIP: 10 sunbeds, Regular: 40 sunbeds"
3. Sees "Availability: Call for availability"
4. Clicks "📞 Call Us" → Phone dialer opens
5. Calls venue to book

**Staff:**
- Manager manages venue settings
- Bartender takes orders (no collector needed)
- No sunbed tracking system

### Example 2: Premium Business (SuperAdmin Enabled)
**SuperAdmin:**
1. Creates business "Luxury Resort"
2. Checks "Enable Booking Feature" ✓
3. Business gets premium features

**Business Owner:**
1. Logs in → Sees "✓ Premium Features Enabled" banner
2. Can manage: Staff (Manager, Bartender, Collector), Menu, Venues
3. Can access: Sunbed Manager, Sunbed Mapper
4. Can create Collector staff members
5. Can configure sunbed layouts

**Customer:**
1. Opens app → Sees visual sunbed map
2. Sees real-time availability (green/red)
3. Selects sunbed A5
4. Books online
5. Receives QR code

**Staff:**
- Manager manages everything
- Collector manages sunbed check-ins/outs
- Bartender fulfills orders
- Full tracking system

### Example 3: Upgrade Scenario
**SuperAdmin:**
1. Business "Beach Paradise" requests upgrade
2. SuperAdmin goes to Business Management
3. Clicks "Edit" on "Beach Paradise"
4. Toggles "Enable Booking Feature" ON
5. Confirms upgrade

**Business Owner:**
1. Refreshes dashboard
2. Banner changes to "✓ Premium Features Enabled"
3. New tabs appear: Sunbed Manager, Sunbed Mapper
4. Can now create Collector staff
5. Can configure sunbed layouts

**Customer:**
1. Refreshes app
2. Now sees visual sunbed map
3. Can book online
4. Gets QR codes

---

## Benefits

1. **SuperAdmin Control**: Full control over which businesses get premium features
2. **Revenue Model**: Can charge for premium tier
3. **Gradual Rollout**: Enable features for select businesses first
4. **Trial Periods**: Enable temporarily for testing
5. **Lower Barrier**: Small venues can start free
6. **Upgrade Path**: Easy to enable features later
7. **Cost Savings**: No collector needed for free tier
8. **Simpler UI**: Customers see appropriate interface
9. **Business Flexibility**: Businesses can request upgrades
10. **Feature Gating**: Control access to expensive features (sunbed mapper, real-time tracking)

---

## Next Steps

1. **Backend**: Add feature flag columns to Venue
2. **Frontend**: Build feature toggle UI
3. **Discovery**: Update to show call-only mode
4. **Test**: Both modes with real venues
5. **Document**: User guide for business owners

Let me know which phase to start with!
