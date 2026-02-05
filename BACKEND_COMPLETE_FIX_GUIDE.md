# Complete Backend Fix Guide - Business API CORS Issue

## Problem Summary
The business API endpoints exist in swagger.json but are blocked by CORS errors. The frontend gets:
```
Access to XMLHttpRequest at 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/Dashboard' 
from origin 'https://riviera-os.vercel.app' has been blocked by CORS policy
```

## Root Cause
- ✅ Business endpoints ARE implemented (in swagger.json)
- ❌ CORS is configured for `/api/superadmin/*` but NOT `/api/business/*`
- ❌ JWT token missing `businessId` field

---

# STEP-BY-STEP FIX INSTRUCTIONS

## Step 1: Fix CORS Configuration (CRITICAL)

### In Program.cs or Startup.cs:

**BEFORE (Current - Only works for superadmin):**
```csharp
app.UseCors(builder => builder
    .WithOrigins("https://riviera-os.vercel.app")
    .AllowAnyMethod()
    .AllowAnyHeader());
```

**AFTER (Fixed - Works for all endpoints):**
```csharp
app.UseCors(builder => builder
    .WithOrigins(
        "https://riviera-os.vercel.app", 
        "http://localhost:3000",
        "http://localhost:5173"
    )
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()
    .SetPreflightMaxAge(TimeSpan.FromMinutes(10)));
```

### Alternative: If using named CORS policy:

```csharp
// In ConfigureServices/AddServices
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder
            .WithOrigins(
                "https://riviera-os.vercel.app",
                "http://localhost:3000", 
                "http://localhost:5173"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// In Configure/Program.cs
app.UseCors("AllowFrontend");
```

## Step 2: Add businessId to JWT Token (CRITICAL)

### In AuthController.cs - Login/Pin endpoint:

**BEFORE (Current):**
```csharp
[HttpPost("login/pin")]
public async Task<IActionResult> LoginWithPin([FromBody] PinLoginRequest request)
{
    // ... validation logic ...
    
    var user = await _userService.GetByPhoneAndPin(request.PhoneNumber, request.Pin);
    
    var token = _jwtService.GenerateToken(user);
    
    return Ok(new
    {
        token = token,
        user = new
        {
            id = user.Id,
            fullName = user.FullName,
            role = user.Role,
            phoneNumber = user.PhoneNumber
        }
    });
}
```

**AFTER (Fixed):**
```csharp
[HttpPost("login/pin")]
public async Task<IActionResult> LoginWithPin([FromBody] PinLoginRequest request)
{
    // ... validation logic ...
    
    var user = await _userService.GetByPhoneAndPin(request.PhoneNumber, request.Pin);
    
    var token = _jwtService.GenerateToken(user);
    
    return Ok(new
    {
        token = token,
        user = new
        {
            id = user.Id,
            fullName = user.FullName,
            role = user.Role,
            phoneNumber = user.PhoneNumber,
            businessId = user.BusinessId  // ← ADD THIS LINE
        }
    });
}
```

## Step 3: Update JWT Token Generation (IMPORTANT)

### In JwtService.cs or wherever JWT tokens are generated:

