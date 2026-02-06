# 🚨 URGENT: Backend PIN Login Fix Required

## Current Issue
The PIN login is failing for Bartender and Collector roles because the backend AuthController still uses old role names.

## Current Code (Line 174 in AuthController.cs)
```csharp
if (roleName != "Staff" && roleName != "Barman" && roleName != "Manager" && roleName != "Caderman")
{
    return Unauthorized("PIN login is only available for staff members.");
}
```

## Required Fix
**File:** `BlackBear.Services/BlackBear.Services.Core/Controllers/AuthController.cs`
**Line:** 174

**Change from:**
```csharp
if (roleName != "Staff" && roleName != "Barman" && roleName != "Manager" && roleName != "Caderman")
```

**Change to:**
```csharp
if (roleName != "Manager" && roleName != "Bartender" && roleName != "Collector")
```

## Why This Fix is Needed
1. Frontend creates staff with roles: Manager, Bartender, Collector
2. Backend only allows: Staff, Barman, Manager, Caderman
3. Result: Bartender and Collector can't login with PIN

## Test After Fix
1. Create a Bartender staff member in SuperAdmin
2. Try to login with phone + PIN on /login
3. Should redirect to /bar instead of getting 401 error

## Status
❌ **NOT FIXED YET** - Backend developer needs to make this 1-line change