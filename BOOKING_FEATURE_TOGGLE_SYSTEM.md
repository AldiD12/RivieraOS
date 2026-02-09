# Booking Feature Toggle System - Two Business Models

## Overview
Businesses can choose between two operational models:
1. **Full Booking System** - Customers can book sunbeds online
2. **Call-Only System** - Show capacity/availability, customers call to book

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

### Venue Model - Add Feature Flags
```csharp
public class Venue
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int Capacity { get; set; }  // Total capacity (required for both models)
    
    // ✅ NEW: Feature toggles
    public bool EnableOnlineBooking { get; set; } = false;  // Default: Call-only
    public bool EnableSunbedMapping { get; set; } = false;  // Show visual map
    public bool EnableCollectorDashboard { get; set; } = false;  // Collector role
    
    // Contact info for call-only model
    public string? PhoneNumber { get; set; }
    public string? WhatsAppNumber { get; set; }
    
    // Existing fields
    public bool OrderingEnabled { get; set; }
    public bool IsActive { get; set; }
}
```

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

## Frontend: Business Admin Settings

### Venue Settings Page
```jsx
<div className="bg-zinc-900 rounded-lg p-6">
  <h3 className="text-xl font-bold mb-4">Booking Features</h3>
  
  {/* Feature Toggle */}
  <div className="space-y-4">
    <div className="flex items-center justify-between p-4 bg-zinc-800 rounded">
      <div>
        <h4 className="font-medium">Online Booking System</h4>
        <p className="text-sm text-zinc-400">
          Allow customers to book specific sunbeds online
        </p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          checked={venue.enableOnlineBooking}
          onChange={handleToggleBooking}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-zinc-700 peer-checked:bg-blue-600 rounded-full"></div>
      </label>
    </div>
    
    {/* If online booking is OFF, show call-only settings */}
    {!venue.enableOnlineBooking && (
      <div className="p-4 bg-zinc-800 rounded">
        <h4 className="font-medium mb-3">Call-Only Mode Settings</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Phone Number</label>
            <input 
              type="tel"
              value={venue.phoneNumber}
              placeholder="+355 69 123 4567"
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">WhatsApp Number (optional)</label>
            <input 
              type="tel"
              value={venue.whatsAppNumber}
              placeholder="+355 69 123 4567"
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2"
            />
          </div>
        </div>
      </div>
    )}
    
    {/* If online booking is ON, show advanced features */}
    {venue.enableOnlineBooking && (
      <>
        <div className="flex items-center justify-between p-4 bg-zinc-800 rounded">
          <div>
            <h4 className="font-medium">Visual Sunbed Map</h4>
            <p className="text-sm text-zinc-400">
              Show interactive map in customer app
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={venue.enableSunbedMapping}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 peer-checked:bg-blue-600 rounded-full"></div>
          </label>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-zinc-800 rounded">
          <div>
            <h4 className="font-medium">Collector Dashboard</h4>
            <p className="text-sm text-zinc-400">
              Enable collector role for sunbed management
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={venue.enableCollectorDashboard}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-700 peer-checked:bg-blue-600 rounded-full"></div>
          </label>
        </div>
      </>
    )}
  </div>
</div>
```

---

## Frontend: Discovery Page (Customer App)

### Call-Only Mode Display
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

#### Get Venue with Feature Flags
```
GET /api/venues/{venueId}
Response: {
  "id": 1,
  "name": "Beach Club",
  "capacity": 50,
  "enableOnlineBooking": false,
  "enableSunbedMapping": false,
  "enableCollectorDashboard": false,
  "phoneNumber": "+355 69 123 4567",
  "whatsAppNumber": "+355 69 123 4567",
  "zones": [
    {
      "id": 1,
      "name": "VIP Section",
      "capacity": 10
    },
    {
      "id": 2,
      "name": "Regular Beach",
      "capacity": 40
    }
  ]
}
```

#### Update Venue Features
```
PATCH /api/business/venues/{venueId}/features
Body: {
  "enableOnlineBooking": true,
  "enableSunbedMapping": true,
  "enableCollectorDashboard": true,
  "phoneNumber": "+355 69 123 4567",
  "whatsAppNumber": "+355 69 123 4567"
}
```

