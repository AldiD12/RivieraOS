# Backend Fix Required: Staff Management Authorization

## 🚨 Issue Summary
- ✅ Manager role works perfectly for Categories, Products, Venues (can create/edit/delete)
- ❌ Manager role fails on Staff endpoints (403 Forbidden on POST /business/Staff)
- ✅ JWT token is correct with role: "Manager" and businessId: 4

## 🎯 Root Cause
Staff endpoints are missing Manager role in authorization attributes.

## 🔧 Required Changes

### 1. Check Staff Controller Authorization
Look for the Staff controller (likely `BusinessStaffController.cs` or similar) and find these methods:

```csharp
// CURRENT (WRONG) - Only Owner can create staff
[Authorize(Roles = "Owner")]
public async Task<IActionResult> CreateStaff([FromBody] BizCreateStaffRequest request)

[Authorize(Roles = "Owner")]  
public async Task<IActionResult> UpdateStaff(int staffId, [FromBody] BizUpdateStaffRequest request)

[Authorize(Roles = "Owner")]
public async Task<IActionResult> DeleteStaff(int staffId)
```

### 2. Add Manager Role to Staff Endpoints

**CHANGE TO:**
```csharp
// FIXED - Both Manager and Owner can manage staff
[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> CreateStaff([FromBody] BizCreateStaffRequest request)

[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> UpdateStaff(int staffId, [FromBody] BizUpdateStaffRequest request)

[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> DeleteStaff(int staffId)

[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> ActivateStaff(int staffId)

[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> ResetPassword(int staffId, [FromBody] ResetPasswordRequest request)

[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> SetPin(int staffId, [FromBody] SetPinRequest request)
```

### 3. Verify Business Ownership Check
Make sure the business ownership validation is working:

```csharp
public async Task<IActionResult> CreateStaff([FromBody] BizCreateStaffRequest request)
{
    // Get businessId from JWT token
    var businessIdClaim = User.FindFirst("businessId")?.Value;
    if (string.IsNullOrEmpty(businessIdClaim) || !int.TryParse(businessIdClaim, out int businessId))
    {
        return Unauthorized("Business ID not found in token");
    }
    
    // Verify user belongs to this business
    var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
    if (userRole == "Manager")
    {
        // Additional check: Manager can only manage their own business staff
        var userBusinessId = await GetUserBusinessId(User.Identity.Name);
        if (userBusinessId != businessId)
        {
            return Forbid("Manager can only manage staff in their own business");
        }
    }
    
    // Create staff logic here...
}
```

## 🧪 Test After Changes

1. **Redeploy backend** with the authorization changes
2. **Test in frontend**: Try creating a staff member as Manager
3. **Expected result**: Should return 200 OK instead of 403 Forbidden

## 📋 Specific Endpoints to Fix

Based on swagger.json, these endpoints need Manager role added:

- `POST /api/business/Staff` - Create staff
- `PUT /api/business/Staff/{staffId}` - Update staff  
- `DELETE /api/business/Staff/{staffId}` - Delete staff
- `POST /api/business/Staff/{staffId}/activate` - Activate staff
- `POST /api/business/Staff/{staffId}/reset-password` - Reset password
- `POST /api/business/Staff/{staffId}/set-pin` - Set PIN
- `DELETE /api/business/Staff/{staffId}/pin` - Delete PIN

## ✅ What's Already Working (Don't Change)

These endpoints already work correctly with Manager role:
- `GET /api/business/Staff` ✅
- `GET /api/business/Categories` ✅  
- `POST /api/business/Categories` ✅
- `POST /api/business/categories/{categoryId}/Products` ✅
- `GET /api/business/Dashboard` ✅
- `GET /api/business/Venues` ✅

## 🎯 Summary for Backend Developer

**The fix is simple**: Add `"Manager"` to the `[Authorize(Roles = "...")]` attributes on all Staff management endpoints. The JWT token and authentication are working perfectly - it's just a missing role in the authorization configuration.