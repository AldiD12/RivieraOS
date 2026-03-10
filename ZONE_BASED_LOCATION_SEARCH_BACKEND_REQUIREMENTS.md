# 🌍 Zone-Based Location Search - Backend Requirements

## Executive Summary
The frontend is **100% ready** for zone-based location search. When you implement the backend changes below, the feature will work automatically without any frontend modifications.

---

## 🎯 User Experience
- **Current:** Massive Wolt-style search bar
- **New:** Tiny trigger "📍 EVERYWHERE ▾" in header
- **Interaction:** Opens bottom sheet showing only zones with active events + counts
- **Example:** "📍 DHËRMI (8)" - only shows zones with events > 0

---

## 📋 Required Database Changes

### 1. Add Geographic Zone Column
```sql
-- Add geographic zone field to venues table
ALTER TABLE catalog_venues 
ADD COLUMN geographic_zone VARCHAR(50);

-- Create index for performance
CREATE INDEX idx_venues_geographic_zone ON catalog_venues(geographic_zone);
```

### 2. Populate Zone Data
```sql
-- Example data population (adjust based on your venue addresses)
UPDATE catalog_venues SET geographic_zone = 'Dhërmi' WHERE address LIKE '%Dhërmi%' OR address LIKE '%Dhermi%';
UPDATE catalog_venues SET geographic_zone = 'Sarandë' WHERE address LIKE '%Sarandë%' OR address LIKE '%Sarande%';
UPDATE catalog_venues SET geographic_zone = 'Vlorë' WHERE address LIKE '%Vlorë%' OR address LIKE '%Vlore%';
UPDATE catalog_venues SET geographic_zone = 'Himarë' WHERE address LIKE '%Himarë%' OR address LIKE '%Himare%';
UPDATE catalog_venues SET geographic_zone = 'Ksamil' WHERE address LIKE '%Ksamil%';
UPDATE catalog_venues SET geographic_zone = 'Tirana' WHERE address LIKE '%Tirana%';

-- Set default for venues without specific zone
UPDATE catalog_venues SET geographic_zone = 'Albanian Riviera' WHERE geographic_zone IS NULL;
```

---

## 🔌 Required API Endpoints

### 1. Geographic Zones Aggregation Endpoint
```
GET /api/public/Events/geographic-zones
```

**Response:**
```json
[
  { "zone": "Dhërmi", "eventCount": 8 },
  { "zone": "Sarandë", "eventCount": 12 },
  { "zone": "Vlorë", "eventCount": 5 }
]
```

**SQL Query:**
```sql
SELECT 
    v.geographic_zone as zone,
    COUNT(e.event_id) as eventCount
FROM catalog_venues v
INNER JOIN events_scheduled e ON v.venue_id = e.venue_id
WHERE e.is_published = true 
    AND e.is_deleted = false
    AND e.end_time > NOW()
GROUP BY v.geographic_zone
HAVING COUNT(e.event_id) > 0
ORDER BY eventCount DESC;
```

### 2. Events Filtering by Zone
```
GET /api/public/Events?geographicZone={zone}
```

**Example:** `GET /api/public/Events?geographicZone=Dhërmi`

**SQL Modification:**
```sql
-- Add to existing events query WHERE clause
AND v.geographic_zone = @geographicZone
```

### 3. Venues Filtering by Zone (Optional)
```
GET /api/public/Venues?geographicZone={zone}
```

---

## 🏗️ Implementation Steps

### Step 1: Database Schema
1. Run the ALTER TABLE command to add `geographic_zone` column
2. Create the index for performance
3. Populate existing venues with zone data

### Step 2: API Endpoints
1. Create the aggregation endpoint `/api/public/Events/geographic-zones`
2. Add `geographicZone` parameter to existing events endpoint
3. (Optional) Add zone filtering to venues endpoint

### Step 3: Testing
1. Test the aggregation endpoint returns correct counts
2. Test zone filtering works correctly
3. Verify only zones with active events are returned

---

## ✅ Frontend Status

### Already Implemented:
- ✅ `LocationBottomSheet` component (luxury design)
- ✅ `GeographicZonesApi` service with fallback logic
- ✅ Integration in `DiscoveryPage` header
- ✅ Mock data for development/testing
- ✅ Error handling and loading states
- ✅ Stone Standard design system compliance

### Auto-Integration:
- ✅ API calls will automatically work when endpoints exist
- ✅ Falls back to mock data during development
- ✅ Client-side filtering as temporary backup
- ✅ No frontend changes needed after backend deployment

---

## 🎨 Design Implementation

The UI follows the **Stone Standard** for ultra-luxury customer-facing pages:
- Travertine background (#FAFAF9)
- Sophisticated neutrals (stone-900, stone-600, stone-500)
- Cormorant Garamond serif for headings
- Inter sans-serif for body text
- Subtle shadows and rounded corners
- Luxury micro-interactions (500ms transitions)

---

## 📁 Files Created

### Frontend Files:
- `frontend/src/services/geographicZonesApi.js` - API service with fallback
- `frontend/src/components/LocationBottomSheet.jsx` - Luxury bottom sheet UI
- `frontend/src/pages/DiscoveryPage.jsx` - Updated with location trigger
- `frontend/zone-location-demo.html` - Demo page

### Documentation:
- `ZONE_BASED_LOCATION_SEARCH_BACKEND_REQUIREMENTS.md` - This file

---

## 🚀 Deployment

1. **Backend:** Implement the database changes and API endpoints above
2. **Frontend:** Already deployed and ready
3. **Testing:** Use the demo page to verify functionality
4. **Go Live:** Feature will work automatically once backend is deployed

---

## 💡 Notes

- Only zones with `eventCount > 0` are shown to users
- The "EVERYWHERE" option shows all events (no filtering)
- Geographic zones are case-insensitive in the API
- The UI gracefully handles loading states and errors
- Mock data provides realistic development experience

**The frontend is production-ready. Once you implement the backend changes above, the zone-based location search will work seamlessly.**