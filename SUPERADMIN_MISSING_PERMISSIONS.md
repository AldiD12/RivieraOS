# SuperAdmin Missing Permissions Issue

**Date:** February 10, 2026  
**Priority:** MEDIUM  
**Status:** Workaround Implemented

---

## Problem

SuperAdmin (platform owner) doesn't have access to all features that Business owners have. This violates the principle that SuperAdmin should have the highest permissions.

**Missing Features:**
1. Units Management
2. Bookings Management
3. Orders Management

---

## Current Architecture

### What SuperAdmin HAS Access To:
```
✅ /api/superadmin/Businesses/*          - Business CRUD
✅ /api/superadmin/businesses/{id}/Users/*  - Staff management
✅ /api/superadmin/businesses/{id}/Venues/* - Venue management
✅ /api/superadmin/venues/{id}/Zones/*      - Zone management
✅ /api/superadmin/businesses/{id}/Categories/* - Category management
✅ /api/superadmin/categories/{id}/Products/*   - Product management
✅ /api/superadmin/Dashboard                - Analytics
```

### What SuperAdmin is MISSING:
```
❌ /api/superadmin/Units/*      - NOT IMPLEMENTED
❌ /api/superadmin/Bookings/*   - NOT IMPLEMENTED
❌ /api/superadmin/Orders/*     - NOT IMPLEMENTED
```

### What Business Owners HAVE:
```
✅ /api/business/venues/{venueId}/Units/*  - Unit management
✅ /api/business/Bookings/*                - Booking management
✅ /api/business/Orders/*                  - Order management
```

---

## Current Workaround (Frontend)

**Status:** ✅ IMPLEMENTED

SuperAdmin now uses Business API endpoints directly since SuperAdmin JWT has higher permissions:

```javascript
// frontend/src/services/superAdminApi.js

// SuperAdmin uses Business endpoints for units
export const unitApi = {
  getByVenue: async (venueId) => {
    const response = await superAdminApi.get(`/business/venues/${venueId}/Units`);
    return response.data;
  },
  // ... other unit methods
};

// SuperAdmin uses Business endpoints for bookings
export const bookingApi = {
  list: async (filters) => {
    const response = await superAdminApi.get('/business/Bookings', { params: filters });
    return response.data;
  },
  // ... other booking methods
};

// SuperAdmin uses Business endpoints for orders
export const orderApi = {
  list: async (filters) => {
    const response = await superAdminApi.get('/business/Orders', { params: filters });
    return response.data;
  },
  // ... other order methods
};
```

**This works because:**
- SuperAdmin JWT token has `role: "SuperAdmin"`
- Backend authorization policies allow SuperAdmin to access Business endpoints
- SuperAdmin can impersonate any business

---

## Proper Solution (Backend - For Prof Kristi)

### Option 1: Create SuperAdmin Controllers (RECOMMENDED)

Create dedicated SuperAdmin controllers with cross-business visibility:

#### 1. SuperAdmin/UnitsController.cs
```csharp
[Route("api/superadmin/[controller]")]
[ApiController]
[Authorize(Policy = "SuperAdmin")]
public class UnitsController : ControllerBase
{
    // GET /api/superadmin/units?businessId=X&venueId=Y
    // Returns units across all businesses (or filtered)
    [HttpGet]
    public async Task<ActionResult<List<UnitDto>>> GetUnits(
        [FromQuery] int? businessId = null,
        [FromQuery] int? venueId = null)
    {
        // SuperAdmin can see ALL units across ALL businesses
        var query = _context.ZoneUnits.AsQueryable();
        
        if (businessId.HasValue)
            query = query.Where(u => u.Venue.BusinessId == businessId);
            
        if (venueId.HasValue)
            query = query.Where(u => u.VenueId == venueId);
            
        return await query.ToListAsync();
    }
    
    // POST /api/superadmin/units
    // Create unit for any business
    
    // PUT /api/superadmin/units/{id}
    // Update any unit
    
    // DELETE /api/superadmin/units/{id}
    // Delete any unit
}
```

#### 2. SuperAdmin/BookingsController.cs
```csharp
[Route("api/superadmin/[controller]")]
[ApiController]
[Authorize(Policy = "SuperAdmin")]
public class BookingsController : ControllerBase
{
    // GET /api/superadmin/bookings?businessId=X&venueId=Y&status=Z
    // Returns bookings across all businesses (or filtered)
    [HttpGet]
    public async Task<ActionResult<List<BookingDto>>> GetBookings(
        [FromQuery] int? businessId = null,
        [FromQuery] int? venueId = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? date = null)
    {
        // SuperAdmin can see ALL bookings across ALL businesses
        var query = _context.ZoneUnitBookings.AsQueryable();
        
        if (businessId.HasValue)
            query = query.Where(b => b.BusinessId == businessId);
            
        if (venueId.HasValue)
            query = query.Where(b => b.VenueId == venueId);
            
        if (!string.IsNullOrEmpty(status))
            query = query.Where(b => b.Status == status);
            
        if (date.HasValue)
            query = query.Where(b => b.StartTime.Date == date.Value.Date);
            
        return await query.ToListAsync();
    }
    
    // POST /api/superadmin/bookings
    // Create booking for any business
    
    // PUT /api/superadmin/bookings/{id}
    // Update any booking
    
    // PUT /api/superadmin/bookings/{id}/checkin
    // Check-in any booking
    
    // PUT /api/superadmin/bookings/{id}/checkout
    // Check-out any booking
    
    // DELETE /api/superadmin/bookings/{id}
    // Delete any booking
}
```

