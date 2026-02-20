# Backend Tasks - February 20, 2026 (URGENT)

**From:** Aldi (Frontend Developer)  
**To:** Prof Kristi (Backend Developer)  
**Date:** February 20, 2026  
**Priority:** HIGH - Both issues block production features

---

## Summary

Two critical backend issues discovered through comprehensive QA testing:

1. **Venue Exclusion Filtering** - Public menu API not filtering by venue exclusions
2. **Digital Ordering Toggle** - API schema missing `isDigitalOrderingEnabled` field

Both issues have complete frontend implementations but are blocked by backend API gaps.

---

## Issue #1: Venue Exclusion Filtering (Public Menu API)

### Problem
The `/api/public/Orders/menu` endpoint returns ALL categories and products, ignoring venue exclusions.

**Impact:** Customers at Restaurant see Beach Services. Customers at Beach see Restaurant-only items.

### Current Behavior
```
Customer scans QR at Restaurant (venueId=5)
→ GET /api/public/Orders/menu?venueId=5
→ Backend returns ALL categories/products (including excluded ones)
→ Customer sees Beach Services at Restaurant ❌
```

### Expected Behavior
```
Customer scans QR at Restaurant (venueId=5)
→ GET /api/public/Orders/menu?venueId=5
→ Backend filters out excluded categories/products
→ Customer sees only Restaurant menu ✅
```

### Backend Fix Required

**File:** `Controllers/Public/OrdersController.cs` (or similar)

**Add filtering to the query:**
```csharp
[HttpGet("menu")]
public async Task<IActionResult> GetMenu([FromQuery] int? venueId)
{
    if (!venueId.HasValue)
    {
        return BadRequest("venueId is required");
    }

    var categories = await _context.Categories
        .Where(c => c.IsActive)
        // ✅ ADD THIS: Filter out categories excluded from this venue
        .Where(c => !c.VenueExclusions.Any(e => e.VenueId == venueId.Value))
        .Include(c => c.Products)
        .Select(c => new PublicMenuCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Products = c.Products
                .Where(p => p.IsAvailable)
                // ✅ ADD THIS: Filter out products excluded from this venue
                .Where(p => !p.VenueExclusions.Any(e => e.VenueId == venueId.Value))
                .Select(p => new PublicMenuItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    // ...
                })
                .ToList()
        })
        .ToListAsync();
        
    return Ok(categories);
}
```

### Testing
1. Create category "Beach Services"
2. Exclude from venue "Restaurant" (venueId=5)
3. Call `GET /api/public/Orders/menu?venueId=5`
4. **Expected:** "Beach Services" NOT in response
5. Call `GET /api/public/Orders/menu?venueId=18` (Beach)
6. **Expected:** "Beach Services" IN response

### Database Indexes (Performance)
```sql
CREATE INDEX IX_CategoryVenueExclusions_VenueId ON CategoryVenueExclusions(VenueId);
CREATE INDEX IX_ProductVenueExclusions_VenueId ON ProductVenueExclusions(VenueId);
```

---

## Issue #2: Digital Ordering Toggle (API Schema)

### Problem
Backend request DTOs do NOT accept `isDigitalOrderingEnabled` field, even though:
- Frontend sends it ✅
- Backend database has it ✅
- Backend response DTOs return it ✅

**Impact:** Admins cannot override digital ordering. Settings are silently ignored.

### Current Behavior
```
Admin changes dropdown to "Force Enable"
→ Frontend sends: { isDigitalOrderingEnabled: true, ... }
→ Backend receives request
→ Backend ignores isDigitalOrderingEnabled (not in schema) ❌
→ Backend saves venue WITHOUT updating field ❌
→ Nothing changes ❌
```

### Expected Behavior
```
Admin changes dropdown to "Force Enable"
→ Frontend sends: { isDigitalOrderingEnabled: true, ... }
→ Backend accepts isDigitalOrderingEnabled ✅
→ Backend saves venue WITH field updated ✅
→ SpotPage receives correct value ✅
```

### Backend Fix Required

**1. Update Request DTOs (Add field to all 4 DTOs):**

**File:** `DTOs/Venues/UpdateVenueRequest.cs`
```csharp
public class UpdateVenueRequest
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; }
    
    [MaxLength(50)]
    public string? Type { get; set; }
    
    public string? Description { get; set; }
    
    [MaxLength(500)]
    public string? Address { get; set; }
    
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    
    public double? Latitude { get; set; }
    
    public double? Longitude { get; set; }
    
    public bool OrderingEnabled { get; set; }
    
    // ✅ ADD THIS FIELD
    public bool? IsDigitalOrderingEnabled { get; set; }
}
```

