# 🚀 Deployment Steps: Geographic Zones Feature

**For:** Kristi  
**Task:** Deploy the geographic zones feature you just implemented  
**Time:** 15-20 minutes  
**Status:** Code is ready, just need to deploy and populate data  

---

## 📋 **Quick Checklist**
- [ ] Stop the running backend app
- [ ] Apply the database migration
- [ ] Populate zone data with SQL scripts
- [ ] Start the backend app
- [ ] Test the new endpoints
- [ ] Verify frontend integration

---

## 🛠️ **Step 1: Apply Database Migration**

### **Stop the Backend First**
```bash
# Stop the running app (Ctrl+C in the terminal where it's running)
# Or kill the process as mentioned in your build error
```

### **Apply the Migration**
```bash
# Navigate to your backend project
cd BlackBear.Services/BlackBear.Services.Core

# Apply the migration to add the geographic_zone column
dotnet ef database update
```

**Expected Output:**
```
Applying migration '20240310_AddVenueGeographicZone'.
Done.
```

---

## 🗄️ **Step 2: Populate Geographic Zone Data**

Open your database management tool (pgAdmin, SQL Server Management Studio, etc.) and run these SQL commands:

### **Zone Population Script**
```sql
-- Add geographic zones based on venue addresses
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

UPDATE catalog_venues SET geographic_zone = 'Durrës' 
WHERE address ILIKE '%durrës%' OR address ILIKE '%durres%';

-- Set default for venues that don't match any specific zone
UPDATE catalog_venues SET geographic_zone = 'Albanian Riviera' 
WHERE geographic_zone IS NULL;
```

### **Verify Data Population**
```sql
-- Check how many venues were assigned to each zone
SELECT geographic_zone, COUNT(*) as venue_count 
FROM catalog_venues 
GROUP BY geographic_zone
ORDER BY venue_count DESC;
```

**Expected Output:**
```
geographic_zone    | venue_count
-------------------|------------
Albanian Riviera   | 15
Dhërmi            | 8
Sarandë           | 12
Vlorë             | 5
...
```

---

## 🚀 **Step 3: Start the Backend**

```bash
# Start the backend API
dotnet run
```

**Expected Output:**
```
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

---

## 🧪 **Step 4: Test the New API Endpoints**

### **Test 1: Geographic Zones Endpoint**
Open your browser or use curl:
```bash
curl http://localhost:5000/api/public/events/geographic-zones
```

**Expected Response:**
```json
[
  { "zone": "Dhërmi", "eventCount": 8 },
  { "zone": "Sarandë", "eventCount": 12 },
  { "zone": "Vlorë", "eventCount": 5 }
]
```

### **Test 2: Events Filtering**
```bash
curl "http://localhost:5000/api/public/events?geographicZone=Dhërmi"
```

**Expected:** Only events from Dhërmi venues should be returned.

### **Test 3: Check Swagger Documentation**
Visit: `http://localhost:5000/swagger`
- Look for the new `/api/public/events/geographic-zones` endpoint
- Test the `geographicZone` parameter on the events endpoint

---

## 🎯 **Step 5: Verify Frontend Integration**

1. **Open the frontend app** (Discovery Page)
2. **Look for the location trigger** in the header: "📍 EVERYWHERE ▾"
3. **Click the trigger** - should open a bottom sheet with real zones
4. **Select a zone** - events should filter accordingly

**Success Indicators:**
- ✅ Bottom sheet shows real zone names (not "Mock Zone")
- ✅ Event counts are accurate
- ✅ Selecting a zone filters the events
- ✅ "EVERYWHERE" option shows all events

---

## 🔍 **Troubleshooting**

### **If Migration Fails:**
```bash
# Check migration status
dotnet ef migrations list

# If needed, rollback and try again
dotnet ef database update [previous-migration-name]
dotnet ef database update
```

### **If No Zones Appear:**
```sql
-- Check if venues have addresses
SELECT name, address, geographic_zone 
FROM catalog_venues 
LIMIT 10;

-- Manually set a test zone
UPDATE catalog_venues 
SET geographic_zone = 'Test Zone' 
WHERE venue_id = 1;
```

### **If API Returns Empty:**
```sql
-- Check if there are published events
SELECT COUNT(*) 
FROM events_scheduled 
WHERE is_published = true AND is_deleted = false;

-- Check venue-event relationships
SELECT v.geographic_zone, COUNT(e.event_id) as event_count
FROM catalog_venues v
LEFT JOIN events_scheduled e ON v.venue_id = e.venue_id
WHERE e.is_published = true AND e.is_deleted = false
GROUP BY v.geographic_zone;
```

---

## ✅ **Success Criteria**

**You're done when:**
1. ✅ Database migration applied successfully
2. ✅ Venues have geographic zones assigned
3. ✅ `/api/public/events/geographic-zones` returns zone data
4. ✅ Events API filters by `geographicZone` parameter
5. ✅ Frontend location picker shows real zones
6. ✅ Zone selection filters events correctly

---

## 📞 **Need Help?**

If you encounter any issues:
1. **Check the backend console** for error messages
2. **Verify database connection** is working
3. **Check if venues have addresses** that match the zone patterns
4. **Test API endpoints directly** before testing frontend

**The frontend team is ready to help test once the backend is deployed!** 🚀

---

## 🎉 **What Happens Next**

Once deployed:
- Users will see the new location search UX
- They can filter events by geographic zones
- Only zones with active events will be shown
- The feature works automatically with no frontend changes needed

**Great work implementing this feature!** 👏