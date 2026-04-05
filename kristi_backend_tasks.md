# RivieraOS Backend Updates for Kristi

Hey Kristi, here is the consolidated list of backend updates we need to deploy to support the newest Frontend UI changes.

---

## Task 1: Strict Role-Based Login Workflows

We need to logically split the authentication endpoints in `AuthController.cs` so that we enforce strict silos.
- **Managers** must ONLY log in using `Email` + `Password`.
- **Floor Staff** (Bartenders, Collectors) must ONLY log in using `Phone` + `PIN`.

### Requirements in `AuthController.cs`

**1. Update `[HttpPost("login")]` (Email/Password Endpoint):**
Block staff from using the Manager/Email login.
```csharp
// Get user's role
var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName;

if (roleName == "Staff" || roleName == "Bartender" || roleName == "Collector")
{
    return Unauthorized("Floor staff must login using Phone Number and PIN.");
}
```

**2. Update `[HttpPost("login/pin")]` (Phone/PIN Endpoint):**
Remove `Manager` from the allowed roles. Only floor staff can use PIN login.
```csharp
// Get user's role and verify it's a staff role
var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName;

if (roleName != "Staff" && roleName != "Bartender" && roleName != "Collector")
{
    return Unauthorized("PIN login is only available for floor staff. Managers must use email login.");
}
```

*(Note: The frontend has already been configured to catch these exact `401 Unauthorized` string errors and guide the user!)*

---

## Task 2: New Fields for Business Registration

We are capturing more localized SEO and contact data during Business Creation. We need to persist these in the database.

### 1. Update `Business.cs` Entity
Add the following new columns to the `core_businesses` table:

```csharp
[MaxLength(500)]
[Column("google_maps_address")]
public string? GoogleMapsAddress { get; set; }

[MaxLength(500)]
[Column("review_link")]
public string? ReviewLink { get; set; }

[MaxLength(50)]
[Column("phone_number")]
public string? PhoneNumber { get; set; }

[MaxLength(255)]
[Column("operation_zone")]
public string? OperationZone { get; set; }
```

### 2. Generate Migration
```bash
dotnet ef migrations add AddBusinessRegistrationFields
dotnet ef database update
```

### 3. Update the Data Transfer Objects
Update `CreateBusinessRequest`, `UpdateBusinessRequest`, `BusinessDetailDto`, and their Business Admin equivalent DTOs to include these properties so the frontend payload binds successfully:

```csharp
public string? GoogleMapsAddress { get; set; }
public string? ReviewLink { get; set; }
public string? PhoneNumber { get; set; }
public string? OperationZone { get; set; }
```

### 4. Controller Logic
In `BusinessesController.cs` (and SuperAdmin equivalent), ensure the `Create` and `Update` endpoints correctly map these new fields from the Request objects to the Database Entity.

*(Note: The frontend is already sending these fields in the JSON payload!)*

---

## Task 3: Frontend Cleanups (FYI / Backend Cleanup)

Please note that we have massively cleaned up the Frontend modals for **SuperAdmin** and **Business Admin**. The frontend will **no longer** send the following fields. 

Because your current C# DTOs treat these as optional/nullable, the system will not break. However, if you want to clean up the backend DTOs and Database to match the new strict frontend, you can safely remove them:

**1. Venue Creation/Edit (`CreateVenueRequest`, `UpdateVenueRequest`)**
- Removed: `Description`
- Removed: `WhatsAppNumber` 
- Removed: `GooglePlaceId`

**2. Zone Creation/Edit (`CreateZoneRequest`, `UpdateZoneRequest`)**
- Removed: `CapacityPerUnit`
- Removed: `BasePrice`

**3. Zone / Bulk Units Management**
- Removed: `Cabana`, `Umbrella`, `Regular`, `VIP`, `Lounge` options. 
- The ONLY valid `UnitType` and `ZoneType` options being sent from the frontend now are strictly `"Sunbed"` and `"Table"`.

**4. LoginPage.jsx Loop Bug**
- The frontend was previously stuck in an infinite API loop if the `401 Unauthorized` PIN login failed. We fixed this frontend bug natively by destroying the `pin` react state upon failure. No backend action required here.

---

## Task 4: Make VenueId Optional on Events (URGENT)

Events should live at the **business level**, not be tied to a specific venue. Right now `VenueId` is `[Required]` which means:
- Businesses that haven't created a venue yet **cannot create events at all**
- Business Admins are forced to pick a venue even though it doesn't make sense

### Changes Needed

**1. Update `CreateEventRequest` in `EventDtos.cs` (SuperAdmin namespace):**
```csharp
// CHANGE THIS:
[Required]
public int VenueId { get; set; }

// TO THIS:
public int? VenueId { get; set; }
```

**2. Update `UpdateEventRequest` in the same file — same change:**
```csharp
// CHANGE THIS:
[Required]
public int VenueId { get; set; }

// TO THIS:
public int? VenueId { get; set; }
```

**3. Do the same in `Business/EventDtos.cs`** (if the Business namespace has its own Event DTOs).

**4. Update the Event Entity** (`Event.cs` or equivalent):
```csharp
// Change the column to nullable
[Column("venue_id")]
public int? VenueId { get; set; }
```

**5. Update the Controller** to handle nullable VenueId:
- If `VenueId` is null, just store it as null — the event belongs to the whole business
- If `VenueId` has a value, validate it exists as before

**6. Generate Migration:**
```bash
dotnet ef migrations add MakeEventVenueIdOptional
dotnet ef database update
```

*(The frontend is already handling the null case — once you deploy this, everything will work automatically!)*
