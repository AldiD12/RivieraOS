# Collector Venue Assignment - Backend Task

**Date:** February 13, 2026  
**Priority:** HIGH - Blocking CollectorDashboard  
**Status:** Backend implementation needed

---

## Problem

CollectorDashboard is complete on frontend but **cannot load** because:

1. **Collector role gets 403 Forbidden** when trying to access `GET /api/business/Venues`
2. **Login response doesn't include venue assignment** for Collector staff
3. **No way for Collector to know which venue they work at**

### Error Logs
```
GET /api/business/Venues - 403 Forbidden
Error: Collector role does not have permission to access this endpoint
```

---

## Current Situation

### What Works
- ✅ Collector can login with phone + PIN
- ✅ JWT token is generated correctly
- ✅ Role is set to "Collector"
- ✅ CollectorDashboard UI is complete

### What's Broken
- ❌ Collector doesn't know which venue they're assigned to
- ❌ Can't call `/api/business/Venues` (403 Forbidden - requires Manager role)
- ❌ Login response doesn't include `venueId` or `venueName`
- ❌ No endpoint to get "my assigned venue"

---

## What Collectors Need

Collectors need to know:
- **Which venue they're assigned to** (venueId, venueName)
- Which zones in that venue
- Which units in those zones
- Active bookings for those units

Collectors should NOT be able to:
- Create/edit/delete venues
- See all business venues
- Manage venue settings

---

## Required Backend Changes

### Option 1: Add Venue Info to Login Response (RECOMMENDED)

**File:** `BlackBear.Services.Core/Controllers/AuthController.cs`

**Current PIN Login Response:**
```csharp
return Ok(new
{
    token = token,
    userId = staff.Id,
    fullName = staff.FullName,
    role = staff.Role,
    businessId = staff.BusinessId
});
```

**Updated PIN Login Response:**
```csharp
return Ok(new
{
    token = token,
    userId = staff.Id,
    fullName = staff.FullName,
    role = staff.Role,
    businessId = staff.BusinessId,
    venueId = staff.VenueId,        // ADD THIS
    venueName = staff.Venue?.Name   // ADD THIS
});
```

**Required Changes:**
1. Ensure `Staff` entity has `VenueId` foreign key
2. Include `.Include(s => s.Venue)` in the query when fetching staff for PIN login
3. Add `venueId` and `venueName` to response object

---

### Option 2: Create "Get My Profile" Endpoint (ALTERNATIVE)

**File:** `BlackBear.Services.Core/Controllers/Business/StaffController.cs`

**New Endpoint:**
```csharp
/// <summary>
/// Get current logged-in staff member's profile
/// </summary>
[HttpGet("me")]
[Authorize(Roles = "Manager,Bartender,Collector")]
public async Task<IActionResult> GetMyProfile()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
    {
        return Unauthorized();
    }

    var staff = await _context.Staff
        .Include(s => s.Venue)
        .Include(s => s.Business)
        .FirstOrDefaultAsync(s => s.Id == int.Parse(userId));

    if (staff == null)
    {
        return NotFound("Staff member not found");
    }

    return Ok(new
    {
        id = staff.Id,
        fullName = staff.FullName,
        email = staff.Email,
        phoneNumber = staff.PhoneNumber,
        role = staff.Role,
        businessId = staff.BusinessId,
        businessName = staff.Business?.Name,
        venueId = staff.VenueId,
        venueName = staff.Venue?.Name,
        isActive = staff.IsActive
    });
}
```

**Endpoint:** `GET /api/business/Staff/me`  
**Authorization:** Manager, Bartender, Collector  
**Returns:** Current user's profile with venue assignment

---

## Database Requirements

### Staff Table Must Have:
```sql
-- Ensure Staff table has VenueId column
ALTER TABLE Staff
ADD VenueId INT NULL,
CONSTRAINT FK_Staff_Venue FOREIGN KEY (VenueId) REFERENCES Venues(Id);
```

### When Creating Staff:
- Manager/BusinessOwner should be able to assign staff to specific venues
- Staff creation form should include venue selection
- Each Collector/Bartender should be assigned to ONE venue

---

## Frontend Integration (Already Ready)

Once backend is fixed, frontend will automatically work:

**LoginPage.jsx** will store venue info:
```javascript
localStorage.setItem('venueId', data.venueId);
localStorage.setItem('venueName', data.venueName);
```

**CollectorDashboard.jsx** will use it:
```javascript
const venueId = localStorage.getItem('venueId');
const venueName = localStorage.getItem('venueName');
// Use this instead of calling /api/business/Venues
```

---

## Testing Steps

### 1. Create Test Collector
```sql
-- Assign existing Collector to a venue
UPDATE Staff
SET VenueId = 1  -- Replace with actual venue ID
WHERE Role = 'Collector' AND Id = [collector_id];
```

### 2. Test Login
```bash
POST /api/Auth/pin-login
{
  "phoneNumber": "+39123456789",
  "pin": "1234"
}

# Expected Response:
{
  "token": "eyJhbGc...",
  "userId": 123,
  "fullName": "John Collector",
  "role": "Collector",
  "businessId": 1,
  "venueId": 1,           # NEW
  "venueName": "Beach Club"  # NEW
}
```

### 3. Test Profile Endpoint (if using Option 2)
```bash
GET /api/business/Staff/me
Authorization: Bearer [collector_token]

# Expected Response:
{
  "id": 123,
  "fullName": "John Collector",
  "role": "Collector",
  "venueId": 1,
  "venueName": "Beach Club"
}
```

---

## Impact

**Blocks:**
- CollectorDashboard (cannot load without venue info)
- Collector workflow (check-in, check-out, bookings)
- Production deployment for beach/pool operations

**Affects:**
- Bartender role (same issue - needs venue assignment)
- Any staff role that works at specific venues

---

## Recommendation

**Use Option 1 (Add to Login Response)** because:
- ✅ Simpler - one change in AuthController
- ✅ Faster - no extra API call needed
- ✅ Consistent - venue info available immediately after login
- ✅ Less code - frontend doesn't need to call separate endpoint

**Option 2 is useful for:**
- Getting updated profile info without re-login
- Future features (profile editing, venue reassignment)
- Can be added later as enhancement

---

## Summary

**What needs to be done:**
1. Ensure `Staff` table has `VenueId` column
2. Update `AuthController` PIN login to include venue info in response
3. Assign existing Collectors/Bartenders to venues in database
4. Test login with Collector role

**Estimated time:** 30-60 minutes

**Once complete:** CollectorDashboard will work immediately, no frontend changes needed.

---

## Questions?

Contact: Aldi (Frontend Developer)  
Status: Frontend ready and waiting for backend fix
