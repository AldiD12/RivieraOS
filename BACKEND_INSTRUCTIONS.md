# Backend Instructions - Fix Zones & Test Cron Job

## Problem
Zones are inactive by default because the `VenueZone` entity is missing the `IsActive` field.

## Quick Fix (SQL)
Run this script in SQL Server Management Studio or Azure Data Studio:

```bash
FIX_ZONES_AND_CREATE_TEST_DATA.sql
```

This script will:
1. ✅ Add `is_active` column to `catalog_venue_zones` (if missing)
2. ✅ Set all existing zones to active
3. ✅ Create 8 test sunbed units (TEST-1 through TEST-8)

## Permanent Fix (Code)

### 1. Update VenueZone.cs
**File:** `BlackBear.Services.Core/Entities/VenueZone.cs`

Add this property:
```csharp
[Column("is_active")]
public bool IsActive { get; set; } = true;
```

### 2. Update ZonesController.cs
**File:** `BlackBear.Services.Core/Controllers/Business/ZonesController.cs`

In the `CreateZone` method, add:
```csharp
var zone = new VenueZone
{
    Name = request.Name,
    ZoneType = request.ZoneType,
    CapacityPerUnit = request.CapacityPerUnit,
    BasePrice = request.BasePrice,
    VenueId = venueId,
    IsActive = true  // ← ADD THIS LINE
};
```

### 3. Create Migration
```bash
cd BlackBear.Services/BlackBear.Services.Core
dotnet ef migrations add AddIsActiveToVenueZones
dotnet ef database update
```

## Testing the Cron Job

After running the SQL script:

1. **Frontend:** Go to `/test-cron` page
2. **Click:** "Create All 8 Test Bookings" button
3. **Wait:** Until midnight (00:00 Italy time)
4. **Verify:** Run the verification query from the SQL script

### Expected Results
- 2 Reserved bookings → Status changes to "Completed"
- 2 Active bookings → Status changes to "Completed"
- 2 Completed bookings → No change
- 2 Cancelled bookings → No change

## Files Created
- `FIX_ZONES_AND_CREATE_TEST_DATA.sql` - Run this first
- `find-ids-simple.sql` - Helper to find IDs (optional)
- `test-cron-job-bookings.sql` - Alternative manual approach (optional)

## Questions?
The frontend `/test-cron` page can also create units automatically if you prefer that approach.
