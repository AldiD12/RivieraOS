# Backend Events Permissions Fix - URGENT

**Date:** March 4, 2026  
**Priority:** HIGH  
**Status:** BLOCKING Business Admin Events Feature

---

## Problem

Business Admin Dashboard Events tab returns **403 Forbidden** when Manager tries to create/manage events.

**Error:**
```
POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/Events
Status: 403 Forbidden
```

**JWT Token Analysis:**
```json
{
  "sub": "47",
  "email": "06850309111@staff.local",
  "businessId": "9",
  "role": "Manager",
  "exp": 1772737754
}
```

User IS authenticated as Manager with businessId 9, but backend rejects the request.

---

## Root Cause

The `/api/business/Events` endpoints are missing proper authorization attributes or are configured to only allow SuperAdmin role.

**Expected behavior:** Manager and Owner roles should be able to manage events for their own business.

---

## Required Backend Fix

### File: `EventsController.cs` (or similar)

**Current (likely):**
```csharp
[ApiController]
[Route("api/business/[controller]")]
[Authorize] // Too restrictive or missing role specification
public class EventsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEvents() { ... }
    
    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request) { ... }
    
    // ... other endpoints
}
```

**Required fix:**
```csharp
[ApiController]
[Route("api/business/[controller]")]
[Authorize(Roles = "Manager,Owner")] // ✅ Allow business admins
public class EventsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetEvents()
    {
        // Get businessId from JWT token
        var businessId = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessId))
            return Unauthorized("Missing businessId in token");
        
        // Return only events for this business
        var events = await _eventService.GetEventsByBusinessId(int.Parse(businessId));
        return Ok(events);
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request)
    {
        // Get businessId from JWT token
        var businessId = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessId))
            return Unauthorized("Missing businessId in token");
        
        // Ensure event is created for the authenticated business
        request.BusinessId = int.Parse(businessId);
        
        var result = await _eventService.CreateEvent(request);
        return Ok(result);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEvent(int id, [FromBody] UpdateEventRequest request)
    {
        // Get businessId from JWT token
        var businessId = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessId))
            return Unauthorized("Missing businessId in token");
        
        // Verify event belongs to this business
        var existingEvent = await _eventService.GetEventById(id);
        if (existingEvent == null)
            return NotFound();
        
        if (existingEvent.BusinessId != int.Parse(businessId))
            return Forbid("Cannot modify events from other businesses");
        
        var result = await _eventService.UpdateEvent(id, request);
        return Ok(result);
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        // Get businessId from JWT token
        var businessId = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessId))
            return Unauthorized("Missing businessId in token");
        
        // Verify event belongs to this business
        var existingEvent = await _eventService.GetEventById(id);
        if (existingEvent == null)
            return NotFound();
        
        if (existingEvent.BusinessId != int.Parse(businessId))
            return Forbid("Cannot delete events from other businesses");
        
        await _eventService.DeleteEvent(id);
        return NoContent();
    }
    
    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishEvent(int id)
    {
        var businessId = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessId))
            return Unauthorized("Missing businessId in token");
        
        var existingEvent = await _eventService.GetEventById(id);
        if (existingEvent == null)
            return NotFound();
        
        if (existingEvent.BusinessId != int.Parse(businessId))
            return Forbid("Cannot publish events from other businesses");
        
        await _eventService.PublishEvent(id);
        return NoContent();
    }
    
    [HttpPost("{id}/unpublish")]
    public async Task<IActionResult> UnpublishEvent(int id)
    {
        var businessId = User.FindFirst("businessId")?.Value;
        if (string.IsNullOrEmpty(businessId))
            return Unauthorized("Missing businessId in token");
        
        var existingEvent = await _eventService.GetEventById(id);
        if (existingEvent == null)
            return NotFound();
        
        if (existingEvent.BusinessId != int.Parse(businessId))
            return Forbid("Cannot unpublish events from other businesses");
        
        await _eventService.UnpublishEvent(id);
        return NoContent();
    }
}
```

---

## Key Security Requirements

1. **Role Authorization:** `[Authorize(Roles = "Manager,Owner")]` on controller or individual endpoints
2. **Business Isolation:** Always filter by `businessId` from JWT token
3. **Ownership Verification:** For UPDATE/DELETE/PUBLISH operations, verify event belongs to the authenticated business
4. **No Cross-Business Access:** Manager from Business A cannot see/modify events from Business B

---

## Endpoints That Need Fixing

All endpoints under `/api/business/Events`:

- ✅ `GET /api/business/Events` - List events (filter by businessId)
- ✅ `GET /api/business/Events/{id}` - Get event details (verify ownership)
- ✅ `POST /api/business/Events` - Create event (set businessId from token)
- ✅ `PUT /api/business/Events/{id}` - Update event (verify ownership)
- ✅ `DELETE /api/business/Events/{id}` - Delete event (verify ownership)
- ✅ `POST /api/business/Events/{id}/publish` - Publish event (verify ownership)
- ✅ `POST /api/business/Events/{id}/unpublish` - Unpublish event (verify ownership)

---

## Testing After Fix

1. Login as Manager (businessId: 9)
2. Go to Business Admin Dashboard → Events tab
3. Click "Create Event"
4. Fill form and submit
5. Should return 200/201, not 403

**Expected response:**
```json
{
  "id": 123,
  "title": "Summer Beach Party",
  "businessId": 9,
  "isPublished": false,
  ...
}
```

---

## Reference: Working Examples

These endpoints already work correctly with Manager role:
- `/api/business/Staff` - Staff management
- `/api/business/Venues` - Venue management
- `/api/business/Categories` - Category management
- `/api/business/Products` - Product management

**Copy the authorization pattern from these controllers!**

---

## Frontend Status

✅ Frontend is ready and deployed  
✅ API calls are correct  
✅ JWT token is valid  
❌ Backend rejects with 403 (this fix needed)

Once backend is fixed and deployed, Events feature will work immediately.

---

## Deployment Checklist

After making changes:
1. Build backend
2. Deploy to Azure Container Apps
3. Verify with Postman/Swagger
4. Test in production at https://riviera-os.vercel.app

---

## Priority

**HIGH** - This is blocking the Business Admin Events feature which is part of the Discovery Page night mode implementation.
