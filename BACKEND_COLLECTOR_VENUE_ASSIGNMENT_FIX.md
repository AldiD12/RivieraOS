# Backend Task: Add Venue Assignment to Login Response

**Date:** February 18, 2026  
**Priority:** HIGH  
**Issue:** Collectors cannot access dashboard - "No venue assigned" error  
**Root Cause:** Login API doesn't return `venueId` and `venueName`

---

## Problem Summary

When collectors log in with phone + PIN, the frontend expects the login response to include:
- `venueId` - The ID of the venue they're assigned to
- `venueName` - The name of that venue

Currently, the backend login API returns:
```json
{
  "token": "eyJ...",
  "userId": 123,
  "fullName": "John Collector",
  "phoneNumber": "+1234567890",
  "role": "Collector",
  "businessId": 5
  // ❌ Missing: venueId, venueName
}
```

The `VenueId` column exists in the Users table and is populated when admins assign collectors to venues. The login endpoint just doesn't query or return it.

---

## Required Backend Changes

### 1. Update LoginResponse DTO

**File:** `BlackBear.Services.Core/DTOs/LoginResponse.cs` (or similar)

Add two new properties:

```csharp
public class LoginResponse
{
    public string Token { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; }
    public string PhoneNumber { get; set; }
    public string Role { get; set; }
    public int BusinessId { get; set; }
    
    // ✅ ADD THESE TWO PROPERTIES
    public int? VenueId { get; set; }      // Nullable because not all users have venue assignment
    public string VenueName { get; set; }   // Nullable
}
```

### 2. Update AuthController Login Methods

**File:** `BlackBear.Services.API/Controllers/AuthController.cs`

Both login endpoints need to be updated:
- `POST /api/Auth/login` (email/password login)
- `POST /api/Auth/login/pin` (phone/PIN login)

**Current code (approximate):**
```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userService.AuthenticateAsync(request.Email, request.Password);
    
    if (user == null)
        return Unauthorized("Invalid credentials");
    
    var token = _tokenService.GenerateToken(user);
    
    return Ok(new LoginResponse {
        Token = token,
        UserId = user.Id,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role,
        BusinessId = user.BusinessId
        // ❌ Missing venue info
    });
}

[HttpPost("login/pin")]
public async Task<IActionResult> LoginWithPin([FromBody] PinLoginRequest request)
{
    var user = await _userService.AuthenticateWithPinAsync(request.PhoneNumber, request.Pin);
    
    if (user == null)
        return Unauthorized("Invalid credentials");
    
    var token = _tokenService.GenerateToken(user);
    
    return Ok(new LoginResponse {
        Token = token,
        UserId = user.Id,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role,
        BusinessId = user.BusinessId
        // ❌ Missing venue info
    });
}
```

**Updated code:**
```csharp
[HttpPost("login")]
public async Task<IActionResult> Login([FromBody] LoginRequest request)
{
    var user = await _userService.AuthenticateAsync(request.Email, request.Password);
    
    if (user == null)
        return Unauthorized("Invalid credentials");
    
    var token = _tokenService.GenerateToken(user);
    
    // ✅ Get venue details if user has venue assignment
    string venueName = null;
    if (user.VenueId.HasValue)
    {
        var venue = await _venueService.GetByIdAsync(user.VenueId.Value);
        venueName = venue?.Name;
    }
    
    return Ok(new LoginResponse {
        Token = token,
        UserId = user.Id,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role,
        BusinessId = user.BusinessId,
        VenueId = user.VenueId,        // ✅ Added
        VenueName = venueName           // ✅ Added
    });
}

[HttpPost("login/pin")]
public async Task<IActionResult> LoginWithPin([FromBody] PinLoginRequest request)
{
    var user = await _userService.AuthenticateWithPinAsync(request.PhoneNumber, request.Pin);
    
    if (user == null)
        return Unauthorized("Invalid credentials");
    
    var token = _tokenService.GenerateToken(user);
    
    // ✅ Get venue details if user has venue assignment
    string venueName = null;
    if (user.VenueId.HasValue)
    {
        var venue = await _venueService.GetByIdAsync(user.VenueId.Value);
        venueName = venue?.Name;
    }
    
    return Ok(new LoginResponse {
        Token = token,
        UserId = user.Id,
        FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
        Role = user.Role,
        BusinessId = user.BusinessId,
        VenueId = user.VenueId,        // ✅ Added
        VenueName = venueName           // ✅ Added
    });
}
```

