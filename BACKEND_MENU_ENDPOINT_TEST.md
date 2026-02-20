# Backend Menu Endpoint Test Instructions
**Date:** February 20, 2026  
**For:** Prof Kristi

---

## Problem

The public menu endpoint is returning 404. We need to verify if the endpoint exists in the deployed backend.

---

## Test the Endpoint Directly

### Option 1: Using Browser

Open this URL in your browser:
```
https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18
```

**Expected Result:**
- Should return JSON with menu categories and products
- Status: 200 OK

**If 404:**
- The endpoint doesn't exist in deployed backend
- Need to deploy the OrdersController changes

---

### Option 2: Using curl (Terminal)

```bash
curl -X GET "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18" \
  -H "Accept: application/json"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "name": "Cocktails",
    "description": null,
    "iconName": null,
    "businessName": "Hotel Coral Beach",
    "products": [
      {
        "id": 1,
        "name": "Mojito",
        "description": "Classic Cuban cocktail",
        "imageUrl": "https://...",
        "price": 12.00,
        "oldPrice": null,
        "isAlcohol": true,
        "categoryName": "Cocktails"
      }
    ]
  }
]
```

---

### Option 3: Using Postman

1. Open Postman
2. Create new GET request
3. URL: `https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18`
4. Send request
5. Check response

---

## Check Swagger Documentation

Visit the Swagger UI:
```
https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/swagger
```

Look for:
- **Orders** controller under "Public" section
- **GET /api/public/Orders/menu** endpoint
- Try it out with venueId=18

---

## Verify Backend Deployment

### Check if Latest Code is Deployed

The endpoint should be in this file:
```
BlackBear.Services/BlackBear.Services.Core/Controllers/Public/OrdersController.cs
```

**Lines 26-77** should have:
```csharp
[HttpGet("menu")]
public async Task<ActionResult<List<PublicMenuCategoryDto>>> GetMenu([FromQuery] int venueId)
{
    // Verify venue exists
    var venue = await _context.Venues
        .IgnoreQueryFilters()
        .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted);

    if (venue == null)
    {
        return NotFound("Venue not found");
    }

    // Get categories with products for this business, excluding venue-specific exclusions
    var excludedCategoryIds = await _context.CategoryVenueExclusions
        .Where(e => e.VenueId == venueId)
        .Select(e => e.CategoryId)
        .ToListAsync();

    var excludedProductIds = await _context.ProductVenueExclusions
        .Where(e => e.VenueId == venueId)
        .Select(e => e.ProductId)
        .ToListAsync();

    var categories = await _context.Categories
        .IgnoreQueryFilters()
        .Where(c => !c.IsDeleted && c.IsActive && c.BusinessId == venue.BusinessId)
        .Where(c => !excludedCategoryIds.Contains(c.Id))
        .OrderBy(c => c.SortOrder)
        .ThenBy(c => c.Name)
        .Select(c => new PublicMenuCategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            BusinessName = c.Business != null ? (c.Business.BrandName ?? c.Business.RegisteredName) : null,
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
                .ToList()
        })
        .ToListAsync();

    // Filter out empty categories
    categories = categories.Where(c => c.Products.Any()).ToList();

    return Ok(categories);
}
```

---

## Possible Issues

### Issue 1: Endpoint Not Deployed
**Symptom:** 404 error  
**Solution:** Deploy latest backend code to Azure Container Apps

### Issue 2: Route Mismatch
**Symptom:** 404 error  
**Check:** Controller has `[Route("api/public/[controller]")]` attribute  
**Expected:** Expands to `api/public/Orders`

### Issue 3: Venue Doesn't Exist
**Symptom:** 404 with "Venue not found" message  
**Solution:** Check if venueId=18 exists in database

### Issue 4: No Categories/Products
**Symptom:** 200 OK but empty array `[]`  
**Solution:** Add categories and products to the business

---

## Quick Deployment Check

### Check Azure Container App Logs

```bash
# If you have Azure CLI installed
az containerapp logs show \
  --name blackbear-api \
  --resource-group <your-resource-group> \
  --follow
```

Look for:
- Application startup logs
- Any errors during deployment
- Route registration logs

---

## Test Different Venues

Try multiple venue IDs to see if it's venue-specific:

```bash
# Venue 18 (Beach)
curl "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18"

# Venue 19 (Pool)
curl "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=19"

# Venue 5 (Restaurant)
curl "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=5"
```

---

## Expected Behavior

### Successful Response (200 OK)
```json
[
  {
    "id": 1,
    "name": "Cocktails",
    "businessName": "Hotel Coral Beach",
    "products": [...]
  }
]
```

### Venue Not Found (404)
```
Venue not found
```

### No Categories (200 OK)
```json
[]
```

---

## If Endpoint Doesn't Exist

### Steps to Deploy

1. **Verify code is in repository:**
   ```bash
   git log --oneline | grep -i "menu\|orders\|exclusion"
   ```

2. **Check latest commit:**
   ```bash
   git show HEAD:BlackBear.Services/BlackBear.Services.Core/Controllers/Public/OrdersController.cs
   ```

3. **Deploy to Azure:**
   - Push to main branch (if using CI/CD)
   - Or manually deploy via Azure Portal
   - Or use Azure CLI deployment

4. **Verify deployment:**
   - Check Azure Container App revision
   - Check application logs
   - Test endpoint again

---

## Summary

**Quick Test:**
```
https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18
```

**Expected:** JSON array with menu categories  
**If 404:** Backend needs to be deployed with latest OrdersController code  
**If 200 but empty:** No categories/products in database for that venue  

---

Let me know the result and I can help troubleshoot further!
