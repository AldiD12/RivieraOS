# Backend Requirements - Multi-Business PIN System

## Overview
The frontend is 100% complete and ready, including full setup code management in the SuperAdmin dashboard. We need 3 specific backend changes to make the multi-business PIN system work.

## Current API Analysis (Based on swagger.json)
Your current API has excellent structure with 32+ endpoints covering:
- ✅ Business management (`/api/superadmin/Businesses`)
- ✅ User management (`/api/superadmin/businesses/{businessId}/Users`)
- ✅ Authentication (`/api/Auth/login`, `/api/Auth/register`)
- ✅ Venues, Products, Categories, Zones

## Frontend Status - 100% Complete ✅
- ✅ **SuperAdmin Dashboard**: Setup code fields added to create/edit business modals
- ✅ **Business Cards**: Display setup codes with QR code generation buttons
- ✅ **QR Code Generation**: Automatic QR code creation for device setup
- ✅ **Business Setup Flow**: Complete device configuration system
- ✅ **PIN Login System**: Multi-business PIN authentication ready
- ✅ **Staff Management**: PIN creation and management in SuperAdmin

## Required Changes (Only 3 Things)

### 1. Add Setup Code to Business Table
```sql
-- Add setup code column to existing businesses table
ALTER TABLE [businesses_table_name] ADD setup_code NVARCHAR(6) UNIQUE;

-- Set initial codes for existing businesses (SuperAdmin can change these)
UPDATE [businesses_table_name] SET setup_code = 'CORAL1' WHERE [name_column] LIKE '%Coral%';
UPDATE [businesses_table_name] SET setup_code = 'MARINA' WHERE [name_column] LIKE '%Marina%';
UPDATE [businesses_table_name] SET setup_code = 'MOUNT1' WHERE [name_column] LIKE '%Mountain%';
```

**Frontend Integration:**
- ✅ SuperAdmin can create/edit setup codes via dashboard
- ✅ Setup codes display on business cards with QR generation
- ✅ QR codes point to: `https://yourapp.com/setup?code=CORAL1`
- ✅ Validation: 6 characters, uppercase, alphanumeric only

### 2. Create Business Code Validation Endpoint
**New endpoint:** `POST /api/businesses/validate-code`

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
        name = business.RegisteredName, // or BrandName
        setupCode = business.SetupCode
    });
}

public class ValidateCodeRequest
{
    public string BusinessCode { get; set; }
}
```

### 3. Update Login Endpoint for PIN Support
**Modify existing:** `POST /api/Auth/login`

**Current LoginRequest (from swagger.json):**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**New LoginRequest (add optional fields):**
```json
{
  "email": "user@example.com",     // Optional for PIN login
  "password": "password123",       // Can be PIN (4 digits) or regular password
  "pin": "1111",                   // Optional - if provided, use PIN login
  "businessId": 1                  // Optional - required for PIN login
}
```

**Updated LoginRequest Schema:**
```csharp
public class LoginRequest
{
    public string? Email { get; set; }      // Optional for PIN login
    public string? Password { get; set; }   // For regular login OR PIN (4 digits)
    public string? Pin { get; set; }        // Optional - alternative to password
    public int? BusinessId { get; set; }    // Required for PIN login
}
```

**Updated Login Logic:**
```csharp
[HttpPost("api/Auth/login")]
public async Task<ActionResult> Login([FromBody] LoginRequest request)
{
    // PIN-based login
    if (!string.IsNullOrEmpty(request.Pin) && request.BusinessId.HasValue)
    {
        return await HandlePinLogin(request.Pin, request.BusinessId.Value);
    }
    
    // Regular email/password login (existing logic)
    if (!string.IsNullOrEmpty(request.Email) && !string.IsNullOrEmpty(request.Password))
    {
        return await HandleEmailLogin(request.Email, request.Password);
    }
    
    return BadRequest("Invalid login request");
}

