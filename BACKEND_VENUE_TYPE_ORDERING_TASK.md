# Backend Task: Venue Type-Based Ordering Logic

**Date:** February 13, 2026  
**For:** Prof Kristi  
**Priority:** Medium  
**Estimated Time:** 1-2 hours

---

## Overview

Add automatic digital ordering behavior based on venue type. Restaurants should default to view-only mode (no QR ordering), while other venues (Beach, Pool, Bar) allow full digital ordering.

---

## Business Requirements

### Current Behavior
- All venues use `IsDigitalOrderingEnabled` flag (nullable boolean)
- NULL or TRUE = ordering enabled
- FALSE = ordering disabled (view-only)
- Must be set manually for each venue

### New Behavior (Hybrid Approach)
- **Automatic:** Venue type determines default ordering behavior
  - `Type = "Restaurant"` → Ordering disabled (view-only menu)
  - `Type = "Beach"/"Pool"/"Bar"/etc.` → Ordering enabled
- **Override:** `IsDigitalOrderingEnabled` can manually override automatic behavior
  - NULL = use automatic behavior based on type
  - TRUE = force enable ordering (even for restaurants)
  - FALSE = force disable ordering (even for beach/pool)

---

## Implementation

### Step 1: Add Computed Property to Entity

**File:** `Entities/Venue.cs`

Add this computed property:

```csharp
using System.ComponentModel.DataAnnotations.Schema;

public class Venue
{
    // ... existing properties ...
    
    [Column("type")]
    [MaxLength(50)]
    public string? Type { get; set; }
    
    [Column("is_digital_ordering_enabled")]
    public bool? IsDigitalOrderingEnabled { get; set; }
    
    // NEW: Computed property for automatic behavior
    [NotMapped]
    public bool AllowsDigitalOrdering
    {
        get
        {
            // If manually set (not null), respect that setting
            if (IsDigitalOrderingEnabled.HasValue)
                return IsDigitalOrderingEnabled.Value;
            
            // Otherwise, auto-determine based on venue type
            // Restaurants default to view-only (no ordering)
            if (!string.IsNullOrEmpty(Type) && 
                Type.Equals("Restaurant", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            
            // All other venue types allow ordering by default
            return true;
        }
    }
}
```

---

### Step 2: Update DTOs

Add `AllowsDigitalOrdering` to all venue DTOs that are returned to frontend.

#### Business Venue DTOs

**File:** `DTOs/Business/VenueDtos.cs`

```csharp
public class BizVenueListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public bool? IsDigitalOrderingEnabled { get; set; }  // Existing
    public bool AllowsDigitalOrdering { get; set; }      // NEW
}

public class BizVenueDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? ImageUrl { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsActive { get; set; }
    public bool OrderingEnabled { get; set; }
    public bool? IsDigitalOrderingEnabled { get; set; }  // Existing
    public bool AllowsDigitalOrdering { get; set; }      // NEW
    public string? GooglePlaceId { get; set; }
}
```

#### SuperAdmin Venue DTOs

**File:** `DTOs/SuperAdmin/VenueDtos.cs`

```csharp
public class VenueListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public int BusinessId { get; set; }
    public string? BusinessName { get; set; }
    public bool? IsDigitalOrderingEnabled { get; set; }  // Existing
    public bool AllowsDigitalOrdering { get; set; }      // NEW
}

public class VenueDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? ImageUrl { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsActive { get; set; }
    public bool OrderingEnabled { get; set; }
    public int BusinessId { get; set; }
    public string? BusinessName { get; set; }
    public bool? IsDigitalOrderingEnabled { get; set; }  // Existing
    public bool AllowsDigitalOrdering { get; set; }      // NEW
    public string? GooglePlaceId { get; set; }
}
```

#### Public Venue DTOs

**File:** `DTOs/Public/VenueDtos.cs`

```csharp
public class PublicVenueDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public string? Description { get; set; }
    public string? Address { get; set; }
    public string? ImageUrl { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsActive { get; set; }
    public bool OrderingEnabled { get; set; }
    public bool AllowsDigitalOrdering { get; set; }  // NEW
    public string? GooglePlaceId { get; set; }
}
```

---

### Step 3: Update Controllers

Map the new property in all venue GET endpoints.

#### Business VenuesController

**File:** `Controllers/Business/VenuesController.cs`

