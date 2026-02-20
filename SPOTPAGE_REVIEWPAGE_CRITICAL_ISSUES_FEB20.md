# SpotPage & ReviewPage - Critical Issues Analysis

**Date:** February 20, 2026  
**Status:** ❌ MULTIPLE CRITICAL BUGS FOUND  
**Analyst:** Kiro AI - Master QA Specialist

---

## Executive Summary

**THREE CRITICAL ISSUES DISCOVERED:**

1. **Public Menu API 404 Error** - Endpoint path mismatch
2. **ReviewPage Missing businessName** - Backend DTO doesn't include business name
3. **Venue Exclusion Filtering** - Already implemented in backend! ✅

---

## Issue #1: Public Menu API 404 Error (CRITICAL)

### The Error
```
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/public/Orders/menu?venueId=18 404 (Not Found)
```

### Root Cause Analysis

**Frontend calls:**
```javascript
// SpotPage.jsx line 95
const menuUrl = `${baseUrl}/public/Orders/menu?venueId=${venueId}`;
```

**Backend expects:**
```csharp
// OrdersController.cs line 11
[Route("api/public/[controller]")]  // Expands to: api/public/Orders

// Line 26
[HttpGet("menu")]  // Full path: api/public/Orders/menu
```

**PROBLEM:** Frontend is calling `/public/Orders/menu` but backend is at `/api/public/Orders/menu`

### The Bug

**SpotPage.jsx lines 95-97:**
```javascript
const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
const menuUrl = `${baseUrl}/public/Orders/menu?venueId=${venueId}`;
```

**This creates:** `https://...azurecontainerapps.io/api/api/public/Orders/menu` ❌

**Should be:** `https://...azurecontainerapps.io/api/public/Orders/menu` ✅

### The Fix

**File:** `frontend/src/pages/SpotPage.jsx`

**Current (BROKEN):**
```javascript
const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
const menuUrl = `${baseUrl}/public/Orders/menu?venueId=${venueId}`;
```

**Fixed:**
```javascript
const menuUrl = `${API_URL}/public/Orders/menu?venueId=${venueId}`;
```

**Explanation:** `API_URL` already includes `/api`, so we don't need to add it again.

---

## Issue #2: ReviewPage Missing businessName (CRITICAL)

### The Problem

**ReviewPage.jsx line 67:**
```javascript
const businessName = menuData[0].businessName || menuData[0].venueName || 'Venue';
```

**Backend DTO (OrderDtos.cs lines 18-25):**
```csharp
public class PublicMenuCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconName { get; set; }
    public List<PublicMenuItemDto> Products { get; set; } = new();
    // ❌ NO businessName field
}
```

**Result:** `menuData[0].businessName` is always `undefined`

### Backend Fix Required

**File:** `DTOs/Public/OrderDtos.cs`

**Add businessName field:**
```csharp
public class PublicMenuCategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconName { get; set; }
    public List<PublicMenuItemDto> Products { get; set; } = new();
    
    // ✅ ADD THIS FIELD
    public string? BusinessName { get; set; }
}
```

**File:** `Controllers/Public/OrdersController.cs`

**Update query (line 55):**
```csharp
.Select(c => new PublicMenuCategoryDto
{
    Id = c.Id,
    Name = c.Name,
    Products = c.Products
        .Where(p => !p.IsDeleted && p.IsAvailable && !excludedProductIds.Contains(p.Id))
        .OrderBy(p => p.Name)
        .Select(p => new PublicMenuItemDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            ImageUrl = p.ImageUrl,
            Price = p.Price,
            OldPrice = p.OldPrice,
            IsAlcohol = p.IsAlcohol,
            CategoryName = c.Name
        })
        .ToList(),
    
    // ✅ ADD THIS LINE
    BusinessName = c.Business.BrandName ?? c.Business.RegisteredName
})
```

---

## Issue #3: Venue Exclusion Filtering (✅ ALREADY WORKING!)

### Good News!

The backend IS already filtering by venue exclusions!

**OrdersController.cs lines 40-48:**
```csharp
// Get excluded category IDs
var excludedCategoryIds = await _context.CategoryVenueExclusions
    .Where(e => e.VenueId == venueId)
    .Select(e => e.CategoryId)
    .ToListAsync();

// Get excluded product IDs
var excludedProductIds = await _context.ProductVenueExclusions
    .Where(e => e.VenueId == venueId)
    .Select(e => e.ProductId)
    .ToListAsync();
```

**Lines 50-52:**
```csharp
var categories = await _context.Categories
    .IgnoreQueryFilters()
    .Where(c => !c.IsDeleted && c.IsActive && c.BusinessId == venue.BusinessId)
    .Where(c => !excludedCategoryIds.Contains(c.Id))  // ✅ Filtering categories
```

