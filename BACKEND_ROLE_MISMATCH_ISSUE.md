# Backend Role Mismatch Issue - CRITICAL

## Problem Summary
The backend has **inconsistent role naming** across different controllers, causing authentication and authorization failures.

## The Mismatch

### StaffController (User Creation)
**File:** `Controllers/Business/StaffController.cs`
**Lines:** 112, 190
**Allowed Roles:** `"Manager"`, `"Bartender"`, `"Collector"`

```csharp
var allowedRoles = new[] { "Manager", "Bartender", "Collector" };
if (!allowedRoles.Contains(request.Role))
{
    return BadRequest("Can only create Manager, Bartender, or Collector users");
}
```

### AuthController (PIN Login)
**File:** `Controllers/AuthController.cs`
**Line:** 173
**Allowed Roles:** `"Staff"`, `"Barman"`, `"Manager"`, `"Caderman"`

```csharp
if (roleName != "Staff" && roleName != "Barman" && roleName != "Manager" && roleName != "Caderman")
{
    return Unauthorized("PIN login is only available for staff members.");
}
```

### Authorization Policies
**File:** `Program.cs`
**Lines:** 93-97

```csharp
options.AddPolicy("Barman", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Barman"));
options.AddPolicy("Caderman", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Caderman"));
options.AddPolicy("Bartender", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Bartender"));
options.AddPolicy("Collector", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Collector"));
```

### Controllers Using Policies
**OrdersController.cs** (Line 12):
```csharp
[Authorize(Policy = "Barman")]
```

**UnitBookingsController.cs** (Line 13):
```csharp
[Authorize(Policy = "Caderman")]
```

**UnitsController.cs** (Line 13):
```csharp
[Authorize(Policy = "Caderman")]
```

## The Flow of Failure

1. **Admin creates staff** via StaffController
   - Frontend sends: `{ role: "Bartender" }`
   - Backend creates user with role: `"Bartender"` ✅

2. **Staff tries to login** with phone + PIN
   - Backend checks: `if (roleName != "Barman" && ...)`
   - User has role: `"Bartender"`
   - Result: **LOGIN REJECTED** ❌

3. **Even if login worked**, API calls would fail
   - OrdersController requires: `[Authorize(Policy = "Barman")]`
   - User has role: `"Bartender"`
   - Result: **403 FORBIDDEN** ❌

## Backend Fixes Required

### Option 1: Use New Role Names Everywhere (Recommended)
Change all references from "Barman"/"Caderman" to "Bartender"/"Collector":

**AuthController.cs** (Line 173):
```csharp
// OLD
if (roleName != "Staff" && roleName != "Barman" && roleName != "Manager" && roleName != "Caderman")

// NEW
if (roleName != "Staff" && roleName != "Bartender" && roleName != "Manager" && roleName != "Collector")
```

**OrdersController.cs** (Line 12):
```csharp
// OLD
[Authorize(Policy = "Barman")]

// NEW
[Authorize(Policy = "Bartender")]
```

**UnitBookingsController.cs** (Line 13):
```csharp
// OLD
[Authorize(Policy = "Caderman")]

// NEW
[Authorize(Policy = "Collector")]
```

**UnitsController.cs** (Line 13):
```csharp
// OLD
[Authorize(Policy = "Caderman")]

// NEW
[Authorize(Policy = "Collector")]
```

### Option 2: Use Old Role Names Everywhere
Change StaffController to use "Barman"/"Caderman" (NOT recommended - less clear naming)

## Frontend Status
✅ Frontend now uses: `"Manager"`, `"Bartender"`, `"Collector"`
✅ Matches StaffController validation
✅ Users can be created successfully
❌ Users CANNOT login with PIN (AuthController blocks them)
❌ Users CANNOT access their endpoints (authorization policies block them)

## Database Status
The database has BOTH role names:
- Role ID 6: "Barman" (from migration 20260205102919)
- Role ID 7: "Caderman" (from migration 20260206083950)
- Also has: "Bartender" and "Collector" (from migration 20260206083950)

## Immediate Action Required
Backend developer must update 4 files:
1. `AuthController.cs` - Line 173 (PIN login check)
2. `OrdersController.cs` - Line 12 (authorization policy)
3. `UnitBookingsController.cs` - Line 13 (authorization policy)
4. `UnitsController.cs` - Line 13 (authorization policy)

Change all references from "Barman"/"Caderman" to "Bartender"/"Collector".

## Testing After Fix
1. Create Bartender staff via admin dashboard
2. Login with phone + PIN as Bartender
3. Verify redirect to `/bar` route
4. Test Bartender can access `GET /api/business/Orders/active`
5. Test Bartender can update order status
6. Repeat for Collector role

## Why This Happened
The backend had a migration that added both "Barman" and "Bartender" roles, but different parts of the code use different names. This was likely a refactoring that wasn't completed consistently across all files.
