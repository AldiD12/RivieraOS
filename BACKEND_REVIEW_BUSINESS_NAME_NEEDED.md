 # Backend Task: Add Business Name to Public Endpoints

**Priority:** HIGH  
**For:** Prof Kristi  
**Date:** February 11, 2026

---

## Problem

The ReviewPage needs to display the **business/brand name** (e.g., "Hotel Coral Beach") but the current public API endpoints only return **venue name** (e.g., "beach", "Main Beach").

Customers want to review the business, not the specific venue/beach.

---

## Current API Response

### GET `/api/public/Reservations/zones?venueId=10`
```json
[
  {
    "zoneId": 15,
    "zoneName": "REGULAR",
    "venue": {
      "id": 10,
      "name": "beach",  // ❌ This is venue name, not business name
      "type": "BEACH"
    }
  }
]
```

### GET `/api/public/Orders/menu?venueId=10`
```json
[
  {
    "id": 6,
    "name": "Pijet",
    "products": [...]
    // ❌ No business name field at all
  }
]
```

---

## What We Need

Add `businessName` or `brandName` field to these public endpoints:

### Option 1: Add to Zones Endpoint (PREFERRED)
```json
{
  "zoneId": 15,
  "zoneName": "REGULAR",
  "venue": {
    "id": 10,
    "name": "beach",
    "type": "BEACH",
    "businessName": "Hotel Coral Beach",  // ✅ ADD THIS
    "brandName": "Coral Beach Resort"     // ✅ OR THIS
  }
}
```

### Option 2: Add to Menu Endpoint
```json
{
  "id": 6,
  "name": "Pijet",
  "businessName": "Hotel Coral Beach",  // ✅ ADD THIS
  "venueName": "beach",
  "products": [...]
}
```

---

## Why We Need This

1. **ReviewPage** (`/review?v={venueId}`) needs to show business name
2. Customers review the **business** (Hotel Coral Beach), not the **venue** (beach)
3. Currently showing "Your Experience At: beach" ❌
4. Should show "Your Experience At: Hotel Coral Beach" ✅

---

## Recommended Solution

**Add `businessName` and `brandName` to the `venue` object in zones endpoint:**

```csharp
// In your Zones DTO
public class PublicVenueDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string BusinessName { get; set; }  // ADD THIS - from Business.RegisteredName
    public string BrandName { get; set; }     // ADD THIS - from Business.BrandName
    public string Address { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}
```

This way the frontend can use:
- `venue.businessName` or `venue.brandName` for display
- `venue.name` for internal reference
- `venue.address` for location

---

## Frontend Usage

Once you add this, the frontend will automatically use it:

```javascript
// ReviewPage.jsx
const businessName = zonesData[0].venue.businessName || 
                     zonesData[0].venue.brandName || 
                     zonesData[0].venue.name;

setVenue({
  name: businessName,  // "Hotel Coral Beach" instead of "beach"
  location: zonesData[0].venue.address
});
```

---

## Impact

- ✅ ReviewPage will show correct business name
- ✅ Customers can properly review the business
- ✅ Google Maps integration will work with business name
- ✅ No breaking changes (we have fallbacks)

---

## Timeline

**Needed:** As soon as possible  
**Blocking:** Review system user experience

Please let us know when this is deployed! 🙏
