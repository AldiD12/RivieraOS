# Backend Tasks for Prof Kristi - February 18, 2026

**Priority:** URGENT - Blocking frontend development  
**Estimated Total Time:** 1 hour

---

## 🚨 CRITICAL ISSUE #1: Role Name Mismatch (15 minutes)

### Problem
Frontend creates users with "Bartender" and "Collector" roles, but backend checks for old role names "Barman" and "Caderman". This prevents staff from logging in and accessing their dashboards.

### Files to Update

#### 1. AuthController.cs (Line 173)
**Location:** `BlackBear.Services.Core/Controllers/AuthController.cs`

**Current Code:**
```csharp
if (roleName != "Staff" && roleName != "Barman" && roleName != "Manager" && roleName != "Caderman")
{
    return Unauthorized(new { message = "PIN login is only available for staff roles." });
}
```

**Change To:**
```csharp
if (roleName != "Manager" && roleName != "Bartender" && roleName != "Collector")
{
    return Unauthorized(new { message = "PIN login is only available for staff roles." });
}
```

**Why:** Frontend creates "Bartender" and "Collector" roles, not "Barman" and "Caderman"

---

#### 2. OrdersController.cs (Line 12)
**Location:** `BlackBear.Services.Core/Controllers/Business/OrdersController.cs`

**Current Code:**
```csharp
[Authorize(Policy = "Barman")]
public class OrdersController : ControllerBase
```

**Change To:**
```csharp
[Authorize(Policy = "Bartender")]
public class OrdersController : ControllerBase
```

**Why:** Authorization policy needs to match the actual role name in database

---

#### 3. UnitBookingsController.cs (Line 13)
**Location:** `BlackBear.Services.Core/Controllers/Business/UnitBookingsController.cs`

**Current Code:**
```csharp
[Authorize(Policy = "Caderman")]
public class UnitBookingsController : ControllerBase
```

**Change To:**
```csharp
[Authorize(Policy = "Collector")]
public class UnitBookingsController : ControllerBase
```

**Why:** Authorization policy needs to match the actual role name in database

---

#### 4. UnitsController.cs (Line 13)
**Location:** `BlackBear.Services.Core/Controllers/Business/UnitsController.cs`

**Current Code:**
```csharp
[Authorize(Policy = "Caderman")]
public class UnitsController : ControllerBase
```

**Change To:**
```csharp
[Authorize(Policy = "Collector")]
public class UnitsController : ControllerBase
```

**Why:** Authorization policy needs to match the actual role name in database

---

#### 5. Program.cs or Startup.cs (Policy Configuration)
**Location:** `BlackBear.Services.Core/Program.cs` or `Startup.cs`

**Find the policy configuration section (likely looks like this):**
```csharp
services.AddAuthorization(options =>
{
    options.AddPolicy("Barman", policy => policy.RequireRole("Barman"));
    options.AddPolicy("Caderman", policy => policy.RequireRole("Caderman"));
    // ... other policies
});
```

**Change To:**
```csharp
services.AddAuthorization(options =>
{
    options.AddPolicy("Bartender", policy => policy.RequireRole("Bartender"));
    options.AddPolicy("Collector", policy => policy.RequireRole("Collector"));
    // ... other policies
});
```

**Why:** Policy definitions need to match the role names

---

### Testing After Fix
1. Create a Bartender user in SuperAdmin dashboard
2. Try to login with phone + PIN
3. Should successfully login and access BarDisplay
4. Create a Collector user
5. Try to login with phone + PIN
6. Should successfully login and access CollectorDashboard

---

## 📋 TASK #2: Add Public Venues List Endpoint (30 minutes)

### Problem
Frontend needs to build a Discovery page where customers can browse all available venues. Currently there's no public endpoint to list venues.

### What to Add

#### New Controller: PublicVenuesController.cs
**Location:** `BlackBear.Services.Core/Controllers/Public/PublicVenuesController.cs`

**Create new file:**
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;

namespace BlackBear.Services.Core.Controllers.Public
{
    [ApiController]
    [Route("api/public/[controller]")]
    public class VenuesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VenuesController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get list of all active venues (for Discovery page)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PublicVenueListItemDto>>> GetVenues(
            [FromQuery] string? type = null,
            [FromQuery] string? city = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Venues
                .Where(v => v.IsActive && !v.IsDeleted)
                .Include(v => v.Business)
                .AsQueryable();

            // Filter by type (Beach, Pool, Restaurant, Bar)
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(v => v.Type.ToLower() == type.ToLower());
            }

            // Filter by city (extract from address)
            if (!string.IsNullOrEmpty(city))
            {
                query = query.Where(v => v.Address.Contains(city));
            }

