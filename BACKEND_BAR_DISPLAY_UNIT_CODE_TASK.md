# Backend Task: Allow Empty Prefix in Bulk Unit Creation

## Issue
The bulk unit creation endpoint is returning 400 Bad Request when the frontend sends an empty prefix string.

## Affected Pages
This fix will enable bulk unit creation in:
1. ✅ **ZoneUnitsManager** (Business Admin) - Already has prefix field in form
2. ⚠️ **SuperAdminDashboard** - Missing prefix field (needs frontend update after backend fix)
3. ✅ **TestCronBookings** - Testing page

## Current Backend Code
**File:** `backend-temp/BlackBear.Services/BlackBear.Services.Core/DTOs/Business/ZoneUnitDtos.cs`

```csharp
public class BizBulkCreateUnitsRequest
{
    [Required]
    public int VenueZoneId { get; set; }

    [Required]
    [MaxLength(50)]
    public string UnitType { get; set; } = "Sunbed";

    [Required]  // ❌ This rejects empty strings by default
    [MaxLength(10)]
    public string Prefix { get; set; } = string.Empty;

    [Required]
    [Range(1, 100)]
    public int StartNumber { get; set; } = 1;

    [Required]
    [Range(1, 100)]
    public int Count { get; set; } = 1;

    public decimal? BasePrice { get; set; }
}
```

## Problem
The `[Required]` attribute in C# by default rejects empty strings. When the frontend sends:
```json
{
  "venueZoneId": 18,
  "unitType": "Sunbed",
  "prefix": "",  // ❌ Backend rejects this
  "startNumber": 1,
  "count": 10,
  "basePrice": 50
}
```

The backend validation fails because `[Required]` treats empty string as invalid.

## Solution
Modify the `Prefix` field validation to allow empty strings:

```csharp
[Required(AllowEmptyStrings = true)]  // ✅ This allows empty strings
[MaxLength(10)]
public string Prefix { get; set; } = string.Empty;
```

## Why This Works
- `[Required(AllowEmptyStrings = true)]` ensures the field is present in the request but allows it to be an empty string
- This lets users create units without a prefix (just numbers: 1, 2, 3...)
- Or with a prefix (A1, A2, A3... or VIP1, VIP2, VIP3...)

## Testing
After deploying this change, test with:

**Request 1: Empty prefix (numbers only)**
```bash
POST /api/business/venues/18/Units/bulk
{
  "venueZoneId": 18,
  "unitType": "Sunbed",
  "prefix": "",
  "startNumber": 1,
  "count": 5,
  "basePrice": 50
}
```
Expected result: Creates units: 1, 2, 3, 4, 5

**Request 2: With prefix**
```bash
POST /api/business/venues/18/Units/bulk
{
  "venueZoneId": 18,
  "unitType": "Sunbed",
  "prefix": "A",
  "startNumber": 1,
  "count": 5,
  "basePrice": 50
}
```
Expected result: Creates units: A1, A2, A3, A4, A5

## Priority
🔴 HIGH - This is blocking unit creation in ZoneUnitsManager and SuperAdminDashboard

## Status
⏳ Waiting for Prof Kristi to implement and deploy

## Frontend Follow-up Required
After backend is deployed, SuperAdminDashboard needs to be updated to include the `prefix` field in its bulk create form (currently missing).
