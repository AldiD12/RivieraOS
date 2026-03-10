# 🎫 Database Ticket: Geographic Zones for Location Search

**Assigned to:** Kristi  
**Priority:** Medium  
**Estimated Time:** 2-3 hours  
**Frontend Status:** ✅ Complete and Ready  

---

## 📋 Task Overview

Add geographic zone support to enable the new location search UX: "📍 EVERYWHERE ▾" → "📍 DHËRMI (8)"

**Current Problem:** Events/venues only have raw addresses, no clean geographic zones  
**Solution:** Add `geographic_zone` field and aggregation endpoint  
**Result:** Users can filter by zones like "Dhërmi", "Sarandë", etc.

---

## 🗄️ Database Changes Required

### 1. Add Geographic Zone Column
```sql
-- Add the new column
ALTER TABLE catalog_venues 
ADD COLUMN geographic_zone VARCHAR(50);

-- Add index for performance
CREATE INDEX idx_venues_geographic_zone ON catalog_venues(geographic_zone);
```

### 2. Populate Existing Data
```sql
-- Populate based on existing addresses (adjust patterns as needed)
UPDATE catalog_venues SET geographic_zone = 'Dhërmi' 
WHERE address ILIKE '%dhërmi%' OR address ILIKE '%dhermi%';

UPDATE catalog_venues SET geographic_zone = 'Sarandë' 
WHERE address ILIKE '%sarandë%' OR address ILIKE '%sarande%';

UPDATE catalog_venues SET geographic_zone = 'Vlorë' 
WHERE address ILIKE '%vlorë%' OR address ILIKE '%vlore%';

UPDATE catalog_venues SET geographic_zone = 'Himarë' 
WHERE address ILIKE '%himarë%' OR address ILIKE '%himare%';

UPDATE catalog_venues SET geographic_zone = 'Ksamil' 
WHERE address ILIKE '%ksamil%';

UPDATE catalog_venues SET geographic_zone = 'Tirana' 
WHERE address ILIKE '%tirana%';

-- Default for unmatched venues
UPDATE catalog_venues SET geographic_zone = 'Albanian Riviera' 
WHERE geographic_zone IS NULL;
```

---

## 🔌 API Endpoints Required

### 1. Geographic Zones Aggregation (NEW)
**Endpoint:** `GET /api/public/Events/geographic-zones`

**Controller Method:**
```csharp
[HttpGet("geographic-zones")]
public async Task<ActionResult<IEnumerable<GeographicZoneDto>>> GetGeographicZones()
{
    // SQL query to get zones with event counts
    var zones = await _context.Database.SqlQueryRaw<GeographicZoneDto>(@"
        SELECT 
            v.geographic_zone as Zone,
            COUNT(e.event_id) as EventCount
        FROM catalog_venues v
        INNER JOIN events_scheduled e ON v.venue_id = e.venue_id
        WHERE e.is_published = true 
            AND e.is_deleted = false
            AND e.end_time > NOW()
        GROUP BY v.geographic_zone
        HAVING COUNT(e.event_id) > 0
        ORDER BY EventCount DESC
    ").ToListAsync();
    
    return Ok(zones);
}
```

**DTO Class:**
```csharp
public class GeographicZoneDto
{
    public string Zone { get; set; }
    public int EventCount { get; set; }
}
```

**Expected Response:**
```json
[
  { "zone": "Dhërmi", "eventCount": 8 },
  { "zone": "Sarandë", "eventCount": 12 },
  { "zone": "Vlorë", "eventCount": 5 }
]
```

### 2. Add Zone Filtering to Existing Events Endpoint
**Endpoint:** `GET /api/public/Events?geographicZone={zone}`

**Modify existing GetEvents method:**
```csharp
public async Task<ActionResult<IEnumerable<PublicEventListItemDto>>> GetEvents(
    string? geographicZone = null)
{
    var query = _context.ScheduledEvents
        .Include(e => e.Venue)
        .Where(e => e.IsPublished && !e.IsDeleted);
    
    // Add geographic zone filtering
    if (!string.IsNullOrEmpty(geographicZone))
    {
        query = query.Where(e => e.Venue.GeographicZone == geographicZone);
    }
    
    // ... rest of existing logic
}
```

---

## ✅ Testing Checklist

### Database Tests:
- [ ] `geographic_zone` column added successfully
- [ ] Index created without errors
- [ ] Existing venues populated with correct zones
- [ ] No NULL values remain after population

### API Tests:
- [ ] `/api/public/Events/geographic-zones` returns zones with counts
- [ ] Only zones with `eventCount > 0` are returned
- [ ] `/api/public/Events?geographicZone=Dhërmi` filters correctly
- [ ] Invalid zone names return empty array (not error)

### Sample Test Queries:
```sql
-- Verify zone population
SELECT geographic_zone, COUNT(*) as venue_count 
FROM catalog_venues 
GROUP BY geographic_zone;

-- Verify events per zone
SELECT v.geographic_zone, COUNT(e.event_id) as event_count
FROM catalog_venues v
LEFT JOIN events_scheduled e ON v.venue_id = e.venue_id
WHERE e.is_published = true AND e.is_deleted = false
GROUP BY v.geographic_zone;
```

---

## 🚀 Deployment Notes

1. **Database Migration:** Run the ALTER TABLE and UPDATE statements
2. **API Deployment:** Deploy the new endpoint and modified events endpoint
3. **No Frontend Changes:** Frontend is already ready and will work automatically
4. **Rollback Plan:** Can remove the column if needed (frontend has fallbacks)

---

## 📞 Questions/Clarifications

If you need clarification on:
- **Zone Names:** Should we use different geographic zone names?
- **Address Parsing:** Need help with the address pattern matching?
- **Performance:** Want to discuss indexing strategy?
- **Testing:** Need help with test data or scenarios?

**Contact:** The frontend team - we're ready to test as soon as the backend is deployed!

---

## 🎯 Success Criteria

✅ **Done when:**
1. Database has `geographic_zone` column with populated data
2. `/api/public/Events/geographic-zones` returns zone counts
3. Events API accepts `geographicZone` parameter and filters correctly
4. Frontend location search works with real data (no more mock data)

**Estimated completion:** 2-3 hours of development + testing time.