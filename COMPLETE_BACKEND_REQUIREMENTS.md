# Complete Backend Requirements - Multi-Business PIN System

## Overview
The frontend has been completely updated to support a professional multi-business system. Here's what the backend developer needs to implement to make it work.

## 🎯 What We Built (Frontend)
- **Business Setup System** - Devices get configured for specific businesses
- **Multi-Business PIN Login** - Same PIN can exist at different businesses for different staff
- **QR Code Setup** - Instant device configuration via QR codes
- **Business Branding** - Each device shows correct business name/logo
- **Context-Aware Authentication** - PIN + Business ID = Unique Staff Member

## 🔧 Backend Changes Needed

### 1. Add Setup Code to Businesses Table
```sql
-- Add setup code column
ALTER TABLE core_businesses ADD COLUMN setup_code VARCHAR(6) UNIQUE;

-- Set initial codes for existing businesses
UPDATE core_businesses SET setup_code = 'CORAL1' WHERE name LIKE '%Coral%';
UPDATE core_businesses SET setup_code = 'MARINA' WHERE name LIKE '%Marina%';
UPDATE core_businesses SET setup_code = 'MOUNT1' WHERE name LIKE '%Mountain%';
```

### 2. Create Business Code Validation Endpoint
```csharp
[HttpPost("api/businesses/validate-code")]
public async Task<ActionResult> ValidateBusinessCode([FromBody] ValidateCodeRequest request)
{
    var business = await _context.Businesses
        .FirstOrDefaultAsync(b => b.SetupCode == request.BusinessCode && b.IsActive);
    
    if (business == null)
        return BadRequest(new { message = "Invalid business code" });
    
    return Ok(new {
        id = business.Id,
        name = business.Name,
        location = business.Location,
        setupCode = business.SetupCode
    });
}

public class ValidateCodeRequest
{
    public string BusinessCode { get; set; }
}
```

### 3. Update Login Endpoint for PIN + Business Context
```csharp
[HttpPost("api/auth/login")]
public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
{
    // Handle both PIN login and email/password login
    if (!string.IsNullOrEmpty(request.Pin))
    {
        // PIN-based login with business context
        return await HandlePinLogin(request);
    }
    else
    {
        // Regular email/password login (existing logic)
        return await HandleEmailLogin(request);
    }
}

private async Task<ActionResult<LoginResponse>> HandlePinLogin(LoginRequest request)
{
    // Find users in the specified business
    var users = await _context.Users
        .Where(u => u.BusinessId == request.BusinessId && u.IsActive)
        .ToListAsync();
    
    // Check PIN against each user's password hash
    User matchingUser = null;
    foreach (var user in users)
    {
        if (VerifyPassword(request.Pin, user.PasswordHash))
        {
            matchingUser = user;
            break;
        }
    }
    
    if (matchingUser == null)
        return Unauthorized("Invalid PIN");
    
    // Generate JWT token
    var token = GenerateJwtToken(matchingUser);
    var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"]!);

    return Ok(new LoginResponse
    {
        Token = token,
        Expiration = DateTime.UtcNow.AddMinutes(expireMinutes),
        UserId = matchingUser.Id,
        Email = matchingUser.Email,
        FullName = matchingUser.FullName
    });
}

public class LoginRequest
{
    public string? Email { get; set; }      // For email/password login
    public string? Password { get; set; }   // For email/password login
    public string? Pin { get; set; }        // For PIN login
    public int? BusinessId { get; set; }    // For PIN login context
}
```

### 4. Update User Creation for PIN Validation
```csharp
[HttpPost("api/superadmin/businesses/{businessId}/Users")]
public async Task<ActionResult> CreateUser(int businessId, [FromBody] CreateUserRequest request)
{
    // Validate PIN format (4 digits)
    if (string.IsNullOrEmpty(request.Password) || 
        request.Password.Length != 4 || 
        !request.Password.All(char.IsDigit))
    {
        return BadRequest("PIN must be exactly 4 digits");
    }
    
    // Check PIN uniqueness within business
    var existingUsers = await _context.Users
        .Where(u => u.BusinessId == businessId)
        .ToListAsync();
    
    foreach (var existingUser in existingUsers)
    {
        if (VerifyPassword(request.Password, existingUser.PasswordHash))
        {
            return BadRequest("This PIN is already in use by another staff member");
        }
    }
    
    // Create user with hashed PIN (stored in password_hash field)
    var user = new User
    {
        Email = request.Email,
        PasswordHash = HashPassword(request.Password), // PIN gets hashed here
        FullName = request.FullName,
        PhoneNumber = request.PhoneNumber,
        BusinessId = businessId,
        UserType = request.Role,
        IsActive = true,
        CreatedAt = DateTime.UtcNow
    };
    
    _context.Users.Add(user);
    await _context.SaveChangesAsync();
    
    return Ok(new { message = "User created successfully", userId = user.Id });
}
```