**Add businessId to JWT claims:**
```csharp
public string GenerateToken(User user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.FullName ?? user.Email),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim("phoneNumber", user.PhoneNumber ?? ""),
        new Claim("businessId", user.BusinessId?.ToString() ?? ""), // ← ADD THIS
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _jwtSettings.Issuer,
        audience: _jwtSettings.Audience,
        claims: claims,
        expires: DateTime.Now.AddHours(_jwtSettings.ExpirationHours),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

## Step 4: Ensure Business Endpoints Use BusinessId Context

### In Business Controllers (e.g., BusinessController.cs):

**Example - Business Profile endpoint:**
```csharp
[HttpGet("Profile")]
[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> GetProfile()
{
    // Extract businessId from JWT token
    var businessIdClaim = User.FindFirst("businessId")?.Value;
    if (string.IsNullOrEmpty(businessIdClaim) || !int.TryParse(businessIdClaim, out int businessId))
    {
        return BadRequest("Business context not found");
    }

    var business = await _businessService.GetByIdAsync(businessId);
    if (business == null)
    {
        return NotFound("Business not found");
    }

    return Ok(business);
}
```

**Example - Business Staff endpoint:**
```csharp
[HttpGet("Staff")]
[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> GetStaff()
{
    var businessIdClaim = User.FindFirst("businessId")?.Value;
    if (string.IsNullOrEmpty(businessIdClaim) || !int.TryParse(businessIdClaim, out int businessId))
    {
        return BadRequest("Business context not found");
    }

    var staff = await _staffService.GetByBusinessIdAsync(businessId);
    return Ok(staff);
}

[HttpPost("Staff")]
[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> CreateStaff([FromBody] CreateStaffRequest request)
{
    var businessIdClaim = User.FindFirst("businessId")?.Value;
    if (string.IsNullOrEmpty(businessIdClaim) || !int.TryParse(businessIdClaim, out int businessId))
    {
        return BadRequest("Business context not found");
    }

    // Set businessId for the new staff member
    request.BusinessId = businessId;
    
    var staff = await _staffService.CreateAsync(request);
    return Ok(staff);
}
```

## Step 5: Database Schema Check

### Ensure User table has BusinessId:
```sql
-- Check if BusinessId column exists
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'BusinessId';

-- If missing, add it:
ALTER TABLE Users ADD BusinessId INT NULL;

-- Add foreign key constraint
ALTER TABLE Users 
ADD CONSTRAINT FK_Users_Business 
FOREIGN KEY (BusinessId) REFERENCES Businesses(Id);
```

## Step 6: Test the Fix

### 1. Deploy the changes to Azure Container Apps

### 2. Test CORS with curl:
```bash
curl -H "Origin: https://riviera-os.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: authorization,content-type" \
     -X OPTIONS \
     https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/Profile
```

**Expected response headers:**
```
Access-Control-Allow-Origin: https://riviera-os.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: authorization, content-type
```

### 3. Test login includes businessId:
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+355691234567","pin":"1234"}' \
     https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/auth/login/pin
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 123,
    "fullName": "John Doe",
    "role": "Manager",
    "phoneNumber": "+355691234567",
    "businessId": 456
  }
}
```

### 4. Test business endpoint:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/business/Profile
```

**Should return business data, not CORS error.**

## Step 7: Verify Frontend Works

1. Login with Manager/Owner account
2. Navigate to `/admin` route
3. BusinessAdminDashboard should load without CORS errors
4. All tabs (Overview, Staff, Menu, Venues) should work

---

# COMPLETE CHECKLIST

## Backend Developer Tasks:

### ✅ CORS Configuration
- [ ] Update CORS policy to include `/api/business/*` endpoints
- [ ] Add `https://riviera-os.vercel.app` to allowed origins
- [ ] Enable `AllowCredentials()` and `AllowAnyHeader()`

### ✅ JWT Token Updates  
- [ ] Add `businessId` to login response JSON
- [ ] Add `businessId` claim to JWT token generation
- [ ] Test login returns businessId field

### ✅ Business Endpoints Context
- [ ] Extract `businessId` from JWT claims in business controllers
- [ ] Filter data by businessId (only return user's business data)
- [ ] Validate Manager/Owner role authorization

### ✅ Database Schema
- [ ] Ensure Users table has BusinessId column
- [ ] Ensure foreign key relationship exists
- [ ] Update existing users with proper businessId values

### ✅ Testing
- [ ] Test CORS preflight requests work
- [ ] Test login includes businessId
- [ ] Test business endpoints return data (not CORS errors)
- [ ] Deploy to Azure Container Apps

### ✅ Frontend Verification
- [ ] Login as Manager/Owner
- [ ] Navigate to `/admin`
- [ ] Verify BusinessAdminDashboard loads
- [ ] Verify all tabs work without errors

---

# ESTIMATED TIME: 1-2 HOURS

- CORS fix: 15 minutes
- JWT businessId: 30 minutes  
- Business endpoint context: 30 minutes
- Testing & deployment: 30 minutes

**Total: ~2 hours maximum**

This is a configuration and context issue, not a major implementation. The endpoints already exist!