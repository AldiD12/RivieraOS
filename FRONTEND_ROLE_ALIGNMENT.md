# Frontend Role Alignment with Backend

## Problem
Backend uses authorization policies with role names "Barman" and "Caderman", but frontend was creating users with "Bartender" and "Collector" roles. This caused authentication failures.

## Solution
Updated frontend to use backend's expected role names.

## Changes Made

### 1. API Services
**File:** `frontend/src/services/businessApi.js`
- Changed allowed roles from `['Manager', 'Bartender', 'Collector']` to `['Manager', 'Barman', 'Caderman']`
- Updated validation in both create and update functions

**File:** `frontend/src/services/superAdminApi.js`
- Updated comments to reflect backend role names

### 2. Login & Routing
**File:** `frontend/src/pages/LoginPage.jsx`
- Updated role routing map:
  - `'Barman': '/bar'` (was 'Bartender')
  - `'Caderman': '/collector'` (was 'Collector')

**File:** `frontend/src/App.jsx`
- Updated ProtectedRoute roles:
  - `/bar` route: `role="Barman"` (was 'Bartender')
  - `/collector` route: `role="Caderman"` (was 'Waiter')

### 3. Admin Dashboards
**File:** `frontend/src/pages/BusinessAdminDashboard.jsx`
- Updated role dropdown options:
  - `<option value="Barman">Barman (Bartender)</option>`
  - `<option value="Caderman">Caderman (Collector)</option>`
- Updated role validation

**File:** `frontend/src/pages/SuperAdminDashboard.jsx`
- Updated role dropdown options (same as above)
- Updated help text to show correct backend roles

## Backend Authorization Policies (No Changes Needed)

Backend `Program.cs` already has BOTH policies defined:
```csharp
options.AddPolicy("Barman", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Barman"));
options.AddPolicy("Caderman", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Caderman"));
options.AddPolicy("Bartender", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Bartender"));
options.AddPolicy("Collector", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Collector"));
```

Controllers use:
- `OrdersController.cs`: `[Authorize(Policy = "Barman")]`
- `UnitBookingsController.cs`: `[Authorize(Policy = "Caderman")]`
- `UnitsController.cs`: `[Authorize(Policy = "Caderman")]`

AuthController PIN login checks for: "Staff", "Barman", "Manager", "Caderman"

## Result
✅ Frontend now creates users with "Barman" and "Caderman" roles
✅ PIN login will work (AuthController accepts these roles)
✅ API authorization will work (controllers use these policy names)
✅ No backend changes required

## Testing Checklist
- [ ] Create new Barman staff member via admin dashboard
- [ ] Login with phone + PIN as Barman
- [ ] Verify redirect to `/bar` route
- [ ] Test Barman can access order endpoints
- [ ] Create new Caderman staff member
- [ ] Login with phone + PIN as Caderman
- [ ] Verify redirect to `/collector` route
- [ ] Test Caderman can access booking/unit endpoints

## Display Names
UI shows friendly names in parentheses:
- "Barman (Bartender)" in dropdowns
- "Caderman (Collector)" in dropdowns

This helps users understand the roles while using backend-compatible values.