### 5. Update User Update Endpoint
```csharp
[HttpPut("api/superadmin/businesses/{businessId}/Users/{id}")]
public async Task<ActionResult> UpdateUser(int businessId, int id, [FromBody] UpdateUserRequest request)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null || user.BusinessId != businessId)
        return NotFound("User not found");
    
    // If PIN is being updated
    if (!string.IsNullOrEmpty(request.Password))
    {
        // Validate PIN format
        if (request.Password.Length != 4 || !request.Password.All(char.IsDigit))
            return BadRequest("PIN must be exactly 4 digits");
        
        // Check PIN uniqueness (exclude current user)
        var existingUsers = await _context.Users
            .Where(u => u.BusinessId == businessId && u.Id != id)
            .ToListAsync();
        
        foreach (var existingUser in existingUsers)
        {
            if (VerifyPassword(request.Password, existingUser.PasswordHash))
                return BadRequest("This PIN is already in use by another staff member");
        }
        
        // Update with new hashed PIN
        user.PasswordHash = HashPassword(request.Password);
    }
    
    // Update other fields
    user.FullName = request.FullName ?? user.FullName;
    user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
    user.UserType = request.Role ?? user.UserType;
    
    await _context.SaveChangesAsync();
    return Ok(new { message = "User updated successfully" });
}
```

## 🔑 Key Points

### PIN Storage
- **No new PIN column needed** - use existing `password_hash` field
- **PINs are hashed** like regular passwords using PBKDF2
- **4-digit validation** - frontend sends PIN in `password` field

### Business Context
- **PIN + BusinessId = Unique User** - same PIN can exist at different businesses
- **Setup codes** - each business gets a unique 6-character code
- **Device binding** - each device is configured for one business

### API Flow
1. **Device Setup**: `POST /api/businesses/validate-code` with business code
2. **Staff Login**: `POST /api/auth/login` with PIN + businessId
3. **User Creation**: PIN stored as hashed password, validated for uniqueness per business

## 🧪 Testing Data

### Business Setup Codes
- `CORAL1` → Hotel Coral Beach (businessId: 1)
- `MARINA` → Marina Resort (businessId: 2)  
- `MOUNT1` → Mountain Lodge (businessId: 3)

### Test Staff (Create via SuperAdmin)
**Hotel Coral Beach (businessId: 1):**
- Marco: PIN 1111, email: marco@hotelcoral.al
- Sofia: PIN 2222, email: sofia@hotelcoral.al

**Marina Resort (businessId: 2):**
- John: PIN 1111, email: john@marina.al (same PIN, different business!)
- Lisa: PIN 2222, email: lisa@marina.al

## 🎯 Expected Frontend Behavior

### Device Setup Flow
1. User enters business code `CORAL1`
2. Frontend calls `/api/businesses/validate-code`
3. Gets business data, stores in localStorage
4. Shows "Hotel Coral Beach" login screen

### Staff Login Flow
1. Staff enters PIN `1111`
2. Frontend calls `/api/auth/login` with `{pin: "1111", businessId: 1}`
3. Backend finds Marco in Hotel Coral Beach
4. Returns JWT token, staff logged in

### Multi-Business Test
- PIN 1111 at Hotel Coral Beach → Marco
- PIN 1111 at Marina Resort → John
- Same PIN, different people, no conflicts!

## 🚀 Implementation Priority

1. **Add setup_code column** to businesses table
2. **Create business validation endpoint** 
3. **Update login endpoint** to handle PIN + businessId
4. **Update user creation** with PIN validation
5. **Test with frontend** - should work immediately

The frontend is 100% ready and will work as soon as these backend changes are implemented!