            // Pagination
            var totalCount = await query.CountAsync();
            var venues = await query
                .OrderBy(v => v.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(v => new PublicVenueListItemDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Type = v.Type,
                    Description = v.Description,
                    Address = v.Address,
                    ImageUrl = v.ImageUrl,
                    Latitude = v.Latitude,
                    Longitude = v.Longitude,
                    AllowsDigitalOrdering = v.AllowsDigitalOrdering,
                    BusinessName = v.Business.BrandName ?? v.Business.RegisteredName
                })
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(venues);
        }

        /// <summary>
        /// Get single venue details (already exists, just verify it's working)
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PublicVenueDetailDto>> GetVenue(int id)
        {
            var venue = await _context.Venues
                .Include(v => v.Business)
                .Include(v => v.VenueZones)
                .FirstOrDefaultAsync(v => v.Id == id && v.IsActive && !v.IsDeleted);

            if (venue == null)
            {
                return NotFound(new { message = "Venue not found" });
            }

            var dto = new PublicVenueDetailDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Type = venue.Type,
                Description = venue.Description,
                Address = venue.Address,
                ImageUrl = venue.ImageUrl,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                AllowsDigitalOrdering = venue.AllowsDigitalOrdering,
                BusinessName = venue.Business.BrandName ?? venue.Business.RegisteredName,
                ZoneCount = venue.VenueZones.Count(z => z.IsActive && !z.IsDeleted)
            };

            return Ok(dto);
        }
    }
}
```

---

#### New DTOs: PublicVenueDtos.cs
**Location:** `BlackBear.Services.Core/DTOs/Public/PublicVenueDtos.cs`

**Create new file:**
```csharp
namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicVenueListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
        public string BusinessName { get; set; }
    }

    public class PublicVenueDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
        public string BusinessName { get; set; }
        public int ZoneCount { get; set; }
    }
}
```

---

### API Endpoints Created
- `GET /api/public/venues` - List all active venues
  - Query params: `type`, `city`, `page`, `pageSize`
  - Returns: Array of venues with pagination headers
  
- `GET /api/public/venues/{id}` - Get single venue details
  - Returns: Venue details with zone count

### Testing After Implementation
1. Test: `GET /api/public/venues` → Should return all active venues
2. Test: `GET /api/public/venues?type=Beach` → Should return only beach venues
3. Test: `GET /api/public/venues?city=Durrës` → Should return venues in Durrës
4. Test: `GET /api/public/venues/1` → Should return venue details

---

## ✅ OPTIONAL: Verify JWT businessId Claim (15 minutes)

### What to Check
The JWT token should include a `businessId` claim when users have a BusinessId set.

**Location:** `AuthController.cs` around line 210-213

**Current Code (should already be correct):**
```csharp
if (user.BusinessId.HasValue)
{
    claims.Add(new Claim("businessId", user.BusinessId.Value.ToString()));
}
```

### If Manager Gets 403 When Creating Staff
This means the Manager user doesn't have `BusinessId` set in the database.

**Fix in database:**
```sql
-- Find the Manager user
SELECT Id, Email, BusinessId FROM core_users WHERE Email = 'manager@business.com';

-- Update BusinessId if null
UPDATE core_users 
SET BusinessId = 1  -- Replace with actual business ID
WHERE Email = 'manager@business.com' AND BusinessId IS NULL;
```

**Or fix in SuperAdmin dashboard:**
1. Go to SuperAdmin → Staff
2. Edit the Manager user
3. Ensure they're assigned to a business
4. Save

---

## 📦 DEPLOYMENT CHECKLIST

After making all changes:

1. **Build the project**
   ```bash
   dotnet build
   ```

2. **Run migrations (if any new ones)**
   ```bash
   dotnet ef database update
   ```

3. **Test locally**
   - Test Bartender PIN login
   - Test Collector PIN login
   - Test public venues endpoint
   - Test venue filtering

4. **Deploy to Azure Container Apps**
   ```bash
   # Your usual deployment process
   docker build -t blackbear-api .
   docker push <your-registry>/blackbear-api
   # Update container app
   ```

5. **Update Swagger**
   - After deployment, download new swagger.json
   - Send to frontend team to update `frontend/swagger.json`

6. **Notify Frontend Team**
   - "Role mismatch fixed - Bartender/Collector can now login"
   - "Public venues endpoint ready at GET /api/public/venues"

---

## 🎯 SUMMARY

**Total Time:** ~1 hour

**Changes Required:**
1. ✅ Fix role names in 5 files (15 min)
2. ✅ Add public venues endpoint (30 min)
3. ✅ Verify JWT businessId claim (15 min)

**Impact:**
- Unblocks Bartender and Collector login
- Enables Discovery page development
- Completes all critical backend work for Phase 1

**After This:**
- Frontend can complete all customer-facing pages
- No more backend blockers for March launch
- System is production-ready

---

## 📞 QUESTIONS?

If you have any questions about these changes, please ask! The frontend team is ready to integrate as soon as these are deployed.

**Priority Order:**
1. Role mismatch fix (URGENT - staff can't login)
2. Public venues endpoint (HIGH - needed for Discovery page)
3. JWT verification (LOW - probably already working)

