# 🔴 URGENT: Public Menu Endpoint Missing - SpotPage Broken

**Date:** February 20, 2026  
**Priority:** 🔴 CRITICAL  
**Status:** ❌ BLOCKING PRODUCTION  
**Impact:** Customers cannot order via QR codes

---

## 🚨 PROBLEM

SpotPage (customer QR code ordering) is completely broken with 404 error:

```
GET /api/public/Orders/menu?venueId=18
404 (Not Found)
```

**Console Error:**
```
📡 Fetching menu from: https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/public/Orders/menu?venueId=18
❌ Menu fetch failed: 404
❌ Error fetching data: Error: Failed to load menu: 404
```

**User Impact:**
- ❌ QR code scanning shows error
- ❌ No menu display
- ❌ Cannot place orders
- ❌ Entire customer ordering flow blocked

---

## 📋 REQUIRED ENDPOINT

### GET /api/public/Orders/menu

**Route:** `/api/public/Orders/menu`  
**Authorization:** None (public endpoint)  
**Controller:** `Controllers/Public/OrdersController.cs`

**Query Parameters:**
- `venueId` (integer, required) - The venue ID

**Response:** `200 OK`
```json
[
  {
    "categoryId": 1,
    "categoryName": "Cocktails",
    "venueName": "BEACH",
    "products": [
      {
        "id": 10,
        "name": "Mojito",
        "description": "Classic Cuban cocktail",
        "price": 12.50,
        "imageUrl": "https://...",
        "isAvailable": true
      }
    ]
  }
]
```

---

## 💻 IMPLEMENTATION

### DTOs Needed

```csharp
namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicMenuCategoryDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public List<PublicMenuProductDto> Products { get; set; } = new();
    }

    public class PublicMenuProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
    }
}
```

### Controller Method

```csharp
// File: Controllers/Public/OrdersController.cs

[HttpGet("menu")]
[AllowAnonymous]
public async Task<ActionResult<List<PublicMenuCategoryDto>>> GetMenu([FromQuery] int venueId)
{
    try
    {
        // Get venue to verify it exists
        var venue = await _context.Venues
            .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted);
            
        if (venue == null)
        {
            return NotFound(new { error = "Venue not found" });
        }

        // Get all active categories for this venue's business with their products
        var categories = await _context.Categories
            .Where(c => c.BusinessId == venue.BusinessId && !c.IsDeleted)
            .Include(c => c.Products.Where(p => !p.IsDeleted))
            .OrderBy(c => c.SortOrder)
            .Select(c => new PublicMenuCategoryDto
            {
                CategoryId = c.Id,
                CategoryName = c.Name,
                VenueName = venue.Name,
                Products = c.Products
                    .Where(p => !p.IsDeleted)
                    .OrderBy(p => p.SortOrder)
                    .Select(p => new PublicMenuProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description ?? string.Empty,
                        Price = p.Price,
                        ImageUrl = p.ImageUrl,
                        IsAvailable = p.IsAvailable
                    })
                    .ToList()
            })
            .ToListAsync();

        return Ok(categories);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching public menu for venue {VenueId}", venueId);
        return StatusCode(500, new { error = "Failed to load menu" });
    }
}
```

---

## 🧪 TESTING

### Test 1: Valid Venue with Products
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18

Expected: 200 OK with array of categories and products
```

### Test 2: Valid Venue without Products
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=1

Expected: 200 OK with empty array []
```

### Test 3: Invalid Venue
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=99999

Expected: 404 Not Found with error message
```

### Test 4: Missing venueId Parameter
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu

Expected: 400 Bad Request
```

---

## ✅ FRONTEND STATUS

Frontend is already implemented and waiting for this endpoint:

**File:** `frontend/src/pages/SpotPage.jsx`

**Code (Line ~140):**
```javascript
const menuResponse = await fetch(
  `${API_URL}/public/Orders/menu?venueId=${venueId}`
);

if (!menuResponse.ok) {
  throw new Error(`Failed to load menu: ${menuResponse.status}`);
}

const menuData = await menuResponse.json();
```

**Frontend expects:**
- Array of categories with products
- Each category has: categoryId, categoryName, venueName, products[]
- Each product has: id, name, description, price, imageUrl, isAvailable

---

## 🔍 RELATED ENDPOINTS

These public endpoints already exist and work:

1. ✅ `POST /api/public/Orders` - Place order (works)
2. ✅ `POST /api/public/Bookings` - Create booking (works)
3. ✅ `GET /api/public/Venues/{id}` - Get venue details (works)
4. ❌ `GET /api/public/Orders/menu` - Get menu (MISSING)

---

## 📊 DATABASE SCHEMA

**Tables Involved:**
- `Venues` - Get venue info
- `Categories` - Get categories for business
- `Products` - Get products for each category

**Relationships:**
```
Venue (id=18, businessId=5)
  └─> Business (id=5)
      └─> Categories (businessId=5)
          └─> Products (categoryId=X)
```

**Key Fields:**
- `Categories.BusinessId` - Link to business
- `Categories.IsDeleted` - Filter out deleted
- `Categories.SortOrder` - Display order
- `Products.CategoryId` - Link to category
- `Products.IsDeleted` - Filter out deleted
- `Products.IsAvailable` - Show availability
- `Products.SortOrder` - Display order

---

## ⚠️ IMPORTANT NOTES

### 1. Business vs Venue
- Categories belong to BUSINESS, not venue
- Multiple venues can share the same menu (same business)
- Query: `Categories.BusinessId == venue.BusinessId`

### 2. Filtering
- Must filter `IsDeleted = false` for both categories and products
- Should respect `IsAvailable` flag for products
- Order by `SortOrder` for consistent display

### 3. Image URLs
- Should return full Azure Blob Storage URLs
- Frontend displays images directly
- Null/empty imageUrl is acceptable (frontend has fallback)

### 4. Performance
- Include products in single query (avoid N+1)
- Use `.Include()` for eager loading
- Consider caching if menu is large

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Create DTOs in `DTOs/Public/` folder
- [ ] Add method to `OrdersController.cs`
- [ ] Add `[AllowAnonymous]` attribute
- [ ] Test locally with Swagger
- [ ] Test with real venue IDs
- [ ] Deploy to Azure Container Apps
- [ ] Test on production URL
- [ ] Verify SpotPage loads correctly
- [ ] Test QR code scanning end-to-end

---

## ⏱️ ESTIMATED TIME

- **Implementation:** 20 minutes
- **Testing:** 15 minutes
- **Deployment:** 10 minutes
- **Total:** 45 minutes

---

## 🎯 SUCCESS CRITERIA

- [x] Endpoint returns 200 OK for valid venue
- [x] Response matches expected DTO structure
- [x] Categories ordered by SortOrder
- [x] Products ordered by SortOrder
- [x] Deleted items filtered out
- [x] Image URLs are full paths
- [x] SpotPage loads without errors
- [x] Menu displays correctly
- [x] Customers can place orders

---

## 📞 CONTACT

**For:** Prof Kristi  
**From:** Frontend Team  
**Urgency:** 🔴 CRITICAL - Blocking production  
**ETA Needed:** ASAP

**Test URL after deployment:**
```
https://riviera-os.vercel.app/spot?v=18&z=16&u=8
```

Should show menu and allow ordering.

---

**Created:** February 20, 2026  
**Status:** ⏳ WAITING FOR BACKEND IMPLEMENTATION  
**Blocking:** Customer ordering, QR code functionality, SpotPage