**Same field needed in:**
- `DTOs/Venues/BizUpdateVenueRequest.cs` (Business Admin)
- `DTOs/Venues/CreateVenueRequest.cs` (SuperAdmin)
- `DTOs/Venues/BizCreateVenueRequest.cs` (Business Admin)

**2. Update Controller Logic:**

**File:** `Controllers/SuperAdmin/VenuesController.cs`
```csharp
[HttpPut("{id}")]
public async Task<IActionResult> UpdateVenue(int businessId, int id, UpdateVenueRequest request)
{
    var venue = await _context.Venues.FindAsync(id);
    if (venue == null) return NotFound();
    
    venue.Name = request.Name;
    venue.Type = request.Type;
    venue.Description = request.Description;
    venue.Address = request.Address;
    venue.ImageUrl = request.ImageUrl;
    venue.Latitude = request.Latitude;
    venue.Longitude = request.Longitude;
    venue.OrderingEnabled = request.OrderingEnabled;
    
    // ✅ ADD THIS LINE
    venue.IsDigitalOrderingEnabled = request.IsDigitalOrderingEnabled;
    
    await _context.SaveChangesAsync();
    return Ok(venue);
}
```

**Same fix needed in:**
- `Controllers/Business/VenuesController.cs` (Business Admin)
- Both CREATE and UPDATE methods in both controllers

### Testing
1. Create Restaurant venue (type = "RESTAURANT")
2. Set "Digital Ordering Override" = "Force Enable"
3. Save venue
4. **Expected:** `isDigitalOrderingEnabled = true` in database
5. Scan QR at restaurant
6. **Expected:** Customer CAN order (sees "Add to Cart" buttons)

### Database Verification
```sql
-- Verify column exists
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Venues' AND COLUMN_NAME = 'IsDigitalOrderingEnabled';

-- Expected: bit, nullable
```

---

## Files to Reference

### Complete Analysis Documents
1. **SPOTPAGE_ORDERING_SYSTEM_COMPLETE_ANALYSIS.md** - Issue #1 deep dive
2. **DIGITAL_ORDERING_TOGGLE_COMPLETE_ANALYSIS.md** - Issue #2 deep dive

### Frontend Implementation (For Reference)
3. **frontend/src/pages/SpotPage.jsx** - How frontend uses the APIs
4. **frontend/src/components/dashboard/modals/VenueModals.jsx** - Digital ordering UI
5. **frontend/swagger.json** - Current API schema (shows the gaps)

---

## Priority & Timeline

### Issue #1: Venue Exclusion Filtering
- **Priority:** HIGH
- **Estimated Time:** 1-2 hours
- **Blocks:** Product exclusion feature (already built in frontend)
- **User Impact:** Customers see wrong menu items

### Issue #2: Digital Ordering Toggle
- **Priority:** HIGH
- **Estimated Time:** 1-2 hours
- **Blocks:** Manual ordering control (already built in frontend)
- **User Impact:** Admins cannot control ordering settings

**Total Estimated Time:** 2-4 hours for both fixes

---

## Testing Checklist

### After Issue #1 Fix
- [ ] Create category, exclude from venue
- [ ] Call public menu API with that venueId
- [ ] Verify excluded category NOT in response
- [ ] Call public menu API with different venueId
- [ ] Verify category IS in response
- [ ] Test with products too
- [ ] Deploy and test on production

### After Issue #2 Fix
- [ ] Create venue with "Force Enable"
- [ ] Verify field saved in database
- [ ] Refresh admin panel, verify dropdown shows saved value
- [ ] Scan QR, verify ordering works
- [ ] Create venue with "Force Disable"
- [ ] Scan QR, verify ordering disabled
- [ ] Deploy and test on production

---

## Deployment Notes

Both fixes are:
- ✅ Backend-only changes
- ✅ No frontend changes needed
- ✅ No database migrations needed (columns already exist)
- ✅ Backward compatible
- ✅ Can be deployed independently

---

## Questions?

If you need clarification on any of these issues:
1. Read the detailed analysis documents (listed above)
2. Check the swagger.json for current API schema
3. Look at SpotPage.jsx to see how frontend uses the APIs
4. Contact Aldi for frontend context

---

**Both issues are ready for implementation. Frontend is already complete and waiting for backend fixes.**