```csharp
[HttpGet]
public async Task<IActionResult> GetVenues()
{
    var businessId = GetBusinessIdFromToken();
    
    var venues = await _context.Venues
        .Where(v => v.BusinessId == businessId && !v.IsDeleted)
        .Select(v => new BizVenueListItemDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Description = v.Description,
            Address = v.Address,
            ImageUrl = v.ImageUrl,
            IsActive = v.IsActive,
            IsDigitalOrderingEnabled = v.IsDigitalOrderingEnabled,
            AllowsDigitalOrdering = v.AllowsDigitalOrdering  // NEW
        })
        .ToListAsync();
    
    return Ok(venues);
}

[HttpGet("{id}")]
public async Task<IActionResult> GetVenue(int id)
{
    var businessId = GetBusinessIdFromToken();
    
    var venue = await _context.Venues
        .Where(v => v.Id == id && v.BusinessId == businessId && !v.IsDeleted)
        .Select(v => new BizVenueDetailDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Description = v.Description,
            Address = v.Address,
            ImageUrl = v.ImageUrl,
            Latitude = v.Latitude,
            Longitude = v.Longitude,
            IsActive = v.IsActive,
            OrderingEnabled = v.OrderingEnabled,
            IsDigitalOrderingEnabled = v.IsDigitalOrderingEnabled,
            AllowsDigitalOrdering = v.AllowsDigitalOrdering,  // NEW
            GooglePlaceId = v.GooglePlaceId
        })
        .FirstOrDefaultAsync();
    
    if (venue == null)
        return NotFound();
    
    return Ok(venue);
}
```

#### SuperAdmin VenuesController

**File:** `Controllers/SuperAdmin/VenuesController.cs`

```csharp
[HttpGet]
public async Task<IActionResult> GetAllVenues()
{
    var venues = await _context.Venues
        .Where(v => !v.IsDeleted)
        .Include(v => v.Business)
        .Select(v => new VenueListItemDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Description = v.Description,
            Address = v.Address,
            ImageUrl = v.ImageUrl,
            IsActive = v.IsActive,
            BusinessId = v.BusinessId,
            BusinessName = v.Business.BrandName ?? v.Business.RegisteredName,
            IsDigitalOrderingEnabled = v.IsDigitalOrderingEnabled,
            AllowsDigitalOrdering = v.AllowsDigitalOrdering  // NEW
        })
        .ToListAsync();
    
    return Ok(venues);
}

[HttpGet("{id}")]
public async Task<IActionResult> GetVenue(int id)
{
    var venue = await _context.Venues
        .Where(v => v.Id == id && !v.IsDeleted)
        .Include(v => v.Business)
        .Select(v => new VenueDetailDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Description = v.Description,
            Address = v.Address,
            ImageUrl = v.ImageUrl,
            Latitude = v.Latitude,
            Longitude = v.Longitude,
            IsActive = v.IsActive,
            OrderingEnabled = v.OrderingEnabled,
            BusinessId = v.BusinessId,
            BusinessName = v.Business.BrandName ?? v.Business.RegisteredName,
            IsDigitalOrderingEnabled = v.IsDigitalOrderingEnabled,
            AllowsDigitalOrdering = v.AllowsDigitalOrdering,  // NEW
            GooglePlaceId = v.GooglePlaceId
        })
        .FirstOrDefaultAsync();
    
    if (venue == null)
        return NotFound();
    
    return Ok(venue);
}

[HttpGet("business/{businessId}")]
public async Task<IActionResult> GetVenuesByBusiness(int businessId)
{
    var venues = await _context.Venues
        .Where(v => v.BusinessId == businessId && !v.IsDeleted)
        .Select(v => new VenueListItemDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Description = v.Description,
            Address = v.Address,
            ImageUrl = v.ImageUrl,
            IsActive = v.IsActive,
            BusinessId = v.BusinessId,
            IsDigitalOrderingEnabled = v.IsDigitalOrderingEnabled,
            AllowsDigitalOrdering = v.AllowsDigitalOrdering  // NEW
        })
        .ToListAsync();
    
    return Ok(venues);
}
```

#### Public VenuesController

**File:** `Controllers/Public/VenuesController.cs`

```csharp
[HttpGet("{id}")]
public async Task<IActionResult> GetVenue(int id)
{
    var venue = await _context.Venues
        .Where(v => v.Id == id && v.IsActive && !v.IsDeleted)
        .Select(v => new PublicVenueDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Description = v.Description,
            Address = v.Address,
            ImageUrl = v.ImageUrl,
            Latitude = v.Latitude,
            Longitude = v.Longitude,
            IsActive = v.IsActive,
            OrderingEnabled = v.OrderingEnabled,
            AllowsDigitalOrdering = v.AllowsDigitalOrdering,  // NEW
            GooglePlaceId = v.GooglePlaceId
        })
        .FirstOrDefaultAsync();
    
    if (venue == null)
        return NotFound();
    
    return Ok(venue);
}

[HttpGet]
public async Task<IActionResult> GetAllVenues()
{
    var venues = await _context.Venues
        .Where(v => v.IsActive && !v.IsDeleted)
        .Select(v => new PublicVenueDto
        {
            Id = v.Id,
            Name = v.Name,
            Type = v.Type,
            Description = v.Description,
            Address = v.Address,
            ImageUrl = v.ImageUrl,
            Latitude = v.Latitude,
            Longitude = v.Longitude,
            IsActive = v.IsActive,
            OrderingEnabled = v.OrderingEnabled,
            AllowsDigitalOrdering = v.AllowsDigitalOrdering,  // NEW
            GooglePlaceId = v.GooglePlaceId
        })
        .ToListAsync();
    
    return Ok(venues);
}
```

