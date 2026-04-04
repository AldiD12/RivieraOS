# Backend Instructions: Strict Role-Based Login Workflows

Hey! We need to logically split the authentication endpoints in `AuthController.cs` so that we have strict silos for who logs in with what. 

## Requirements
- **Managers** must ONLY log in using `Email` + `Password`.
- **Floor Staff (Bartenders, Collectors, etc.)** must ONLY log in using `Phone` + `PIN`.

If a user tries to use the wrong endpoint for their role, the API needs to reject the request with `401 Unauthorized`.

---

## Required Changes in `AuthController.cs`

### 1. Update `[HttpPost("login")]` (Email/Password Endpoint)
After finding the user and verifying their password, check their role before generating the JWT token:

```csharp
// Get user's role
var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName;

// NEW: Block staff from using the Manager/Email login
if (roleName == "Staff" || roleName == "Bartender" || roleName == "Collector")
{
    return Unauthorized("Floor staff must login using Phone Number and PIN.");
}
```

### 2. Update `[HttpPost("login/pin")]` (Phone/PIN Endpoint)
Currently, `Manager` is in the allowed list of roles. You need to remove `Manager` so they cannot log in with a PIN.

**Replace this existing block:**
```csharp
// Get user's role and verify it's a staff role (Staff, Bartender, Manager, or Collector)
var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName;
if (roleName != "Staff" && roleName != "Bartender" && roleName != "Manager" && roleName != "Collector")
{
    return Unauthorized("PIN login is only available for staff members.");
}
```

**With this new block:**
```csharp
// NEW: Manager removed. Only floor staff can use PIN login.
var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName;
if (roleName != "Staff" && roleName != "Bartender" && roleName != "Collector")
{
    return Unauthorized("PIN login is only available for floor staff. Managers must use email login.");
}
```

Once this is deployed, the frontend has already been configured to catch these exact errors and guide the user to the correct tab.
