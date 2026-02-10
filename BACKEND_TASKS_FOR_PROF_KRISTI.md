# Backend Tasks for Prof Kristi - February 10, 2026

## 🎯 MEETING AGENDA - COMPLETE LIST

### What We Need to Discuss Today:

1. **Zone IsActive Field** (CRITICAL - 10 minutes)
2. **QR Code System Status** (5 minutes)
3. **Optional Improvements** (5 minutes)

---

## 🔴 ISSUE #1: Zone `IsActive` Field Missing (CRITICAL)

**Problem**: `VenueZone` entity is missing the `IsActive` field, causing zones to be inactive by default.

**Impact**: 
- ✅ Zones can be created successfully
- ❌ But they are inactive by default
- ❌ Frontend shows "No zones found" when filtering by `is_active = 1`
- ❌ Cannot create units for inactive zones
- ❌ QR code system blocked completely

**Root Cause**:
```csharp
// File: BlackBear.Services.Core/Entities/VenueZone.cs
public class VenueZone
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string ZoneType { get; set; }
    // ... other fields ...
    
    // ❌ MISSING: public bool IsActive { get; set; }
}
```

**Solution - 3 Steps**:

### Step 1: Add Field to Entity (2 minutes)
```csharp
// File: BlackBear.Services.Core/Entities/VenueZone.cs
public class VenueZone
{
    // ... existing fields ...
    
    public bool IsActive { get; set; } = true; // ADD THIS LINE
}
```

### Step 2: Run SQL Migration (2 minutes)
```sql
-- Add is_active column to catalog_venue_zones table
ALTER TABLE catalog_venue_zones 
ADD is_active BIT NOT NULL DEFAULT 1;

-- Set all existing zones to active
UPDATE catalog_venue_zones 
SET is_active = 1;
```

### Step 3: Update CreateZone Method (2 minutes)
```csharp
// File: Controllers/Business/ZonesController.cs
// In CreateZone method, ensure IsActive is set:

[HttpPost]
public async Task<IActionResult> CreateZone([FromBody] CreateZoneRequest request)
{
    var zone = new VenueZone
    {
        VenueId = request.VenueId,
        Name = request.Name,
        ZoneType = request.ZoneType,
        CapacityPerUnit = request.CapacityPerUnit,
        BasePrice = request.BasePrice,
        IsActive = true // ADD THIS LINE
    };
    
    await _context.VenueZones.AddAsync(zone);
    await _context.SaveChangesAsync();
    
    return Ok(zone);
}
```

**Testing After Fix**:
1. Create a new zone → Should be active by default
2. Check existing zones → Should all be active after SQL update
3. Frontend should now show zones
4. Units can be created
5. QR codes will display units

**Estimated Time**: 10 minutes total

---

## ✅ ISSUE #2: QR Code System Status

**Good News**: Frontend is 100% complete and deployed!

**What's Working**:
- ✅ QR Code Generator page (`/qr-generator`)
- ✅ Fetches venues and zones
- ✅ Fetches units for each zone
- ✅ Generates QR codes with format: `/spot?v={venueId}&z={zoneId}&u={unitCode}`
- ✅ Download individual QR codes as PNG
- ✅ Print all QR codes (print-friendly layout)
- ✅ Spot landing page (`/spot`) with Order and Book tabs
- ✅ Public API endpoints working (orders, reservations)

**What's Blocked**:
- ❌ QR Generator shows "No units in this zone yet"
- ❌ Reason: Zones are inactive, so units can't be created
- ❌ Once Issue #1 is fixed, QR system will be 100% operational

**No Backend Changes Needed** - Just fix Issue #1!

---

## 🟡 ISSUE #3: Optional Improvements (Nice to Have)

### 3A. Include Units in Zones API Response

**Current Behavior**:
```
GET /api/business/venues/{venueId}/Zones
```

**Current Response**:
```json
[
  {
    "id": 10,
    "name": "VIP - SUNBED",
    "zoneType": "SUNBED",
    "capacityPerUnit": 1,
    "basePrice": 0
  }
]
```

**Desired Response**:
```json
[
  {
    "id": 10,
    "name": "VIP - SUNBED",
    "zoneType": "SUNBED",
    "capacityPerUnit": 1,
    "basePrice": 0,
    "units": [
      {
        "id": 1,
        "unitCode": "A1",
        "unitType": "Sunbed",
        "status": "Available",
        "basePrice": 50
      }
    ]
  }
]
```

**Why?**:
- Frontend currently makes 2 API calls (zones + units)
- Would be more efficient with 1 call
- Reduces load time

**Solution**:
```csharp
// File: DTOs/Business/ZoneDtos.cs
public class BizZoneListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string ZoneType { get; set; }
    public int CapacityPerUnit { get; set; }
    public double BasePrice { get; set; }
    public List<BizZoneUnitListItemDto> Units { get; set; } // ADD THIS
}

// File: Controllers/Business/ZonesController.cs
[HttpGet]
public async Task<IActionResult> GetZones(int venueId)
{
    var zones = await _context.VenueZones
        .Where(z => z.VenueId == venueId && z.IsActive)
        .Include(z => z.Units) // ADD THIS
        .Select(z => new BizZoneListItemDto
        {
            Id = z.Id,
            Name = z.Name,
            ZoneType = z.ZoneType,
            CapacityPerUnit = z.CapacityPerUnit,
            BasePrice = z.BasePrice,
            Units = z.Units.Select(u => new BizZoneUnitListItemDto // ADD THIS
            {
                Id = u.Id,
                UnitCode = u.UnitCode,
                UnitType = u.UnitType,
                Status = u.Status,
                BasePrice = u.BasePrice
            }).ToList()
        })
        .ToListAsync();
        
    return Ok(zones);
}
```

