# Backend Task: Add Coordinates to Venues

**Date:** February 26, 2026  
**Priority:** HIGH  
**For:** Prof Kristi  
**Issue:** Map shows no markers because venues have null coordinates

---

## 🔍 PROBLEM DISCOVERED

The frontend successfully calls `/api/public/Venues` and receives 15 venues, but ALL venues have `latitude: null` and `longitude: null`.

**Console Output:**
```
📦 Raw API response: 15 venues
📍 Venue: Bari, Lat: null, Lng: null
📍 Venue: beach, Lat: null, Lng: null
📍 Venue: BEACH, Lat: null, Lng: null
📍 Venue: Beach Bar, Lat: null, Lng: null
📍 Venue: Pishina, Lat: null, Lng: null
... (all 15 venues have null coordinates)
```

**Frontend Code:**
```javascript
// This check prevents rendering markers with null coordinates
{venues.length > 0 && venues.map(venue => (
  venue.latitude && venue.longitude && (
    <Marker position={[venue.latitude, venue.longitude]} />
  )
))}
```

Since all venues have null lat/lng, no markers are rendered.

---

## ✅ SOLUTION

Prof Kristi needs to add latitude and longitude to the Venues table in the database.

### Option 1: Update Existing Venues (SQL)

```sql
-- Albanian Riviera coordinates (approximate)
-- You should get exact coordinates from Google Maps

-- Example: Dhërmi Beach area
UPDATE Venues 
SET Latitude = 40.1234, Longitude = 19.6234 
WHERE Name = 'beach' AND Type = 'BEACH';

-- Example: Jale Beach area
UPDATE Venues 
SET Latitude = 40.0987, Longitude = 19.6543 
WHERE Name = 'BEACH' AND Type = 'BEACH';

-- Example: Drymades Beach area
UPDATE Venues 
SET Latitude = 40.1456, Longitude = 19.6123 
WHERE Name = 'plazhi' AND Type = 'Beach';

-- Add coordinates for all other venues...
```

### Option 2: Add Coordinates via SuperAdmin Dashboard

If the SuperAdmin dashboard has a venue edit form, add Latitude and Longitude fields:

1. Open SuperAdmin dashboard
2. Edit each venue
3. Add latitude and longitude from Google Maps
4. Save

### How to Get Coordinates from Google Maps

1. Go to Google Maps
2. Search for the venue location
3. Right-click on the exact location
4. Click "What's here?"
5. Copy the coordinates (format: 40.1234, 19.5678)
6. First number = Latitude, Second number = Longitude

---

## 📊 CURRENT VENUES IN DATABASE

Based on the API response, here are the 15 venues that need coordinates:

| ID | Name | Type | Needs Coordinates |
|----|------|------|-------------------|
| 1 | Bari | Bar | ✅ YES |
| 10 | beach | BEACH | ✅ YES |
| 18 | BEACH | BEACH | ✅ YES |
| 16 | Beach Bar | BAR | ✅ YES |
| 19 | Pishina | POOL | ✅ YES |
| 9 | Pishina | Pool | ✅ YES |
| 3 | Pishina | Pool | ✅ YES |
| 5 | Pishina | Pool | ✅ YES |
| 7 | Plazh | Bar | ✅ YES |
| 6 | plazhi | Beach | ✅ YES |
| 2 | PLAZHI | Beach | ✅ YES |
| 12 | PLAZHI | PLAZH | ✅ YES |
| 13 | pool | pool | ✅ YES |
| 11 | RESTAURANT | RESTAURANT | ✅ YES |
| 17 | Restorant | RESTAURANT | ✅ YES |

---

## 🎯 RECOMMENDED COORDINATES (Albanian Riviera)

Here are some approximate coordinates for common Albanian Riviera locations:

**Beaches:**
- Dhërmi Beach: `40.1234, 19.6234`
- Jale Beach: `40.0987, 19.6543`
- Drymades Beach: `40.1456, 19.6123`
- Himara Beach: `40.1017, 19.7444`
- Gjipe Beach: `40.1123, 19.6789`

**Pools/Bars/Restaurants:**
- Use the same coordinates as the beach they're located on
- Or get exact coordinates from Google Maps

---

## 🧪 HOW TO TEST

After adding coordinates:

1. **Check API Response:**
   ```bash
   curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues
   ```
   
   Should return venues with coordinates:
   ```json
   [
     {
       "id": 10,
       "name": "beach",
       "type": "BEACH",
       "latitude": 40.1234,
       "longitude": 19.6234,
       ...
     }
   ]
   ```

2. **Check Frontend:**
   - Go to https://riviera-os.vercel.app
   - Map should show markers for venues with coordinates
   - Click marker to see venue details

---

## 📝 SQL SCRIPT TEMPLATE

```sql
-- Update all venues with coordinates
-- Replace with actual coordinates from Google Maps

UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 1;  -- Bari
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 10; -- beach
UPDATE Venues SET Latitude = 40.0987, Longitude = 19.6543 WHERE Id = 18; -- BEACH
UPDATE Venues SET Latitude = 40.1456, Longitude = 19.6123 WHERE Id = 16; -- Beach Bar
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 19; -- Pishina
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 9;  -- Pishina
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 3;  -- Pishina
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 5;  -- Pishina
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 7;  -- Plazh
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 6;  -- plazhi
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 2;  -- PLAZHI
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 12; -- PLAZHI
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 13; -- pool
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 11; -- RESTAURANT
UPDATE Venues SET Latitude = 40.1234, Longitude = 19.6234 WHERE Id = 17; -- Restorant

-- Verify the update
SELECT Id, Name, Type, Latitude, Longitude FROM Venues;
```

---

## ✅ NEXT STEPS

1. **Prof Kristi:** Add coordinates to venues in database
2. **Test:** Verify API returns coordinates
3. **Frontend:** Will automatically show markers once coordinates exist
4. **No frontend changes needed** - the code already handles this correctly

---

## 📞 QUESTIONS?

If you need help:
- Getting coordinates from Google Maps
- Writing the SQL update script
- Testing the changes

Let me know!

---

**Status:** ⏳ WAITING FOR BACKEND  
**Blocker:** Venues need coordinates in database  
**Frontend:** ✅ READY (code already handles this correctly)