### 3. Ensure User Entity Includes VenueId

**File:** `BlackBear.Services.Core/Entities/User.cs` (or similar)

Make sure the User entity has the VenueId property:

```csharp
public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string FullName { get; set; }
    public string PhoneNumber { get; set; }
    public string Pin { get; set; }
    public string Role { get; set; }
    public int BusinessId { get; set; }
    public int? VenueId { get; set; }  // ✅ Should already exist
    public bool IsActive { get; set; }
    
    // Navigation properties
    public Business Business { get; set; }
    public Venue Venue { get; set; }
}
```

### 4. Update UserService (if needed)

**File:** `BlackBear.Services.Core/Services/UserService.cs`

Ensure the authentication methods include VenueId in the returned user object:

```csharp
public async Task<User> AuthenticateAsync(string email, string password)
{
    var user = await _context.Users
        .Include(u => u.Business)
        .Include(u => u.Venue)  // ✅ Include venue if not already
        .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
    
    if (user == null || !VerifyPassword(password, user.PasswordHash))
        return null;
    
    return user;
}

public async Task<User> AuthenticateWithPinAsync(string phoneNumber, string pin)
{
    var user = await _context.Users
        .Include(u => u.Business)
        .Include(u => u.Venue)  // ✅ Include venue if not already
        .FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber && u.Pin == pin && u.IsActive);
    
    return user;
}
```

---

## Testing

### Before Deployment

1. **Database Check:**
```sql
-- Verify collector has venue assigned
SELECT Id, FullName, PhoneNumber, Role, BusinessId, VenueId, IsActive
FROM Users
WHERE Role = 'Collector' AND PhoneNumber = '+355691234567';

-- Expected: VenueId should NOT be NULL
```

2. **API Test (Postman/curl):**
```bash
curl -X POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/Auth/login/pin \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+355691234567",
    "pin": "1234"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJ...",
  "userId": 123,
  "fullName": "John Collector",
  "phoneNumber": "+355691234567",
  "role": "Collector",
  "businessId": 5,
  "venueId": 5,                    // ✅ Should be present
  "venueName": "Hotel Coral Beach"  // ✅ Should be present
}
```

### After Deployment

1. Login as collector on https://riviera-os.vercel.app/login
2. Check browser console - should see:
   ```
   🏖️ Venue ID stored: 5
   🏖️ Venue Name stored: Hotel Coral Beach
   ✅ Collector assigned to venue: 5 Hotel Coral Beach
   ```
3. CollectorDashboard should load successfully
4. Venue selector should show "Hotel Coral Beach"

---

## Impact

- **Who is affected:** Collectors only (Bartenders and Managers don't need venue assignment)
- **Current status:** Collectors CANNOT use the dashboard at all
- **After fix:** Collectors can access dashboard and manage their assigned venue

---

## Estimated Time

- **Development:** 15-30 minutes
- **Testing:** 10 minutes
- **Deployment:** 5 minutes

**Total:** ~1 hour

---

## Notes

- Frontend is already implemented correctly - no frontend changes needed
- This is a simple addition to existing login endpoints
- VenueId column already exists in database
- Venue assignment UI already works in admin dashboards
- Only the login response is missing these fields

---

## Checklist

- [ ] Update `LoginResponse` DTO with `VenueId` and `VenueName` properties
- [ ] Update `AuthController.Login` method to include venue info
- [ ] Update `AuthController.LoginWithPin` method to include venue info
- [ ] Verify `UserService` includes venue in query
- [ ] Test with Postman/curl before deployment
- [ ] Deploy to Azure
- [ ] Test on production with real collector account
- [ ] Verify CollectorDashboard loads successfully

---

## Related Files

**Backend (need changes):**
- `BlackBear.Services.Core/DTOs/LoginResponse.cs`
- `BlackBear.Services.API/Controllers/AuthController.cs`
- `BlackBear.Services.Core/Services/UserService.cs` (verify only)

**Frontend (no changes needed):**
- `frontend/src/pages/LoginPage.jsx` - Already expects venueId/venueName
- `frontend/src/pages/CollectorDashboard.jsx` - Already checks for venueId
- `frontend/src/components/dashboard/modals/StaffModals.jsx` - Already has venue dropdown

**Documentation:**
- `COLLECTOR_NO_VENUE_ASSIGNED_ANALYSIS.md` - Complete analysis
