# Backend Fix Request - SuperAdmin JWT Authorization

## Issue Summary
The SuperAdmin endpoints are returning **403 Forbidden** because the JWT token is missing role claims. All endpoints exist and work correctly, but authorization fails.

## Current Status
- ✅ SuperAdmin user exists: `superadmin@rivieraos.com` (ID: 6, Role: SuperAdmin)
- ✅ Authentication works (login successful, JWT token generated)
- ✅ Regular endpoints work: `GET/POST /api/Businesses`
- ❌ SuperAdmin endpoints return 403: `GET/POST/PUT/DELETE /api/superadmin/*`

## Root Cause
The JWT token generated in `AuthController.cs` is missing role claims. The authorization middleware can't verify SuperAdmin permissions.

## Required Fix

### File: `BlackBear.Services.Core/Controllers/AuthController.cs`

**Current JWT generation (line ~85):**
```csharp
var claims = new[]
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
    new Claim(JwtRegisteredClaimNames.Email, user.Email),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Email, user.Email)
    // ❌ MISSING: Role claims
};
```

**Required Fix:**
```csharp
private string GenerateJwtToken(User user)
{
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"]!);

    // ✅ ADD: Load user role from database
    var userRole = _context.UserRoles
        .Include(ur => ur.Role)
        .FirstOrDefault(ur => ur.UserId == user.Id);
    
    var roleName = userRole?.Role?.Name ?? "Guest";

    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Email, user.Email),
        // ✅ ADD: Role claims for authorization
        new Claim(ClaimTypes.Role, roleName),
        new Claim("role", roleName),
        new Claim("userType", roleName)
    };

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expireMinutes),
        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

### Additional Required Changes

**1. Update Login method to include role in response:**
```csharp
[HttpPost("login")]
public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
{
    // ... existing code ...

    // ✅ ADD: Load user role
    var userRole = await _context.UserRoles
        .Include(ur => ur.Role)
        .FirstOrDefaultAsync(ur => ur.UserId == user.Id);
    
    var roleName = userRole?.Role?.Name ?? "Guest";

    // Generate JWT token
    var token = GenerateJwtToken(user);
    var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"]!);

    return Ok(new LoginResponse
    {
        Token = token,
        Expiration = DateTime.UtcNow.AddMinutes(expireMinutes),
        UserId = user.Id,
        Email = user.Email,
        FullName = user.FullName,
        // ✅ ADD: Include role in response
        UserType = roleName
    });
}
```

**2. Update LoginResponse DTO:**
```csharp
// File: DTOs/LoginResponse.cs
public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string UserType { get; set; } = string.Empty; // ✅ ADD this
}
```

## Testing Instructions

After making these changes:

1. **Test SuperAdmin Login:**
   ```bash
   curl -X POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/Auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"superadmin@rivieraos.com","password":"RivieraOS2024!"}'
   ```

2. **Verify JWT Token Contains Role Claims:**
   - Decode the JWT token at https://jwt.io
   - Should contain: `"role": "SuperAdmin"`

3. **Test SuperAdmin Endpoint:**
   ```bash
   curl -X GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/Businesses \
   -H "Authorization: Bearer {JWT_TOKEN}"
   ```
   - Should return 200 OK instead of 403 Forbidden

## Expected Result

After this fix:
- ✅ All 30+ SuperAdmin endpoints will work immediately
- ✅ Frontend requires no changes (already implemented)
- ✅ Role-based authorization will work correctly
- ✅ SuperAdmin dashboard will be fully functional

## Database Verification

Confirm SuperAdmin user has correct role:
```sql
SELECT u.Id, u.Email, r.Name as RoleName 
FROM core_users u
JOIN core_user_roles ur ON u.Id = ur.UserId  
JOIN core_roles r ON ur.RoleId = r.Id
WHERE u.Email = 'superadmin@rivieraos.com';
```

Expected result: `Id: 6, Email: superadmin@rivieraos.com, RoleName: SuperAdmin`

## Priority: HIGH
This is blocking all SuperAdmin functionality. The frontend is complete and ready - only this backend fix is needed.