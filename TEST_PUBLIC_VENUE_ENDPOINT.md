# Test Public Venue Endpoint
**Date:** February 20, 2026

---

## Endpoint Exists But Returns 404

The code exists in `backend-temp/BlackBear.Services/BlackBear.Services.Core/Controllers/Public/VenuesController.cs` and is in swagger.json, but returns 404.

---

## Possible Issues

### Issue 1: Venue Not Active
**Line 24 of VenuesController.cs:**
```csharp
.FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted && v.IsActive);
```

The query checks `v.IsActive`. If venue 18 has `IsActive = false`, it will return 404.

**Test in database:**
```sql
SELECT Id, Name, Type, IsActive, IsDeleted, OrderingEnabled, IsDigitalOrderingEnabled
FROM Venues
WHERE Id = 18;
```

**Expected:**
- `IsActive = true`
- `IsDeleted = false`

**If IsActive = false:** Update it:
```sql
UPDATE Venues SET IsActive = true WHERE Id = 18;
```

---

### Issue 2: Deployment Not Complete

The code might not be deployed yet to Azure Container Apps.

**Check deployment:**
1. Go to Azure Portal
2. Find blackbear-api Container App
3. Check latest revision
4. Verify deployment timestamp

---

### Issue 3: Route Case Sensitivity

The route is `api/public/[controller]` which expands to `api/public/Venues` (capital V).

Frontend calls: `https://.../api/public/Venues/18` ✅ (correct case)

---

## Quick Test

**Test the endpoint directly:**
```bash
curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues/18
```

**If 404:** Check if venue exists and is active in database

**If 200:** Frontend should work once Vercel deploys

---

## Summary

The backend code is correct. Most likely issue is:
1. Venue 18 has `IsActive = false` in database
2. Or deployment hasn't finished

Prof Kristi should check the database and ensure venue 18 is active.