private async Task<ActionResult> HandlePinLogin(string pin, int businessId)
{
    // Find users in the specified business
    var users = await _context.Users
        .Where(u => u.BusinessId == businessId && u.IsActive)
        .ToListAsync();
    
    // Check PIN against each user's password hash
    User matchingUser = null;
    foreach (var user in users)
    {
        if (VerifyPassword(pin, user.PasswordHash)) // Use existing password verification
        {
            matchingUser = user;
            break;
        }
    }
    
    if (matchingUser == null)
        return Unauthorized(new { message = "Invalid PIN" });
    
    // Generate JWT token (use existing logic)
    var token = GenerateJwtToken(matchingUser);
    
    return Ok(new {
        token = token,
        user = new {
            id = matchingUser.Id,
            email = matchingUser.Email,
            fullName = matchingUser.FullName,
            role = matchingUser.UserType
        }
    });
}
```

## PIN Storage Strategy
**Use existing password system - no new columns needed!**

- ✅ Store PINs in existing `password_hash` field
- ✅ Use existing PBKDF2 hashing (just hash "1111" instead of "password123")
- ✅ Use existing password verification logic
- ✅ No database schema changes for users table

## User Creation with PINs
**Your existing endpoint:** `POST /api/superadmin/businesses/{businessId}/Users`

**Current CreateUserRequest (from swagger.json):**
```json
{
  "email": "marco@hotel.com",
  "password": "password123",  // ← Send PIN here instead
  "fullName": "Marco Rossi",
  "role": "Staff"
}
```

**For PIN users, frontend will send:**
```json
{
  "email": "marco@hotel.com",
  "password": "1111",         // ← PIN goes in password field
  "fullName": "Marco Rossi", 
  "role": "Staff"
}
```

**Add PIN validation to existing user creation:**
```csharp
[HttpPost("api/superadmin/businesses/{businessId}/Users")]
public async Task<ActionResult> CreateUser(int businessId, [FromBody] CreateUserRequest request)
{
    // Detect if this is a PIN (4 digits) or regular password
    bool isPinLogin = request.Password.Length == 4 && request.Password.All(char.IsDigit);
    
    if (isPinLogin)
    {
        // Validate PIN uniqueness within business
        var existingUsers = await _context.Users
            .Where(u => u.BusinessId == businessId)
            .ToListAsync();
        
        foreach (var existingUser in existingUsers)
        {
            if (VerifyPassword(request.Password, existingUser.PasswordHash))
            {
                return BadRequest(new { message = "This PIN is already in use" });
            }
        }
    }
    
    // Create user (existing logic - PIN gets hashed like a regular password)
    var user = new User
    {
        Email = request.Email,
        PasswordHash = HashPassword(request.Password), // PIN or password - same treatment
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

## SuperAdmin Dashboard - Setup Code Management ✅

The SuperAdmin dashboard now includes complete setup code functionality:

### Business Creation/Editing
- **Setup Code Field**: Required 6-character field in create/edit business modals
- **Validation**: Uppercase only, alphanumeric, max 6 characters
- **Auto-formatting**: Converts input to uppercase automatically

### Business Cards Display
- **Setup Code Display**: Shows current setup code with monospace styling
- **QR Code Button**: "QR" button next to setup code (only if code exists)
- **Status Indicator**: Shows "Not set" if no setup code assigned

### QR Code Generation
- **Automatic Generation**: Creates QR codes pointing to `/setup?code=CORAL1`
- **Printable Format**: Opens in new window with business branding
- **Professional Layout**: Includes business name, QR code, setup code, and URL

### Example SuperAdmin Workflow:
1. **Create Business** → Enter "Hotel Coral Beach" with setup code "CORAL1"
2. **View Business Card** → Shows setup code with QR button
3. **Generate QR Code** → Click QR button → Printable QR code opens
4. **Business Owner** → Prints QR code sticker for device setup
5. **Device Setup** → Staff scans QR → Device configured for Hotel Coral Beach

## Testing Data Setup

### Setup Codes (Managed via SuperAdmin Dashboard)
The SuperAdmin can now create and manage setup codes directly through the dashboard:
- `CORAL1` → Hotel Coral Beach (businessId: 1)
- `MARINA` → Marina Resort (businessId: 2)  
- `MOUNT1` → Mountain Lodge (businessId: 3)

*Note: These codes are created/modified via the SuperAdmin dashboard business management interface*

**Business 1 (Hotel Coral Beach - setup code: CORAL1):**
```json
POST /api/superadmin/businesses/1/Users
{
  "email": "marco@hotelcoral.al",
  "password": "1111",
  "fullName": "Marco Rossi",
  "role": "Staff"
}
```

**Business 2 (Marina Resort - setup code: MARINA):**
```json
POST /api/superadmin/businesses/2/Users  
{
  "email": "john@marina.al",
  "password": "1111",  // Same PIN, different business - should work!
  "fullName": "John Smith", 
  "role": "Staff"
}
```

## Frontend Flow (Already Built)
1. **Device Setup**: User enters `CORAL1` → calls `/api/businesses/validate-code`
2. **Staff Login**: User enters PIN `1111` → calls `/api/Auth/login` with `{pin: "1111", businessId: 1}`
3. **Authentication**: Backend finds Marco in business 1, verifies PIN against password hash
4. **Success**: Staff logged into Hotel Coral Beach dashboard

## Summary
- ✅ **Frontend**: 100% complete with full setup code management in SuperAdmin dashboard
- ✅ **SuperAdmin Features**: Create/edit setup codes, QR generation, business management
- ✅ **Device Setup Flow**: Complete business configuration system ready
- ✅ **PIN System**: Multi-business PIN authentication system implemented
- ❌ **Backend**: Need 3 small changes (setup codes, validation endpoint, PIN login support)
- 🎯 **Goal**: Same PIN can work for different staff at different businesses
- 🔒 **Security**: Only RivieraOS controls business setup codes (not end users)

**The frontend will work immediately after these 3 backend changes are implemented.**