**Priority**: Low (frontend workaround exists)
**Estimated Time**: 15 minutes

---

### 3B. Add Public Venue Endpoint

**Current Behavior**:
- Frontend uses menu endpoint to get venue name
- Workaround works but not ideal

**Better Solution**:
```
GET /api/public/venues/{venueId}
```

**Response**:
```json
{
  "id": 5,
  "name": "Beach Club Coral",
  "type": "BEACH",
  "address": "Durrës Beach",
  "imageUrl": "https://...",
  "isActive": true
}
```

**Implementation**:
```csharp
// File: Controllers/Public/VenuesController.cs (NEW FILE)
[ApiController]
[Route("api/public/[controller]")]
public class VenuesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public VenuesController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    [HttpGet("{venueId}")]
    public async Task<IActionResult> GetPublicVenue(int venueId)
    {
        var venue = await _context.Venues
            .Where(v => v.Id == venueId && v.IsActive)
            .Select(v => new PublicVenueDto
            {
                Id = v.Id,
                Name = v.Name,
                Type = v.Type,
                Address = v.Address,
                ImageUrl = v.ImageUrl,
                IsActive = v.IsActive
            })
            .FirstOrDefaultAsync();
            
        if (venue == null)
            return NotFound();
            
        return Ok(venue);
    }
}
```

**Priority**: Low (frontend workaround exists)
**Estimated Time**: 10 minutes

---

## 📊 SUMMARY TABLE

| Issue | Priority | Status | Time | Blocks QR System? |
|-------|----------|--------|------|-------------------|
| #1: Zone IsActive Field | 🔴 CRITICAL | Not Fixed | 10 min | ✅ YES |
| #2: QR Code System | ✅ DONE | Complete | 0 min | N/A |
| #3A: Units in Zones API | 🟡 Optional | Not Done | 15 min | ❌ NO |
| #3B: Public Venue API | 🟡 Optional | Not Done | 10 min | ❌ NO |

---

## 🎯 RECOMMENDED ACTION PLAN

### Today (Must Do):
1. ✅ Fix Issue #1 (Zone IsActive) - **10 minutes**
2. ✅ Test zone creation
3. ✅ Test unit creation
4. ✅ Verify QR codes work

### Later (Nice to Have):
- Issue #3A: Include units in zones API
- Issue #3B: Add public venue endpoint

---

## ✅ WHAT'S ALREADY WORKING

### Backend APIs (All Working):
- ✅ `POST /api/business/venues/{venueId}/Zones` - Create zone
- ✅ `GET /api/business/venues/{venueId}/Zones` - List zones
- ✅ `POST /api/business/venues/{venueId}/Units/bulk` - Bulk create units
- ✅ `GET /api/business/venues/{venueId}/Units` - List units
- ✅ `POST /api/public/Orders` - Place order
- ✅ `POST /api/public/Reservations` - Create booking
- ✅ `GET /api/public/venues/{venueId}/menu` - Get venue menu
- ✅ Cron job (midnight reset) - Tested and working!

### Frontend Pages (All Working):
- ✅ Business Dashboard
- ✅ Zone Units Manager
- ✅ QR Code Generator
- ✅ Spot Landing Page (Order + Book tabs)
- ✅ Test Cron Page

### Deployment:
- ✅ Frontend: https://riviera-os.vercel.app (auto-deploys from GitHub)
- ✅ Backend: https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api

---

## 🚀 AFTER ISSUE #1 IS FIXED

**Entire QR Code System Will Be Production-Ready!**

1. Admin creates venue
2. Admin creates zones
3. Admin creates units (bulk create 10+ at once)
4. Admin generates QR codes
5. Admin prints QR codes
6. QR codes placed on sunbeds/tables
7. Customers scan QR codes
8. Customers can order food/drinks
9. Customers can book sunbeds/tables
10. Staff receives orders in real-time
11. Bookings reset at midnight automatically

**Everything works except zones being inactive by default!**

---

## 📝 TESTING CHECKLIST (After Fix)

1. ✅ Create new venue
2. ✅ Create new zone → Should be active
3. ✅ Create units (bulk create 10 units)
4. ✅ Go to QR Generator page
5. ✅ Select venue
6. ✅ Should see zones with units
7. ✅ QR codes should display
8. ✅ Download QR code as PNG
9. ✅ Print all QR codes
10. ✅ Scan QR code with phone
11. ✅ Should open `/spot` page
12. ✅ Order tab should show menu
13. ✅ Book tab should show reservation form

---

## 💬 QUESTIONS FOR PROF KRISTI

1. Can you fix Issue #1 today? (10 minutes)
2. Do you want to implement Issue #3A and #3B? (optional, 25 minutes)
3. Any questions about the QR code system?
4. Need help testing after deployment?

---

## 📞 CONTACT

- Frontend deployed: https://riviera-os.vercel.app
- Backend API: https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api
- All frontend code in GitHub (auto-deploys)
- Test credentials available if needed

---

**BOTTOM LINE**: Fix Issue #1 (10 minutes) → QR Code System 100% Ready! 🎉
