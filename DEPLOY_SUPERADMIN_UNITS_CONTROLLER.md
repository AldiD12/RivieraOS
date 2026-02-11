# URGENT: Deploy SuperAdmin UnitsController to Production

**Date:** February 11, 2026  
**Priority:** 🔴 CRITICAL - BLOCKING SUPERADMIN DASHBOARD  
**Assigned To:** Prof Kristi

---

## Problem

The SuperAdmin dashboard CANNOT manage units because the SuperAdmin UnitsController is NOT deployed to production.

**Current Status:**
- ✅ Controller exists in codebase: `BlackBear.Services.Core/Controllers/SuperAdmin/UnitsController.cs`
- ✅ Controller is properly configured with routes and authorization
- ❌ Controller is NOT deployed to Azure Container Apps
- ❌ Swagger does NOT show `/api/superadmin/venues/{venueId}/Units` endpoints

**Evidence:**
```bash
# These endpoints return 404:
GET  /api/superadmin/venues/10/Units
POST /api/superadmin/venues/10/Units/bulk
```

---

## Required Action

### Deploy the Backend with SuperAdmin UnitsController

The controller already exists in your codebase at:
```
BlackBear.Services/BlackBear.Services.Core/Controllers/SuperAdmin/UnitsController.cs
```

**Steps:**

1. **Verify the controller is in your latest code:**
   ```bash
   cd BlackBear.Services
   git status
   git log --oneline -5
   ```

2. **Build and deploy to Azure:**
   ```bash
   # Your normal deployment process
   dotnet build
   dotnet publish
   # Deploy to Azure Container Apps
   ```

3. **Verify deployment:**
   ```bash
   # Check if endpoint exists:
   curl -X GET "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/venues/10/Units" \
     -H "Authorization: Bearer YOUR_SUPERADMIN_TOKEN"
   
   # Should return 200 (or 401 if token invalid), NOT 404
   ```

4. **Update Swagger:**
   ```bash
   # After deployment, regenerate swagger.json:
   curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/swagger/v1/swagger.json \
     > swagger.json
   
   # Verify it contains SuperAdmin Units endpoints:
   grep -A 5 "/api/superadmin/venues/{venueId}/Units" swagger.json
   ```

---

## Expected Endpoints After Deployment

These should appear in Swagger and return 200 (not 404):

```
GET    /api/superadmin/venues/{venueId}/Units
GET    /api/superadmin/venues/{venueId}/Units/stats
GET    /api/superadmin/venues/{venueId}/Units/{id}
GET    /api/superadmin/venues/{venueId}/Units/by-qr/{qrCode}
POST   /api/superadmin/venues/{venueId}/Units
POST   /api/superadmin/venues/{venueId}/Units/bulk
PUT    /api/superadmin/venues/{venueId}/Units/{id}
PUT    /api/superadmin/venues/{venueId}/Units/{id}/status
DELETE /api/superadmin/venues/{venueId}/Units/{id}
POST   /api/superadmin/venues/{venueId}/Units/{id}/restore
```

---

## Why This is Critical

1. **SuperAdmin Dashboard is Blocked:** Cannot create or manage units from SuperAdmin dashboard
2. **Workaround is Temporary:** Currently using Business endpoints which lack restore functionality
3. **Inconsistent Architecture:** SuperAdmin should use SuperAdmin endpoints, not Business endpoints
4. **Missing Features:** Restore deleted units is not available in Business endpoints

---

## Controller Details

**File:** `BlackBear.Services.Core/Controllers/SuperAdmin/UnitsController.cs`

**Route:** `[Route("api/superadmin/venues/{venueId}/[controller]")]`  
**Authorization:** `[Authorize(Policy = "SuperAdmin")]`

**Key Methods:**
- `GetUnits()` - List units with filters
- `GetUnit(id)` - Get single unit
- `GetUnitByQrCode(qrCode)` - Find by QR code
- `GetStats()` - Unit statistics
- `CreateUnit()` - Create single unit
- `BulkCreateUnits()` - Create multiple units (A1, A2, A3...)
- `UpdateUnit(id)` - Update unit details
- `UpdateUnitStatus(id)` - Change status (Available/Occupied/Maintenance)
- `DeleteUnit(id)` - Soft delete
- `RestoreUnit(id)` - Restore deleted unit

---

## Testing After Deployment

### 1. Test with Postman/curl

```bash
# Get SuperAdmin token first
TOKEN="your_superadmin_jwt_token"

# Test GET units
curl -X GET "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/venues/10/Units?zoneId=6" \
  -H "Authorization: Bearer $TOKEN"

# Test bulk create
curl -X POST "https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/superadmin/venues/10/Units/bulk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "venueZoneId": 6,
    "prefix": "A",
    "startNumber": 1,
    "count": 5,
    "unitType": "Sunbed",
    "basePrice": 15.00
  }'
```

### 2. Verify in Swagger UI

Visit: https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/swagger

Search for: `SuperAdmin/Units`

Should see all 10 endpoints listed above.

---

## After Deployment - Frontend Update

Once you confirm deployment is successful, notify the frontend team. They will:

1. Update `frontend/swagger.json` with new endpoints
2. Switch `superAdminApi.js` from Business endpoints back to SuperAdmin endpoints
3. Test all functionality including restore
4. Remove workaround comments

**Frontend will handle this automatically once backend is deployed.**

---

## Questions?

If you encounter any issues during deployment:
1. Check Azure Container Apps logs
2. Verify the controller is in the deployed build
3. Check if authorization policies are working
4. Test with a valid SuperAdmin JWT token

---

**Status:** ⏳ WAITING FOR BACKEND DEPLOYMENT

Once deployed, update this document with:
- ✅ Deployment timestamp
- ✅ Swagger verification screenshot
- ✅ Test results
