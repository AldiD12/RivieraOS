# SuperAdmin Units Endpoints Missing from Deployed API

**Date:** February 11, 2026  
**Status:** ⚠️ WORKAROUND APPLIED  
**Priority:** HIGH

## Problem

The SuperAdmin Units endpoints are NOT deployed to production, even though the controller exists in the backend codebase.

### Evidence

1. **Backend Code Exists:** `BlackBear.Services.Core/Controllers/SuperAdmin/UnitsController.cs` is present
2. **Swagger Missing:** `frontend/swagger.json` does NOT contain `/api/superadmin/venues/{venueId}/Units` endpoints
3. **404 Errors:** Frontend gets 404 when calling SuperAdmin Units endpoints
4. **Business Endpoints Work:** `/api/business/venues/{venueId}/Units` endpoints ARE deployed and working

### Expected Routes (NOT DEPLOYED)
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

### Available Routes (DEPLOYED)
```
GET    /api/business/venues/{venueId}/Units
GET    /api/business/venues/{venueId}/Units/stats
GET    /api/business/venues/{venueId}/Units/{id}
GET    /api/business/venues/{venueId}/Units/by-qr/{qrCode}
POST   /api/business/venues/{venueId}/Units
POST   /api/business/venues/{venueId}/Units/bulk
PUT    /api/business/venues/{venueId}/Units/{id}
PUT    /api/business/venues/{venueId}/Units/{id}/status
DELETE /api/business/venues/{venueId}/Units/{id}
```

## Workaround Applied

**File:** `frontend/src/services/superAdminApi.js`

Changed `unitApi` to use Business endpoints (`/api/business/venues/{venueId}/Units`) instead of SuperAdmin endpoints. This works because:
- SuperAdmin JWT token has permissions to access Business endpoints
- Business endpoints provide all needed functionality except `restore`

**Commit:** `e54ba09` - "⚠️ WORKAROUND: Use Business Units endpoints until SuperAdmin endpoints deployed"

## Task for Prof Kristi

### 1. Verify Controller Registration

Check if `UnitsController` is properly registered in the SuperAdmin area:

**File:** `BlackBear.Services.Core/Program.cs` or startup configuration

Ensure the controller is:
- In the correct namespace: `BlackBear.Services.Core.Controllers.SuperAdmin`
- Has correct route attribute: `[Route("api/superadmin/venues/{venueId}/[controller]")]`
- Has correct authorization: `[Authorize(Policy = "SuperAdmin")]`

### 2. Check Swagger Configuration

Verify Swagger is configured to discover SuperAdmin controllers:

```csharp
builder.Services.AddSwaggerGen(c =>
{
    // Should include SuperAdmin controllers
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BlackBear API", Version = "v1" });
});
```

### 3. Deploy SuperAdmin UnitsController

Once verified, redeploy the backend to Azure Container Apps.

### 4. Update Swagger.json

After deployment, regenerate `swagger.json`:
```bash
curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/swagger/v1/swagger.json > frontend/swagger.json
```

### 5. Notify Frontend Team

Once deployed, frontend will switch back to SuperAdmin endpoints:

**Change in `frontend/src/services/superAdminApi.js`:**
```javascript
// FROM (current workaround):
const url = `/business/venues/${venueId}/Units`;

// TO (proper implementation):
const url = `/superadmin/venues/${venueId}/Units`;
```

## Impact

### Current Limitations with Workaround
- ✅ View units - WORKS
- ✅ Create units - WORKS
- ✅ Bulk create units - WORKS
- ✅ Update units - WORKS
- ✅ Delete units - WORKS
- ❌ Restore deleted units - NOT AVAILABLE (Business endpoints don't have restore)

### After SuperAdmin Endpoints Deployed
- ✅ All functionality including restore
- ✅ Proper authorization separation
- ✅ Consistent API structure

## Related Files

**Backend:**
- `BlackBear.Services.Core/Controllers/SuperAdmin/UnitsController.cs`
- `BlackBear.Services.Core/Controllers/SuperAdmin/UnitBookingsController.cs` (also deployed?)
- `BlackBear.Services.Core/Controllers/SuperAdmin/OrdersController.cs` (also deployed?)

**Frontend:**
- `frontend/src/services/superAdminApi.js` (workaround applied)
- `frontend/src/pages/SuperAdminDashboard.jsx` (uses unitApi)
- `frontend/swagger.json` (needs update after deployment)

## Testing After Deployment

1. Check swagger.json contains SuperAdmin Units endpoints
2. Test bulk create: `POST /api/superadmin/venues/10/Units/bulk`
3. Test get units: `GET /api/superadmin/venues/10/Units?zoneId=6`
4. Test restore: `POST /api/superadmin/venues/10/Units/123/restore`
5. Verify SuperAdmin JWT token works with all endpoints

---

**Next Steps:**
1. Prof Kristi deploys SuperAdmin UnitsController
2. Frontend team switches back to SuperAdmin endpoints
3. Test all functionality including restore
4. Remove workaround comments from code