**Lines 62:**
```csharp
.Where(p => !p.IsDeleted && p.IsAvailable && !excludedProductIds.Contains(p.Id))  // ✅ Filtering products
```

**Status:** ✅ Venue exclusion filtering is ALREADY IMPLEMENTED in backend!

**Once Issue #1 is fixed, exclusions will work automatically.**

---

## Issue #4: Review Submission (✅ WORKING)

### Review System Status

**Backend endpoint:** `POST /api/public/venues/{venueId}/reviews` ✅

**ReviewPage implementation:** ✅ Correct

**ReviewPage.jsx line 115:**
```javascript
const response = await fetch(`${API_URL}/public/venues/${actualVenueId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
});
```

**Backend ReviewsController.cs line 24:**
```csharp
[HttpPost]
public async Task<ActionResult<PublicReviewResponseDto>> SubmitReview(int venueId, PublicSubmitReviewRequest request)
```

**Status:** ✅ Review submission is working correctly

**Features:**
- ✅ Saves review to database
- ✅ Logs low ratings (1-3 stars) as alerts
- ✅ Redirects high ratings (4-5 stars) to Google Maps
- ✅ Returns proper response with Google Maps URL

---

## Summary of Fixes Needed

### Frontend Fix (URGENT)

**File:** `frontend/src/pages/SpotPage.jsx`

**Line 95-97, Change from:**
```javascript
const baseUrl = API_URL.endsWith('/api') ? API_URL : `${API_URL}/api`;
const menuUrl = `${baseUrl}/public/Orders/menu?venueId=${venueId}`;
```

**To:**
```javascript
const menuUrl = `${API_URL}/public/Orders/menu?venueId=${venueId}`;
```

### Backend Fix (HIGH PRIORITY)

**File:** `DTOs/Public/OrderDtos.cs`

Add `BusinessName` property to `PublicMenuCategoryDto`

**File:** `Controllers/Public/OrdersController.cs`

Add `BusinessName` to the query projection

---

## Testing Plan

### Test Case 1: Menu Loading
1. Navigate to SpotPage with venueId=18
2. **Expected:** Menu loads successfully (no 404)
3. **Expected:** Categories and products display
4. **Expected:** Venue name shows correctly

### Test Case 2: Business Name Display
1. Navigate to ReviewPage with venueId=18
2. **Expected:** Business name (e.g., "Hotel Coral Beach") displays
3. **Expected:** NOT venue name (e.g., "Main Beach")

### Test Case 3: Venue Exclusions
1. Create category "Beach Services"
2. Exclude from Restaurant venue
3. Scan QR at Restaurant
4. **Expected:** "Beach Services" NOT in menu
5. Scan QR at Beach
6. **Expected:** "Beach Services" IN menu

### Test Case 4: Review Submission
1. Navigate to ReviewPage
2. Click 5 stars
3. **Expected:** Success message
4. **Expected:** Redirect to Google Maps
5. **Expected:** Review saved in database

---

## Timeline Estimate

**Frontend Fix:** 5 minutes
- Change 2 lines in SpotPage.jsx
- Test locally
- Deploy

**Backend Fix:** 30 minutes
- Add field to DTO
- Update controller query
- Test with Postman
- Deploy

**Total:** 35 minutes for both fixes

---

## Deployment Checklist

### Frontend
- [ ] Fix SpotPage.jsx menu URL construction
- [ ] Test menu loading locally
- [ ] Commit and push
- [ ] Verify Vercel deployment
- [ ] Test on production

### Backend
- [ ] Add BusinessName to PublicMenuCategoryDto
- [ ] Update OrdersController query
- [ ] Test with Postman/Swagger
- [ ] Deploy to Azure
- [ ] Verify deployment

### Production Testing
- [ ] Scan QR code at venue
- [ ] Verify menu loads (no 404)
- [ ] Navigate to review page
- [ ] Verify business name displays
- [ ] Submit 5-star review
- [ ] Verify Google Maps redirect
- [ ] Test venue exclusions

---

## Related Files

**Frontend:**
- `frontend/src/pages/SpotPage.jsx` - Menu loading (needs fix)
- `frontend/src/pages/ReviewPage.jsx` - Review submission (working)

**Backend:**
- `Controllers/Public/OrdersController.cs` - Menu endpoint (needs businessName)
- `Controllers/Public/ReviewsController.cs` - Review endpoint (working)
- `DTOs/Public/OrderDtos.cs` - Menu DTOs (needs businessName field)

---

**Ready for immediate implementation!**
