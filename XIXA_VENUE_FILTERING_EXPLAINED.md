# XIXA Venue Filtering - How It Works

**Date:** February 28, 2026  
**Question:** "How do we control which venues show on XIXA?"

---

## TL;DR - It's Already Built In! ✅

The backend **already filters venues** using the `isActive` field. Only venues with `isActive = true` appear on XIXA (Discovery Mode).

---

## How It Works

### 1. Backend Endpoint

```
GET /api/public/Venues?isActive=true
```

**Query Parameters:**
- `type` (optional): Filter by venue type (Beach, Boat, Restaurant)
- `isActive` (optional): Filter by active status (default: `true`)

**Default Behavior:**
- If you don't pass `isActive`, it defaults to `true`
- This means **only active venues** are returned by default
- Inactive venues (`isActive = false`) are automatically hidden

---

## Current Implementation

### Frontend (venueApi.js)

```javascript
async getVenues() {
  // Calls: GET /api/public/Venues
  // Backend automatically filters isActive=true
  const response = await fetch(`${API_URL}/api/public/Venues`);
  const venues = await response.json();
  return venues;
}
```

**What happens:**
1. Frontend calls `/api/public/Venues` (no parameters)
2. Backend applies default filter: `isActive = true`
3. Only active venues are returned
4. These venues appear on the XIXA map

---

## How to Control Venue Visibility

### Option 1: SuperAdmin Dashboard (Recommended)

**Current Status:** ⚠️ Needs Implementation

The SuperAdmin should be able to toggle `isActive` for each venue:

```
SuperAdmin Dashboard
└── Venues Tab
    └── Venue List
        └── [Toggle Active/Inactive Button]
```

**What needs to be added:**
1. Add "Active" column to venue table
2. Add toggle button (like zones have)
3. Call backend endpoint to update `isActive`

### Option 2: Direct Database Update (Temporary)

Until the UI is ready, you can manually update the database:

```sql
-- Hide a venue from XIXA
UPDATE Venues 
SET IsActive = 0 
WHERE Id = 123;

-- Show a venue on XIXA
UPDATE Venues 
SET IsActive = 1 
WHERE Id = 123;
```

### Option 3: Backend API (For Automation)

**Endpoint:** `PUT /api/superadmin/businesses/{businessId}/Venues/{id}`

**Request Body:**
```json
{
  "name": "Folie Beach Club",
  "type": "Beach",
  "address": "Dhërmi Beach",
  "latitude": 40.1234,
  "longitude": 19.5678,
  "isActive": false  // ← Set to false to hide from XIXA
}
```

---

## Use Cases

### Scenario 1: Soft Launch
**Goal:** Only show 5 premium venues on XIXA initially

**Solution:**
1. Set `isActive = true` for 5 selected venues
2. Set `isActive = false` for all others
3. Gradually activate more venues as you onboard them

### Scenario 2: Seasonal Venues
**Goal:** Hide beach clubs during winter

**Solution:**
1. Set `isActive = false` for beach venues in October
2. Set `isActive = true` again in April
3. Boats and restaurants stay active year-round

### Scenario 3: Maintenance Mode
**Goal:** Temporarily hide a venue during renovations

**Solution:**
1. Set `isActive = false` for the venue
2. Venue disappears from XIXA immediately
3. Set `isActive = true` when ready to reopen

### Scenario 4: Premium vs Standard
**Goal:** Only show premium partner venues on XIXA

**Solution:**
1. Premium partners: `isActive = true`
2. Standard partners: `isActive = false` (use other booking channels)
3. Upgrade partners by toggling `isActive`

---

## What Happens When isActive = false?

### On XIXA (Discovery Mode)
- ❌ Venue does NOT appear on map
- ❌ Venue does NOT appear in list view
- ❌ Venue does NOT appear in search results
- ❌ Cannot be booked through XIXA

### On Other Platforms
- ✅ Venue still exists in database
- ✅ Staff can still log in
- ✅ Collector/Bartender dashboards still work
- ✅ Business Admin can still manage it
- ✅ SuperAdmin can still see it
- ✅ Direct QR code links still work (if needed)

**Important:** `isActive = false` only hides the venue from **public discovery**. All internal systems continue to work.

---

## Implementation Priority

