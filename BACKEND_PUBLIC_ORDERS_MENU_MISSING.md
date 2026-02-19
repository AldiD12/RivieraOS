# 🔴 URGENT: Public Orders Menu Endpoint Missing

## Issue

SpotPage (customer ordering page) is failing with 404 error:

```
GET /api/public/Orders/menu?venueId=18
404 (Not Found)
```

## Current Status

❌ **Endpoint Missing:** `/api/public/Orders/menu`  
✅ **Swagger shows it exists** - But not deployed to production  
✅ **Frontend is ready** - Already calling the endpoint correctly

## Required Endpoint

### GET /api/public/Orders/menu

**Purpose:** Get menu (categories and products) for a specific venue for customer ordering

**Authorization:** None (public endpoint)

**Route:** `/api/public/Orders/menu`

**Query Parameters:**
- `venueId` (integer, required) - The venue ID

**Response:** `200 OK` with array of categories and products

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

## Expected Schema

Based on swagger.json, the response should be:

```csharp
public class PublicMenuCategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; }
    public string VenueName { get; set; }
    public List<PublicMenuProductDto> Products { get; set; }
}

public class PublicMenuProductDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
}
```

## Implementation

This should be in `Controllers/Public/OrdersController.cs`:

```csharp
[HttpGet("menu")]
public async Task<IActionResult> GetMenu([FromQuery] int venueId)
{
    // Get all active categories for this venue with their products
    var categories = await _context.Categories
        .Where(c => c.BusinessId == venueId && !c.IsDeleted)
        .Include(c => c.Products.Where(p => !p.IsDeleted))
        .OrderBy(c => c.SortOrder)
        .Select(c => new PublicMenuCategoryDto
        {
            CategoryId = c.Id,
            CategoryName = c.Name,
            VenueName = c.Business.Name, // Assuming Business navigation property
            Products = c.Products
                .OrderBy(p => p.SortOrder)
                .Select(p => new PublicMenuProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsAvailable = p.IsAvailable
                })
                .ToList()
        })
        .ToListAsync();

    return Ok(categories);
}
```

## Testing

After deployment:

```bash
# Test with venue 18 (BEACH)
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18

# Expected: 200 OK with array of categories and products
# If venue has no categories: 200 OK with empty array []
```

## Frontend Usage

Frontend is already configured:

```javascript
// frontend/src/pages/SpotPage.jsx
const menuResponse = await fetch(`${API_URL}/public/Orders/menu?venueId=${venueId}`);
const menuData = await menuResponse.json();
```

## Priority

🔴 **CRITICAL** - Customers cannot order without this endpoint. SpotPage is completely broken.

## Impact

- QR code scanning leads to error page
- No customer ordering possible
- No menu display
- Blocks entire customer-facing ordering flow

## Notes

- This is a PUBLIC endpoint (no authentication required)
- Should return empty array if venue has no categories
- Should only return active (not deleted) categories and products
- Products should be ordered by `SortOrder`
- ImageUrl should be full Azure Blob URL

## Estimated Time

- 30 minutes to implement
- 15 minutes to test
- **Total: 45 minutes**

---

**Status:** ⏳ Waiting for Prof Kristi to implement and deploy