---

## Testing

### Test Cases

1. **Restaurant with NULL IsDigitalOrderingEnabled**
   - Expected: `AllowsDigitalOrdering = false`
   - Behavior: View-only menu

2. **Restaurant with IsDigitalOrderingEnabled = true**
   - Expected: `AllowsDigitalOrdering = true`
   - Behavior: Ordering enabled (manual override)

3. **Beach with NULL IsDigitalOrderingEnabled**
   - Expected: `AllowsDigitalOrdering = true`
   - Behavior: Ordering enabled

4. **Beach with IsDigitalOrderingEnabled = false**
   - Expected: `AllowsDigitalOrdering = false`
   - Behavior: View-only (manual override)

5. **Venue with NULL Type**
   - Expected: `AllowsDigitalOrdering = true`
   - Behavior: Ordering enabled (safe default)

### API Testing

```bash
# Test Business endpoint
GET /api/business/venues/1
Response should include:
{
  "id": 1,
  "name": "Main Restaurant",
  "type": "Restaurant",
  "isDigitalOrderingEnabled": null,
  "allowsDigitalOrdering": false  // NEW - automatic behavior
}

# Test Public endpoint (used by MenuPage)
GET /api/venues/1
Response should include:
{
  "id": 1,
  "name": "Main Restaurant",
  "type": "Restaurant",
  "allowsDigitalOrdering": false  // NEW - MenuPage uses this
}
```

---

## Database Impact

**No migration needed!** This is a computed property that uses existing columns:
- `Type` (already exists)
- `IsDigitalOrderingEnabled` (already exists)

---

## Venue Type Standards

Recommended venue types for consistent behavior:

| Type | Allows Ordering | Use Case |
|------|----------------|----------|
| `Restaurant` | No (view-only) | Sit-down dining, waiter service |
| `Beach` | Yes | Beach club, sunbed service |
| `Pool` | Yes | Pool area, sunbed service |
| `Bar` | Yes | Standalone bar, counter service |
| `Rooftop` | Yes | Rooftop bar/lounge |
| `Cafe` | Yes | Coffee shop, quick service |
| `Spa` | No (view-only) | Spa services, appointment-based |
| `Other` | Yes | Default for undefined types |

**Note:** These are defaults. `IsDigitalOrderingEnabled` can override any type.

---

## Frontend Integration

Frontend will use the new `allowsDigitalOrdering` property:

```javascript
// MenuPage.jsx
const venue = await fetch(`/api/venues/${venueId}`);
setIsDigitalOrderingEnabled(venue.allowsDigitalOrdering);  // Uses computed property

// If true: Show "Add to Cart" buttons
// If false: Show "View Only" message
```

---

## Benefits

1. **Automatic Behavior:** Restaurants automatically get view-only mode
2. **Flexibility:** Manual override still available via `IsDigitalOrderingEnabled`
3. **No Breaking Changes:** Existing venues continue to work
4. **Clear Logic:** Type-based defaults are intuitive
5. **Easy Configuration:** Just set venue type, ordering behavior follows

---

## Rollout Plan

1. **Deploy Backend:** Add computed property and update DTOs/controllers
2. **Test API:** Verify `allowsDigitalOrdering` appears in responses
3. **Update Frontend:** Change MenuPage to use new property
4. **Configure Venues:** Set correct types for existing venues
5. **Verify:** Test at restaurant (view-only) and beach (ordering enabled)

---

## Questions?

- **Q:** What if a restaurant wants takeout ordering via QR?
- **A:** Set `IsDigitalOrderingEnabled = true` to override automatic behavior

- **Q:** What happens to existing venues?
- **A:** They continue working. NULL `IsDigitalOrderingEnabled` uses type-based default

- **Q:** Can we add more venue types?
- **A:** Yes! Just add to the `Type` field. Default is ordering enabled unless type is "Restaurant"

---

## Summary

Add `AllowsDigitalOrdering` computed property to automatically disable ordering for restaurants while allowing manual overrides. Simple, flexible, and backwards-compatible.

**Estimated Time:** 1-2 hours  
**Files to Modify:** 4 (Venue.cs, 3 DTO files, 3 controller files)  
**Migration Needed:** No  
**Breaking Changes:** None