### Phase 1: Manual Control (Current) ✅
- Database updates work now
- Backend filtering works now
- Frontend displays filtered venues now

### Phase 2: SuperAdmin UI (Recommended Next)
**Add to SuperAdmin Dashboard:**
1. "Active" column in venue table
2. Toggle button (green = active, gray = inactive)
3. Confirmation dialog: "Hide this venue from XIXA?"
4. API call to update `isActive`

**Estimated Time:** 1-2 hours

### Phase 3: Business Admin UI (Optional)
**Allow business owners to control their own venues:**
1. Add toggle to Business Admin venue management
2. Restrict to their own venues only
3. Log activation/deactivation events

**Estimated Time:** 2-3 hours

---

## Backend Schema

### Venues Table
```sql
CREATE TABLE Venues (
  Id INT PRIMARY KEY,
  BusinessId INT NOT NULL,
  Name NVARCHAR(255) NOT NULL,
  Type NVARCHAR(50) NOT NULL,
  Address NVARCHAR(500),
  Latitude DECIMAL(10, 8),
  Longitude DECIMAL(11, 8),
  ImageUrl NVARCHAR(500),
  Description NVARCHAR(MAX),
  IsActive BIT NOT NULL DEFAULT 1,  -- ← Controls XIXA visibility
  OrderingEnabled BIT NOT NULL DEFAULT 0,
  IsDeleted BIT NOT NULL DEFAULT 0,
  DeletedAt DATETIME2,
  CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

**Key Field:** `IsActive BIT`
- `1` (true) = Venue appears on XIXA
- `0` (false) = Venue hidden from XIXA

---

## API Reference

### Get All Venues (Public)
```
GET /api/public/Venues?isActive=true&type=Beach
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Folie Beach Club",
    "type": "Beach",
    "address": "Dhërmi Beach",
    "latitude": 40.1234,
    "longitude": 19.5678,
    "imageUrl": "https://...",
    "description": "Premium beach club...",
    "availableUnitsCount": 15
  }
]
```

**Note:** Only venues with `isActive = true` are returned.

### Update Venue (SuperAdmin)
```
PUT /api/superadmin/businesses/{businessId}/Venues/{id}
```

**Request Body:**
```json
{
  "name": "Folie Beach Club",
  "type": "Beach",
  "address": "Dhërmi Beach",
  "latitude": 40.1234,
  "longitude": 19.5678,
  "isActive": false  // ← Toggle visibility
}
```

---

## Testing Checklist

### Test Venue Visibility
- [ ] Set venue `isActive = true` → Appears on XIXA map
- [ ] Set venue `isActive = false` → Disappears from XIXA map
- [ ] Toggle back to `true` → Reappears on XIXA map
- [ ] Check list view → Only active venues shown
- [ ] Check search → Only active venues searchable
- [ ] Check filters → Only active venues in results

### Test Internal Systems
- [ ] Inactive venue: Staff can still log in
- [ ] Inactive venue: Collector dashboard works
- [ ] Inactive venue: Business Admin can manage
- [ ] Inactive venue: SuperAdmin can see it
- [ ] Inactive venue: QR codes still work (if needed)

---

## Recommendations

### For Launch
1. **Start with 5-10 premium venues** (`isActive = true`)
2. **Hide all others** (`isActive = false`)
3. **Gradually activate** as you onboard and verify quality

### For Operations
1. **Add SuperAdmin toggle UI** (Phase 2)
2. **Log all activation changes** (audit trail)
3. **Set up alerts** when venues are deactivated
4. **Monitor inactive venues** (why are they hidden?)

### For Business Owners
1. **Explain the system** (active = visible on XIXA)
2. **Give them control** (Business Admin toggle)
3. **Set expectations** (activation = quality standards)

---

## Summary

**Question:** "How do we control which venues show on XIXA?"

**Answer:** Use the `isActive` field!

- ✅ Backend already filters by `isActive = true`
- ✅ Frontend already displays filtered venues
- ✅ You can control visibility via database or API
- ⚠️ SuperAdmin UI toggle needs to be added (1-2 hours)

**Current Status:**
- Filtering: ✅ Working
- Database control: ✅ Working
- API control: ✅ Working
- UI control: ⚠️ Needs implementation

---

**The system is already built - you just need to add the UI toggle!** 🎯