---

## Staff Dashboard Conditional Rendering

### Hide Collector Dashboard if Disabled
```jsx
function BusinessAdminDashboard() {
  const [venues, setVenues] = useState([]);
  
  // Check if ANY venue has collector dashboard enabled
  const hasCollectorFeature = venues.some(v => v.enableCollectorDashboard);
  
  return (
    <div>
      <nav>
        <Tab>Overview</Tab>
        <Tab>Staff Management</Tab>
        <Tab>Menu Management</Tab>
        <Tab>Venues</Tab>
        
        {/* Only show if feature is enabled */}
        {hasCollectorFeature && <Tab>Sunbed Manager</Tab>}
        
        <Tab>QR Codes</Tab>
      </nav>
    </div>
  );
}
```

### Staff Creation - Hide Collector Role if Disabled
```jsx
function CreateStaffModal() {
  const hasCollectorFeature = venues.some(v => v.enableCollectorDashboard);
  
  const availableRoles = hasCollectorFeature 
    ? ['Manager', 'Bartender', 'Collector']
    : ['Manager', 'Bartender'];
  
  return (
    <select>
      {availableRoles.map(role => (
        <option key={role} value={role}>{role}</option>
      ))}
    </select>
  );
}
```

---

## Migration Path for Existing Venues

### Default Settings for Existing Venues
```sql
-- Set all existing venues to call-only mode by default
UPDATE catalog_venues 
SET 
  enable_online_booking = false,
  enable_sunbed_mapping = false,
  enable_collector_dashboard = false
WHERE enable_online_booking IS NULL;
```

### Business Owner Can Upgrade
1. Manager logs in
2. Goes to Venue Settings
3. Toggles "Enable Online Booking"
4. System shows: "This will enable advanced features. Continue?"
5. Once enabled, can configure sunbed map and collector dashboard

---

## Pricing Tiers (Future)

### Free Tier
- Call-only mode
- Show capacity
- Basic venue info
- No online booking

### Premium Tier
- Online booking
- Visual sunbed map
- Collector dashboard
- Real-time availability
- QR code ordering

---

## Implementation Checklist

### Phase 1: Feature Flags (Week 1)
- [ ] Add feature flag columns to Venue table
- [ ] Add phone number fields to Venue
- [ ] Update Venue DTOs
- [ ] Create feature toggle API endpoints
- [ ] Add feature toggle UI in Business Admin

### Phase 2: Call-Only Mode (Week 2)
- [ ] Update Discovery page to show capacity
- [ ] Add "Call Us" button
- [ ] Add "Like" button for favorites
- [ ] Show "Availability: Unknown" status
- [ ] Test phone dialer integration

### Phase 3: Conditional Dashboards (Week 3)
- [ ] Hide Collector dashboard if disabled
- [ ] Hide Collector role in staff creation
- [ ] Hide sunbed mapper if disabled
- [ ] Show appropriate UI based on flags

### Phase 4: Testing & Migration (Week 4)
- [ ] Test both modes thoroughly
- [ ] Migrate existing venues to call-only
- [ ] Document upgrade process
- [ ] Train business owners

---

## User Flow Examples

### Example 1: Call-Only Venue
**Customer:**
1. Opens app → Sees "Beach Club - 50 sunbeds"
2. Sees "VIP: 10 sunbeds, Regular: 40 sunbeds"
3. Sees "Availability: Call for availability"
4. Clicks "📞 Call Us" → Phone dialer opens
5. Calls venue to book

**Staff:**
- Manager manages venue settings
- Bartender takes orders (no collector needed)
- No sunbed tracking system

### Example 2: Full Booking Venue
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

---

## Benefits

1. **Flexibility**: Businesses choose their model
2. **Lower Barrier**: Small venues can start with call-only
3. **Upgrade Path**: Can enable features later
4. **Cost Savings**: No collector needed for call-only
5. **Simpler UI**: Customers see appropriate interface

---

## Next Steps

1. **Backend**: Add feature flag columns to Venue
2. **Frontend**: Build feature toggle UI
3. **Discovery**: Update to show call-only mode
4. **Test**: Both modes with real venues
5. **Document**: User guide for business owners

Let me know which phase to start with!