#### 3. SuperAdmin/OrdersController.cs
```csharp
[Route("api/superadmin/[controller]")]
[ApiController]
[Authorize(Policy = "SuperAdmin")]
public class OrdersController : ControllerBase
{
    // GET /api/superadmin/orders?businessId=X&venueId=Y&status=Z
    // Returns orders across all businesses (or filtered)
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetOrders(
        [FromQuery] int? businessId = null,
        [FromQuery] int? venueId = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? date = null)
    {
        // SuperAdmin can see ALL orders across ALL businesses
        var query = _context.Orders.AsQueryable();
        
        if (businessId.HasValue)
            query = query.Where(o => o.BusinessId == businessId);
            
        if (venueId.HasValue)
            query = query.Where(o => o.VenueId == venueId);
            
        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.Status == status);
            
        if (date.HasValue)
            query = query.Where(o => o.CreatedAt.Date == date.Value.Date);
            
        return await query.ToListAsync();
    }
    
    // GET /api/superadmin/orders/{id}
    // Get any order details
    
    // PUT /api/superadmin/orders/{id}/status
    // Update any order status
}
```

---

### Option 2: Extend Business Controllers (SIMPLER)

Modify existing Business controllers to allow SuperAdmin access:

```csharp
// In Business/UnitsController.cs
[Authorize(Policy = "BusinessOrSuperAdmin")] // Instead of just "Business"
public class UnitsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<UnitDto>>> GetUnits([FromQuery] int? venueId = null)
    {
        // If SuperAdmin, allow cross-business queries
        if (User.IsInRole("SuperAdmin"))
        {
            var query = _context.ZoneUnits.AsQueryable();
            if (venueId.HasValue)
                query = query.Where(u => u.VenueId == venueId);
            return await query.ToListAsync();
        }
        
        // If Business, filter by their businessId
        var businessId = _currentUserService.BusinessId;
        // ... existing business logic
    }
}
```

**Apply same pattern to:**
- `Business/BookingsController.cs`
- `Business/OrdersController.cs`

---

## Benefits of Proper Solution

### Option 1 (Dedicated SuperAdmin Controllers):
✅ Clean separation of concerns  
✅ SuperAdmin-specific features (cross-business queries)  
✅ Better security (explicit SuperAdmin-only endpoints)  
✅ Easier to add SuperAdmin-specific analytics  
✅ Follows existing pattern (`/api/superadmin/*`)  

❌ More code to write  
❌ Potential duplication with Business controllers  

### Option 2 (Extend Business Controllers):
✅ Less code to write  
✅ No duplication  
✅ Reuses existing business logic  

❌ Mixed concerns (Business + SuperAdmin in same controller)  
❌ Harder to add SuperAdmin-specific features  
❌ More complex authorization logic  

---

## Recommendation

**Use Option 1** - Create dedicated SuperAdmin controllers

**Reasoning:**
1. Follows existing architecture pattern
2. SuperAdmin needs cross-business visibility (e.g., "show all bookings today across all businesses")
3. Cleaner separation makes future features easier
4. Better security audit trail

---

## Implementation Priority

**Priority:** MEDIUM (workaround is functional)

**Timeline:**
- Current: Workaround allows SuperAdmin to use Business endpoints ✅
- Short-term: Works fine for single-business scenarios
- Long-term: Need proper SuperAdmin controllers for multi-business analytics

**When to implement:**
- Before adding SuperAdmin analytics dashboard
- Before adding cross-business reporting
- Before March 2026 launch (if multiple businesses exist)

---

## Testing Checklist

After implementing proper solution:

### SuperAdmin Units Management
- [ ] SuperAdmin can view units across all businesses
- [ ] SuperAdmin can filter units by business/venue
- [ ] SuperAdmin can create units for any business
- [ ] SuperAdmin can update any unit
- [ ] SuperAdmin can delete any unit
- [ ] SuperAdmin can bulk create units

### SuperAdmin Bookings Management
- [ ] SuperAdmin can view bookings across all businesses
- [ ] SuperAdmin can filter bookings by business/venue/status/date
- [ ] SuperAdmin can create bookings for any business
- [ ] SuperAdmin can check-in any booking
- [ ] SuperAdmin can check-out any booking
- [ ] SuperAdmin can cancel any booking

### SuperAdmin Orders Management
- [ ] SuperAdmin can view orders across all businesses
- [ ] SuperAdmin can filter orders by business/venue/status/date
- [ ] SuperAdmin can view order details
- [ ] SuperAdmin can update order status

---

## Current Status

**Frontend:** ✅ FIXED (using workaround)  
**Backend:** ⚠️ NEEDS IMPLEMENTATION (proper solution)  
**Production:** ✅ FUNCTIONAL (workaround works)  

**Next Steps:**
1. ✅ Frontend uses Business endpoints (DONE)
2. ⏳ Backend creates SuperAdmin controllers (TODO - Prof Kristi)
3. ⏳ Frontend switches to SuperAdmin endpoints (TODO - after backend)

---

**Last Updated:** February 10, 2026  
**Assigned To:** Prof Kristi (Backend)  
**Status:** Workaround Active, Proper Solution Pending
