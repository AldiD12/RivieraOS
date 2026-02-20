# Backend Public Venue Endpoint Missing - URGENT
**Date:** February 20, 2026  
**Status:** ❌ BLOCKING DIGITAL ORDERING  
**Priority:** CRITICAL

---

## Problem

SpotPage is getting 404 when trying to fetch venue details:
```
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues/18
Response: 404 Not Found
```

This endpoint is needed to get the `allowsDigitalOrdering` field, which controls whether customers can place orders.

---

## Impact

- ❌ Order buttons don't show on SpotPage
- ❌ Digital ordering toggle in admin doesn't work
- ❌ Customers cannot place orders even when enabled

---

## What's Needed

### Endpoint Required
```
GET /api/public/Venues/{id}
```

### Response Schema (PublicVenueDetailDto)
```json
{
  "id": 18,
  "name": "Main Beach",
  "type": "BEACH",
  "description": "...",
  "address": "...",
  "imageUrl": "...",
  "orderingEnabled": true,
  "allowsDigitalOrdering": true
}
```

### Key Field
```csharp
public bool AllowsDigitalOrdering { get; set; }
```

This should be the computed property that:
- Returns `isDigitalOrderingEnabled` if not null (manual override)
- Otherwise auto-calculates: Restaurant = false, Beach/Pool/Bar = true

---

## Backend Implementation

### File to Create/Check
`Controllers/Public/VenuesController.cs`

### Implementation
```csharp
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public VenuesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/public/Venues/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PublicVenueDetailDto>> GetVenue(int id)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            return Ok(new PublicVenueDetailDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Type = venue.Type,
                Description = venue.Description,
                Address = venue.Address,
                ImageUrl = venue.ImageUrl,
                OrderingEnabled = venue.OrderingEnabled,
                AllowsDigitalOrdering = venue.AllowsDigitalOrdering // Uses computed property
            });
        }
    }
}
```

### DTO (PublicVenueDetailDto)
```csharp
namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicVenueDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public bool OrderingEnabled { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
    }
}
```

### Venue Entity (Computed Property)
```csharp
public class Venue
{
    // ... other properties ...
    
    public bool? IsDigitalOrderingEnabled { get; set; }
    
    // Computed property
    public bool AllowsDigitalOrdering
    {
        get
        {
            // If manual override is set, use it
            if (IsDigitalOrderingEnabled.HasValue)
            {
                return IsDigitalOrderingEnabled.Value;
            }
            
            // Otherwise auto-calculate based on venue type
            if (string.IsNullOrEmpty(Type))
            {
                return false;
            }
            
            var upperType = Type.ToUpperInvariant();
            return upperType == "BEACH" || upperType == "POOL" || upperType == "BAR";
        }
    }
}
```

---

## Verification

### Test the Endpoint
```bash
curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues/18
```

**Expected Response:**
```json
{
  "id": 18,
  "name": "Main Beach",
  "type": "BEACH",
  "description": null,
  "address": null,
  "imageUrl": null,
  "orderingEnabled": true,
  "allowsDigitalOrdering": true
}
```

### Check Swagger
Visit: `https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/swagger`

Look for:
- **Venues** controller under "Public" section
- **GET /api/public/Venues/{id}** endpoint

---

## Current Workaround

SpotPage has fallback logic (lines 147-156):
```javascript
// Fallback: use menu data
venueData = {
  id: venueId,
  name: menuData[0]?.venueName || 'Venue',
  type: 'OTHER',
  allowsDigitalOrdering: false  // ← Defaults to false
};
```

This means:
- ✅ Menu loads correctly
- ❌ Order buttons don't show (defaults to false)
- ❌ Digital ordering toggle doesn't work

---

## Related Issues

This is connected to the digital ordering toggle issue documented in:
- `DIGITAL_ORDERING_TOGGLE_COMPLETE_ANALYSIS.md`

Both issues need to be fixed:
1. ✅ Backend accepts `isDigitalOrderingEnabled` in update DTOs (Prof Kristi needs to add this)
2. ❌ Backend provides public endpoint to read `allowsDigitalOrdering` (THIS ISSUE)

---

## Timeline

**Critical:** This blocks all digital ordering functionality.

**Estimated Fix Time:** 30 minutes
- Create VenuesController: 10 minutes
- Create PublicVenueDetailDto: 5 minutes
- Test with Postman: 5 minutes
- Deploy to Azure: 10 minutes

---

## Summary

The public Venues endpoint exists in swagger.json but returns 404, meaning it's not deployed or not implemented in the backend.

Prof Kristi needs to:
1. Create/verify `Controllers/Public/VenuesController.cs`
2. Implement `GET /api/public/Venues/{id}` endpoint
3. Return `PublicVenueDetailDto` with `allowsDigitalOrdering` field
4. Deploy to Azure Container Apps

Once deployed, SpotPage will automatically start showing order buttons for venues where digital ordering is enabled.
