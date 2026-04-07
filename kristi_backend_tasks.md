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

Events should be capable of living at the **business level**, not solely tied to a specific venue. Right now `VenueId` is `[Required]` which means:
- Businesses that haven't created a venue yet **cannot create events at all**
- We can't have platform-wide or business-wide events.

### The Big Architecture Change:
If `VenueId` becomes optional (null), **we MUST add a `BusinessId` column to the `events_scheduled` table** so the event doesn't become an orphan!

### Changes Needed

**1. Update the `ScheduledEvent` Entity (`ScheduledEvent.cs`)**
```csharp
// 1. Make VenueId Nullable
[Column("venue_id")]
public int? VenueId { get; set; }

// 2. ADD BusinessId as a new Foreign Key
[Column("business_id")]
public int BusinessId { get; set; } // Required, so the event always has a business owner

[ForeignKey("BusinessId")]
public Business? Business { get; set; }
```

**2. Update EVERY `CreateEventRequest` & `UpdateEventRequest` DTO (SuperAdmin AND Business Namespaces):**
- Make `VenueId` a `public int? VenueId { get; set; }`.
- **(SuperAdmin ONLY)** Add `public int? BusinessId { get; set; }` inside the DTO so the frontend can tell you which business to attach it to. (Business Admins don't need this since you read it from their JWT claim).

**3. Update Both Controllers (`SuperAdmin/EventsController` & `Business/EventsController`)**
When creating a new Event:
```csharp
var evt = new ScheduledEvent
{
    // ... other fields
    VenueId = request.VenueId, // can be null
    BusinessId = businessIdFromRequestOrClaims // IMPORTANT!
};
```
*Note: In SuperAdmin, read `BusinessId` from the frontend JSON. In Business logic, read it from `_currentUserService`.*

**4. Update GetEvents Queries (`SuperAdmin` and `Business` Controllers)**
If you have queries like `query.Where(e => e.Venue.BusinessId == businessId)`, you must update them because `e.Venue` could be null! Change them to:
```csharp
query = query.Where(e => e.BusinessId == businessId);
```

**4b. ⚠️ UPDATE `PublicEventsController.cs` (CRITICAL)**
Currently, **every single `[HttpGet]` method** in `PublicEventsController` has a filter that looks like this:
```csharp
.Where(e => e.Venue != null && _context.BusinessFeatures.Any(bf => bf.BusinessId == e.Venue.BusinessId && bf.HasEvents))
```
This brutally and silently omits ALL events that don't have a venue! Because of this, business-level events don't show up on the frontend's Night Mode Map.
You must update these Public LINQ queries to use the Event's new `BusinessId` instead of `Venue.BusinessId`, and REMOVE the `e.Venue != null` requirement.
Example:
```csharp
.Where(e => _context.BusinessFeatures.Any(bf => bf.BusinessId == e.BusinessId && !bf.IsDeleted && bf.HasEvents))
```

**5. Generate Migration:**
```bash
dotnet ef migrations add AddBusinessIdToEvents
dotnet ef database update
```

*(Frontend is heavily reliant on this fix. Until this is fully deployed on Azure, creating an Event fails!)*

---

## Task 5: Expose Business Contact on Public Event DTO (URGENT)

When a user taps **"CONFIRM ACCESS"** on an event in Night Mode, the frontend opens WhatsApp with a booking message. This works for venue-based events (using `VenueWhatsappNumber`), but **for business-level events (no venue assigned), `VenueWhatsappNumber` is null** because there's no venue.

The frontend needs the **Business's WhatsApp/phone number** to work as a fallback contact for these events.

### Changes Needed

**0. Add New Fields to `Business` Entity & DTOs:**
~~*Kristi already did this! He added `PhoneNumber`, `OperationZone`, `GoogleMapsAddress`, and `ReviewLink` in commit 0ed6a0d.*~~

**1. Add Business Fields to Public DTOs:**
Update `PublicEventListItemDto` AND `PublicVenueListItemDto` (and any other public venue DTOs) to include:
```csharp
public string? BusinessPhoneNumber { get; set; }
public string? BusinessGoogleMapsAddress { get; set; }
public string? BusinessReviewLink { get; set; }
```

**2. Populate them in `PublicEventsController.cs` and `PublicVenuesController.cs` projections:**
```csharp
BusinessPhoneNumber = e.Business != null ? e.Business.PhoneNumber : 
                         (e.Venue != null && e.Venue.Business != null ? e.Venue.Business.PhoneNumber : null),
BusinessGoogleMapsAddress = e.Business != null ? e.Business.GoogleMapsAddress : 
                         (e.Venue != null && e.Venue.Business != null ? e.Venue.Business.GoogleMapsAddress : null),
BusinessReviewLink = e.Business != null ? e.Business.ReviewLink : 
                         (e.Venue != null && e.Venue.Business != null ? e.Venue.Business.ReviewLink : null),
```

**3. Make sure the query includes them:**
```csharp
.Include(e => e.Business)
.Include(e => e.Venue).ThenInclude(v => v!.Business)
```

Once this is deployed, the frontend will automatically use it — no frontend changes needed!
