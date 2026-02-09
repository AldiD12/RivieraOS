# Backend Fix Required: Missing HasPinSet Field

## Issue
The SuperAdmin dashboard shows "✗ Not Set" for PIN status even when a PIN is provided during staff creation.

## Root Cause
The `GET /api/superadmin/businesses/{businessId}/Users` endpoint does not return the `HasPinSet` field.

**Current Response:**
```json
{
  "id": 59,
  "email": "okayanest@gmail.com",
  "fullName": "okay",
  "phoneNumber": "0694269511",
  "role": "Manager",
  "isActive": true,
  "businessId": 10,
  "businessName": "Famed",
  "createdAt": "2026-02-09T19:27:54.3132666"
  // ❌ Missing: "hasPinSet": true
}
```

## Required Changes

### 1. Update DTO: `UserListItemDto`
**File:** `BlackBear.Services.Core/DTOs/SuperAdmin/UserDtos.cs`

Add the `HasPinSet` property:

```csharp
public class UserListItemDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; }
    public bool IsActive { get; set; }
    public bool HasPinSet { get; set; }  // ✅ ADD THIS LINE
    public DateTime CreatedAt { get; set; }
    public int? BusinessId { get; set; }
    public string? BusinessName { get; set; }
}
```

### 2. Update Controller: `UsersController.GetUsers()`
**File:** `BlackBear.Services.Core/Controllers/SuperAdmin/UsersController.cs`

Update the `Select` statement to include `HasPinSet`:

```csharp
// GET: api/superadmin/businesses/5/users
[HttpGet]
public async Task<ActionResult<List<UserListItemDto>>> GetUsers(int businessId)
{
    var businessExists = await _context.Businesses.AnyAsync(b => b.Id == businessId);
    if (!businessExists)
    {
        return NotFound("Business not found");
    }

    var users = await _context.Users
        .IgnoreQueryFilters()
        .Where(u => u.BusinessId == businessId)
        .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
        .Include(u => u.Business)
        .OrderByDescending(u => u.CreatedAt)
        .Select(u => new UserListItemDto
        {
            Id = u.Id,
            Email = u.Email,
            FullName = u.FullName,
            PhoneNumber = u.PhoneNumber,
            Role = u.UserRoles.FirstOrDefault() != null ? u.UserRoles.FirstOrDefault()!.Role!.RoleName : null,
            IsActive = u.IsActive,
            HasPinSet = !string.IsNullOrEmpty(u.Pin),  // ✅ ADD THIS LINE
            CreatedAt = u.CreatedAt,
            BusinessId = u.BusinessId,
            BusinessName = u.Business != null ? u.Business.BrandName ?? u.Business.RegisteredName : null
        })
        .ToListAsync();

    return Ok(users);
}
```

## Expected Result
After the fix, the API should return:

```json
{
  "id": 59,
  "email": "okayanest@gmail.com",
  "fullName": "okay",
  "phoneNumber": "0694269511",
  "role": "Manager",
  "isActive": true,
  "hasPinSet": true,  // ✅ NOW INCLUDED
  "businessId": 10,
  "businessName": "Famed",
  "createdAt": "2026-02-09T19:27:54.3132666"
}
```

## Note
The `UserDetailDto` already has `HasPinSet` - this fix only applies to `UserListItemDto` used in the list endpoint.

## Testing
After deploying the fix:
1. Create a new staff member with a PIN
2. The PIN column should show "✓ Set" (green badge)
3. Create a staff member without a PIN
4. The PIN column should show "✗ Not Set" (amber badge)
