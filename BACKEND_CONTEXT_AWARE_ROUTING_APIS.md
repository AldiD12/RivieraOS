# Backend APIs for Context-Aware Routing Architecture

**Date:** February 26, 2026  
**For:** Prof Kristi (Backend Developer)  
**From:** Aldi (Frontend Team)  
**Priority:** HIGH  
**Total Work:** 8-11 hours

---

## 📋 OVERVIEW

Hi Prof Kristi,

The frontend is implementing a "Context-Aware Routing" architecture where the app switches between two modes:
- **SPOT MODE** (on-site, QR code scanned) - Enhanced ordering + events
- **DISCOVER MODE** (off-site, browsing) - Map + venue discovery

**GREAT NEWS:** I analyzed the swagger.json and found that 90% of the APIs we need already exist! You've been building ahead! 🎉

This document lists ONLY the NEW APIs that need to be built. Everything else is already working.

---

## 🔍 WHAT I FOUND IN SWAGGER.JSON

### ✅ APIs That Already Exist (No Work Needed!)
- ✅ `/api/public/Venues/{id}` - Venue details
- ✅ `/api/public/Orders/menu` - Menu
- ✅ `/api/public/Orders` - Place order
- ✅ `/api/public/Reservations` - Create reservation
- ✅ `/api/public/Events` - List events
- ✅ `/api/public/Events/venue/{id}` - Venue events
- ✅ `/api/public/venues/{id}/reviews` - Submit review
- ✅ `/api/business/venues/{venueId}/Zones` - List zones
- ✅ `/api/business/Venues` - List venues

### ❌ What's Missing (Need to Build)
1. **Negative Feedback Tracking** - No table, no endpoints
2. **Manual Zone Override** - No fields in VenueZones table, no endpoint
3. **Public Venues List** - No public endpoint to list all venues
4. **Venue Availability** - No endpoint for real-time availability
5. **Content Management** - No table, no endpoints (optional for Phase 3)

**Current Zone Schema (from swagger):**
```json
{
  "id": 1,
  "name": "VIP Section",
  "zoneType": "sunbed",
  "capacityPerUnit": 2,
  "basePrice": 100.00,
  "isActive": true
}
```

**Missing fields:** `isManualOverride`, `overrideReason`, `overrideUntil`, `overrideBy`

---

## ✅ WHAT ALREADY EXISTS (No Work Needed)

These endpoints are already implemented and working:

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/public/Venues/{id}` | GET | Get venue details | ✅ Working |
| `/api/public/Orders/menu?venueId={id}` | GET | Get menu for venue | ✅ Working |
| `/api/public/Orders` | POST | Place order | ✅ Working |
| `/api/public/Orders/{orderNumber}` | GET | Get order status | ✅ Working |
| `/api/public/Reservations` | POST | Create reservation | ✅ Working |
| `/api/public/Reservations/{bookingCode}` | GET | Get reservation details | ✅ Working |
| `/api/public/Reservations/availability` | GET | Check availability | ✅ Working |
| `/api/public/Reservations/zones` | GET | Get zones for venue | ✅ Working |
| `/api/public/venues/{venueId}/reviews` | POST | Submit review | ✅ Working |
| `/api/public/venues/{venueId}/reviews/rating` | GET | Get venue rating | ✅ Working |
| `/api/public/Events` | GET | List events | ✅ Working |
| `/api/public/Events/{id}` | GET | Get event details | ✅ Working |
| `/api/public/Events/venue/{venueId}` | GET | Get venue events | ✅ Working |
| `/api/public/Events/business/{businessId}` | GET | Get business events | ✅ Working |
| `/api/collector/units` | GET | Get collector units | ✅ Working |
| `/api/collector/units/{id}/status` | PUT | Update unit status | ✅ Working |

**🎉 AMAZING NEWS: Most APIs already exist! Prof Kristi has been busy!**

**Frontend can start ALL PHASES immediately!**

---

## 🆕 NEW APIS NEEDED

### 🚨 CRITICAL MISSING LINKS (Discovered by User)

#### 0A. Save Negative Feedback (The "Review Shield")

**Endpoint:** `POST /api/public/Feedback`

**Purpose:** Record negative feedback BEFORE opening WhatsApp (for analytics and proof)

**Why Critical:** At end of summer, you need data to prove "I stopped 50 bad reviews for you"

**Request Body:**
```json
{
  "venueId": 1,
  "rating": 2,
  "comment": "Warm beer, slow service",
  "unitCode": "42",
  "guestName": "John Doe",
  "guestPhone": "+355691234567",
  "submittedAt": "2026-02-25T15:30:00Z"
}
```

**Response:**
```json
{
  "id": 123,
  "venueId": 1,
  "rating": 2,
  "status": "Intercepted",
  "message": "Feedback recorded. WhatsApp support will contact you."
}
```

**Database Schema Needed:**

```sql
CREATE TABLE NegativeFeedback (
    Id INT PRIMARY KEY IDENTITY(1,1),
    VenueId INT NOT NULL,
    Rating INT NOT NULL, -- 1-5 stars
    Comment NVARCHAR(1000),
    UnitCode NVARCHAR(50),
    GuestName NVARCHAR(200),
    GuestPhone NVARCHAR(50),
    SubmittedAt DATETIME NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Intercepted', -- Intercepted, Resolved, Escalated
    ResolvedAt DATETIME,
    ResolvedBy INT, -- Staff UserId
    ResolutionNotes NVARCHAR(1000),
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (VenueId) REFERENCES Venues(Id)
);
```

**Implementation Notes:**
- Save ALL feedback with rating <= 3 stars
- Return 200 OK immediately (don't block WhatsApp redirect)
- Frontend opens WhatsApp AFTER successful save
- Business owners can view this data in dashboard
- Analytics: "Prevented X bad reviews this month"

**Estimated Time:** 2 hours (includes database schema)

---

#### 0B. Manual Zone Status Override (The "Owner Switch")

**Endpoint:** `PUT /api/business/zones/{id}/availability`

**Purpose:** Allow managers to manually mark zones as FULL (override automatic calculation)

**Why Critical:** People pay cash and sit without ordering - automatic counting is inaccurate

**Request Body:**
```json
{
  "isAvailable": false,
  "reason": "VIP section fully booked for private event",
  "overrideUntil": "2026-02-25T20:00:00Z"
}
```

**Response:**
```json
{
  "zoneId": 1,
  "zoneName": "VIP Section",
  "isAvailable": false,
  "availableUnits": 0,
  "totalUnits": 20,
  "isManualOverride": true,
  "overrideReason": "VIP section fully booked for private event",
  "overrideUntil": "2026-02-25T20:00:00Z"
}
```

**Database Schema Changes:**

```sql
-- Add columns to VenueZones table
ALTER TABLE VenueZones ADD IsManualOverride BIT DEFAULT 0;
ALTER TABLE VenueZones ADD OverrideReason NVARCHAR(500);
ALTER TABLE VenueZones ADD OverrideUntil DATETIME;
ALTER TABLE VenueZones ADD OverrideBy INT; -- Staff UserId
```

**Implementation Notes:**
- Manual override takes precedence over automatic unit counting
- If `IsManualOverride = true` and `OverrideUntil > NOW()`, zone shows as unavailable
- Automatically revert to automatic calculation after `OverrideUntil` expires
- Log who set the override and when
- Show override status in Business Admin dashboard

**Estimated Time:** 2-3 hours (includes database migration)

---

#### 0C. View Negative Feedback (Business Admin Dashboard)

**Endpoint:** `GET /api/business/feedback`

**Purpose:** Allow business admins to view all intercepted negative feedback for their venues

**Why Needed:** Business owners need to see the feedback data and track resolutions

**Authorization:** Requires `BusinessAdmin` or `Staff` role

**Query Parameters:**
- `venueId` (optional): Filter by specific venue
- `status` (optional): Filter by status (Intercepted, Resolved, Escalated)
- `fromDate` (optional): Filter from date
- `toDate` (optional): Filter to date

**Response:**
```json
[
  {
    "id": 123,
    "venueId": 1,
    "venueName": "Folie Beach Club",
    "rating": 2,
    "comment": "Warm beer, slow service",
    "unitCode": "42",
    "guestName": "John Doe",
    "guestPhone": "+355691234567",
    "submittedAt": "2026-02-25T15:30:00Z",
    "status": "Intercepted",
    "resolvedAt": null,
    "resolvedBy": null,
    "resolutionNotes": null
  }
]
```

**Implementation Notes:**
- Filter by business ID from JWT token (only show feedback for their venues)
- Order by `SubmittedAt DESC` (newest first)
- Include stats: total count, this week, this month, avg rating

**Estimated Time:** 1 hour

---

#### 0D. Update Feedback Status (Business Admin)

**Endpoint:** `PUT /api/business/feedback/{id}/status`

**Purpose:** Allow business admins to mark feedback as resolved

**Authorization:** Requires `BusinessAdmin` or `Staff` role

**Request Body:**
```json
{
  "status": "Resolved",
  "resolutionNotes": "Called guest, offered complimentary drinks for next visit"
}
```

**Response:**
```json
{
  "id": 123,
  "status": "Resolved",
  "resolvedAt": "2026-02-25T16:00:00Z",
  "resolvedBy": 5,
  "resolvedByName": "John Manager",
  "resolutionNotes": "Called guest, offered complimentary drinks for next visit"
}
```

**Implementation Notes:**
- Set `ResolvedAt` to current timestamp
- Set `ResolvedBy` to user ID from JWT token
- Valid statuses: "Intercepted", "Resolved", "Escalated"

**Estimated Time:** 30 minutes

---

### Priority 1: DISCOVER MODE - Day (Map View)

#### 1. List All Venues with Coordinates

**Endpoint:** `GET /api/public/Venues`

**Purpose:** Get all venues for map display

**Query Parameters:**
- `type` (optional): Filter by venue type (BEACH, POOL, BAR, RESTAURANT)
- `isActive` (optional): Filter by active status (default: true)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Folie Beach Club",
    "type": "BEACH",
    "description": "Premium beach club with restaurant and bar",
    "address": "Dhërmi Beach, Albania",
    "imageUrl": "https://...",
    "latitude": 40.1234,
    "longitude": 19.5678,
    "isActive": true,
    "allowsDigitalOrdering": true,
    "hasAvailability": true,
    "availableUnitsCount": 15
  },
  {
    "id": 2,
    "name": "Coral Beach",
    "type": "BEACH",
    "description": "Family-friendly beach with sunbeds",
    "address": "Jale Beach, Albania",
    "imageUrl": "https://...",
    "latitude": 40.2345,
    "longitude": 19.6789,
    "isActive": true,
    "allowsDigitalOrdering": false,
    "hasAvailability": true,
    "availableUnitsCount": 8
  }
]
```

**Implementation Notes:**
- Include only venues with `IsActive = true` by default
- Calculate `availableUnitsCount` by counting units with `Status = 'Available'`
- Set `hasAvailability = true` if `availableUnitsCount > 0`
- Include `Latitude` and `Longitude` from Venues table
- Order by `Name` ascending

**SQL Query Example:**
```sql
SELECT 
    v.Id,
    v.Name,
    v.Type,
    v.Description,
    v.Address,
    v.ImageUrl,
    v.Latitude,
    v.Longitude,
    v.IsActive,
    v.AllowsDigitalOrdering,
    COUNT(CASE WHEN u.Status = 'Available' THEN 1 END) as AvailableUnitsCount,
    CASE WHEN COUNT(CASE WHEN u.Status = 'Available' THEN 1 END) > 0 THEN 1 ELSE 0 END as HasAvailability
FROM Venues v
LEFT JOIN VenueZones z ON z.VenueId = v.Id
LEFT JOIN ZoneUnits u ON u.VenueZoneId = z.Id
WHERE v.IsActive = 1
GROUP BY v.Id, v.Name, v.Type, v.Description, v.Address, v.ImageUrl, v.Latitude, v.Longitude, v.IsActive, v.AllowsDigitalOrdering
ORDER BY v.Name
```

**Estimated Time:** 1-2 hours

---

#### 2. Get Venue Availability Details

**Endpoint:** `GET /api/public/Venues/{id}/availability`

**Purpose:** Get real-time availability for a specific venue (for bottom sheet)

**Response:**
```json
{
  "venueId": 1,
  "venueName": "Folie Beach Club",
  "totalUnits": 50,
  "availableUnits": 15,
  "reservedUnits": 10,
  "occupiedUnits": 25,
  "zones": [
    {
      "id": 1,
      "name": "VIP Section",
      "zoneType": "sunbed",
      "totalUnits": 20,
      "availableUnits": 5,
      "basePrice": 100.00
    },
    {
      "id": 2,
      "name": "Regular Area",
      "zoneType": "sunbed",
      "totalUnits": 30,
      "availableUnits": 10,
      "basePrice": 50.00
    }
  ]
}
```

**Implementation Notes:**
- Count units by status for each zone
- Include zone details for users to see pricing
- Only include active zones (`IsActive = true`)

**Estimated Time:** 1 hour

---

### Priority 4: SPOT MODE - Experience Deck (Post-Order Content)

#### 6. Get Curated Content

**Endpoint:** `GET /api/public/Content`

**Purpose:** Get curated content to show while order is being prepared

**Query Parameters:**
- `venueId` (optional): Get venue-specific content
- `type` (optional): Filter by content type (ARTICLE, TIP, PHOTO, VIDEO)
- `limit` (optional): Number of items (default: 10)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Best Beaches in Albanian Riviera",
    "description": "Discover the hidden gems of the Albanian coast",
    "contentType": "ARTICLE",
    "imageUrl": "https://...",
    "contentUrl": "https://...",
    "author": "Riviera Guide",
    "publishedAt": "2026-02-20T10:00:00Z",
    "readTimeMinutes": 5
  },
  {
    "id": 2,
    "title": "Sunset at Drymades",
    "description": "Stunning sunset photography",
    "contentType": "PHOTO",
    "imageUrl": "https://...",
    "author": "Local Photographer",
    "publishedAt": "2026-02-24T18:30:00Z"
  }
]
```

**Database Schema Needed:**

```sql
CREATE TABLE Content (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    ContentType NVARCHAR(50) NOT NULL, -- ARTICLE, TIP, PHOTO, VIDEO
    ImageUrl NVARCHAR(500),
    ContentUrl NVARCHAR(500),
    Author NVARCHAR(100),
    VenueId INT, -- NULL for general content
    PublishedAt DATETIME NOT NULL,
    ReadTimeMinutes INT,
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (VenueId) REFERENCES Venues(Id)
);
```

**Implementation Notes:**
- Return only active content (`IsActive = true`)
- Order by `SortOrder ASC, PublishedAt DESC`
- If `venueId` provided, prioritize venue-specific content
- Can be manually curated by business admins

**Estimated Time:** 2-3 hours (includes database schema creation)

---

#### 7. Create Content (SuperAdmin)

**Endpoint:** `POST /api/superadmin/Content`

**Purpose:** Allow SuperAdmin to create new curated content

**Authorization:** Requires `SuperAdmin` role

**Request Body:**
```json
{
  "title": "Best Beaches in Albanian Riviera",
  "description": "Discover the hidden gems of the Albanian coast",
  "contentType": "ARTICLE",
  "imageUrl": "https://...",
  "contentUrl": "https://...",
  "author": "Riviera Guide",
  "venueId": null,
  "publishedAt": "2026-02-20T10:00:00Z",
  "readTimeMinutes": 5,
  "isActive": true,
  "sortOrder": 0
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Best Beaches in Albanian Riviera",
  "description": "Discover the hidden gems of the Albanian coast",
  "contentType": "ARTICLE",
  "imageUrl": "https://...",
  "contentUrl": "https://...",
  "author": "Riviera Guide",
  "venueId": null,
  "publishedAt": "2026-02-20T10:00:00Z",
  "readTimeMinutes": 5,
  "isActive": true,
  "sortOrder": 0,
  "createdAt": "2026-02-26T10:00:00Z"
}
```

**Estimated Time:** 30 minutes

---

#### 8. Update Content (SuperAdmin)

**Endpoint:** `PUT /api/superadmin/Content/{id}`

**Purpose:** Allow SuperAdmin to update existing content

**Authorization:** Requires `SuperAdmin` role

**Request Body:** Same as create

**Response:** Same as create

**Estimated Time:** 20 minutes

---

#### 9. Delete Content (SuperAdmin)

**Endpoint:** `DELETE /api/superadmin/Content/{id}`

**Purpose:** Allow SuperAdmin to delete content

**Authorization:** Requires `SuperAdmin` role

**Response:**
```json
{
  "success": true,
  "message": "Content deleted successfully"
}
```

**Estimated Time:** 10 minutes

---

#### 10. List All Content (SuperAdmin)

**Endpoint:** `GET /api/superadmin/Content`

**Purpose:** Allow SuperAdmin to view all content (including inactive)

**Authorization:** Requires `SuperAdmin` role

**Query Parameters:**
- `isActive` (optional): Filter by active status
- `contentType` (optional): Filter by type
- `venueId` (optional): Filter by venue

**Response:** Same as public endpoint but includes inactive content

**Estimated Time:** 20 minutes

---

## 📊 SUMMARY TABLE

| Priority | Endpoint | Method | Purpose | Estimated Time | Database Changes |
|----------|----------|--------|---------|----------------|------------------|
| ✅ Existing | `/api/public/Venues/{id}` | GET | Get venue details | 0 | None |
| ✅ Existing | `/api/public/Orders/menu` | GET | Get menu | 0 | None |
| ✅ Existing | `/api/public/Orders` | POST | Place order | 0 | None |
| ✅ Existing | `/api/public/Reservations` | POST | Create reservation | 0 | None |
| ✅ Existing | `/api/public/Events` | GET | List events | 0 | None |
| ✅ Existing | `/api/public/Events/venue/{id}` | GET | Venue events | 0 | None |
| ✅ Existing | `/api/public/venues/{id}/reviews` | POST | Submit review | 0 | None |
| ✅ Existing | `/api/collector/units/{id}/status` | PUT | Update unit status | 0 | None |
| � CRITICAL | `/api/public/Feedback` | POST | Save negative feedback | 2 hours | New table |
| � CRITICAL | `/api/business/zones/{id}/availability` | PUT | Manual zone override | 2-3 hours | Add columns |
| 🔴 Priority 1 | `/api/public/Venues` | GET | List all venues | 1-2 hours | None |
| 🔴 Priority 1 | `/api/public/Venues/{id}/availability` | GET | Get availability | 1 hour | None |
| 🟢 Priority 4 | `/api/public/Content` | GET | Curated content | 2-3 hours | New table |

**Total New Work Needed:** 8-11 hours

**GOOD NEWS:** Events APIs already exist! No need to build them!

---

## 🎯 IMPLEMENTATION PHASES

### Phase 0: CRITICAL FIXES (Do First!)
**Backend:** Endpoints #0A and #0B (4-5 hours)
**Why:** These fix critical business logic gaps
**Frontend:** Can implement review shield and zone override UI

### Phase 1: SPOT MODE (Frontend can start immediately!)
**Backend:** No new APIs needed - all exist!
**Frontend:** 2-3 days
**What works:** Menu, ordering, events, reviews - everything!

### Phase 2: DISCOVER MODE - Day (Map)
**Backend:** Endpoints #1 and #2 (2-3 hours)
**Frontend:** 5-7 days (waiting for backend)

### Phase 3: Experience Deck
**Backend:** Endpoint #6 (2-3 hours)
**Frontend:** 2-3 days (waiting for backend)

---

## 🗄️ NEW DATABASE TABLES NEEDED

### 1. Events Table
```sql
CREATE TABLE Events (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    VenueId INT NOT NULL,
    EventDate DATE NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME,
    PosterImageUrl NVARCHAR(500),
    EventType NVARCHAR(50),
    MinTablePrice DECIMAL(10,2),
    Currency NVARCHAR(3) DEFAULT 'EUR',
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (VenueId) REFERENCES Venues(Id)
);
```

### 2. EventTables Table
```sql
CREATE TABLE EventTables (
    Id INT PRIMARY KEY IDENTITY(1,1),
    EventId INT NOT NULL,
    TableNumber NVARCHAR(50) NOT NULL,
    Capacity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Available',
    FOREIGN KEY (EventId) REFERENCES Events(Id)
);
```

### 3. EventBookings Table
```sql
CREATE TABLE EventBookings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    BookingCode NVARCHAR(50) UNIQUE NOT NULL,
    EventId INT NOT NULL,
    TableId INT NOT NULL,
    GuestName NVARCHAR(200) NOT NULL,
    GuestPhone NVARCHAR(50) NOT NULL,
    GuestEmail NVARCHAR(200),
    GuestCount INT NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    Currency NVARCHAR(3) DEFAULT 'EUR',
    Notes NVARCHAR(500),
    Status NVARCHAR(50) DEFAULT 'Confirmed',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (EventId) REFERENCES Events(Id),
    FOREIGN KEY (TableId) REFERENCES EventTables(Id)
);
```

### 4. Content Table
```sql
CREATE TABLE Content (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    ContentType NVARCHAR(50) NOT NULL,
    ImageUrl NVARCHAR(500),
    ContentUrl NVARCHAR(500),
    Author NVARCHAR(100),
    VenueId INT,
    PublishedAt DATETIME NOT NULL,
    ReadTimeMinutes INT,
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (VenueId) REFERENCES Venues(Id)
);
```

---

## 🚀 RECOMMENDED IMPLEMENTATION ORDER

### Week 1: DISCOVER MODE - Day (Map)
1. Create endpoint #1: `GET /api/public/Venues` (1-2 hours)
2. Create endpoint #2: `GET /api/public/Venues/{id}/availability` (1 hour)
3. Test with Postman/Swagger
4. Deploy to Azure

**Frontend can start building map interface once these are ready.**

### Week 2: DISCOVER MODE - Night (Events)
1. Create database tables: Events, EventTables, EventBookings (1 hour)
2. Create endpoint #3: `GET /api/public/Events` (2-3 hours)
3. Create endpoint #4: `POST /api/public/Events/{id}/book` (2-3 hours)
4. Create endpoint #5: `GET /api/public/Venues/{id}/events` (30 min)
5. Test with Postman/Swagger
6. Deploy to Azure

**Frontend can start building nightlife feed once these are ready.**

### Week 3: Experience Deck (Optional)
1. Create database table: Content (30 min)
2. Create endpoint #6: `GET /api/public/Content` (2-3 hours)
3. Manually add some sample content via SQL
4. Test with Postman/Swagger
5. Deploy to Azure

**Frontend can start building experience deck once this is ready.**

---

## 📝 NOTES FOR PROF KRISTI

### Existing Tables to Use:
- `Venues` - Already has Latitude, Longitude, Type, etc.
- `VenueZones` - For availability calculations
- `ZoneUnits` - For availability calculations

### CORS Configuration:
All new endpoints must allow CORS from:
- `https://riviera-os.vercel.app`
- `http://localhost:5173` (for development)

### Authentication:
All endpoints are **public** (no authentication required) - they use `/api/public/` prefix

### Response Format:
- Use consistent JSON format
- Include proper HTTP status codes (200, 400, 404, 500)
- Return meaningful error messages

### Testing:
- Test each endpoint with Postman before deploying
- Provide sample requests/responses in Swagger
- Verify CORS headers are set correctly

---

## 🎯 FRONTEND DEPENDENCIES

| Frontend Phase | Backend Dependency | Can Start? |
|----------------|-------------------|------------|
| Phase 1: SPOT MODE | None (existing APIs) | ✅ YES - Start now |
| Phase 2: DISCOVER Day | Endpoints #1, #2 | ⏳ Wait for backend |
| Phase 3: DISCOVER Night | Endpoints #3, #4, #5 | ⏳ Wait for backend |
| Phase 4: Experience Deck | Endpoint #6 | ⏳ Wait for backend |

**Frontend will start Phase 1 immediately while backend builds Phase 2 APIs.**

---

## 📞 QUESTIONS FOR PROF KRISTI

1. **Timeline:** Can you complete Phase 2 (endpoints #1, #2) this week?
2. **Database:** Do you need help with SQL schema creation?
3. **Events:** Should events be managed via Business Admin dashboard or manually via SQL?
4. **Content:** Should content be managed via dashboard or manually?
5. **Deployment:** Will you deploy to Azure Container Apps as usual?

---

**Created:** February 25, 2026  
**Status:** Ready for implementation  
**Next Step:** Prof Kristi reviews and confirms timeline


---

## 🤖 IMPLEMENTATION GUIDANCE FOR CLAUDE

Hi Claude! If you're reading this, here's what Prof Kristi needs you to help with:

### Context
- This is a .NET Core Web API project (C#)
- Database: SQL Server
- Architecture: Clean Architecture with DTOs
- Already has: Venues, Zones, Orders, Events, Reviews (all working)
- Need to add: 2 critical features + 2 map features + 1 optional feature

### Your Task
Help Prof Kristi implement these 5 new endpoints in order of priority:

**Priority 1 (Critical - Do First):**
1. `POST /api/public/Feedback` - Save negative feedback
2. `PUT /api/business/zones/{id}/availability` - Manual zone override

**Priority 2 (Map Features):**
3. `GET /api/public/Venues` - List all venues for map
4. `GET /api/public/Venues/{id}/availability` - Get availability

**Priority 3 (Optional):**
5. `GET /api/public/Content` - Curated content (can skip for MVP)

### What You Need to Do
1. **Read the endpoint specs above** - They have complete request/response examples
2. **Create database migrations** - SQL scripts are provided
3. **Create DTOs** - Follow existing naming pattern (e.g., `BizZoneListItemDto`)
4. **Create controllers** - Follow existing pattern (e.g., `ZonesController`)
5. **Add authorization** - Public endpoints = no auth, Business endpoints = require JWT
6. **Test with Swagger** - Verify endpoints work before deploying

### Existing Code Patterns to Follow

**Controller Pattern:**
```csharp
[ApiController]
[Route("api/business/zones")]
[Authorize(Roles = "BusinessAdmin,Staff")]
public class ZonesController : ControllerBase
{
    // Follow this pattern for new endpoints
}
```

**DTO Pattern:**
```csharp
public class BizZoneListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string ZoneType { get; set; }
    public int CapacityPerUnit { get; set; }
    public decimal BasePrice { get; set; }
    public bool IsActive { get; set; }
}
```

**Service Pattern:**
```csharp
public interface IZoneService
{
    Task<List<BizZoneListItemDto>> GetZonesAsync(int venueId);
    Task<BizZoneDetailDto> GetZoneByIdAsync(int venueId, int id);
    // Add new methods here
}
```

### Database Migration Pattern
```csharp
public partial class AddZoneOverrideFields : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "IsManualOverride",
            table: "VenueZones",
            nullable: false,
            defaultValue: false);
            
        // Add other columns...
    }
    
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "IsManualOverride", table: "VenueZones");
        // Drop other columns...
    }
}
```

### Testing Checklist
- [ ] Endpoint appears in Swagger UI
- [ ] Request validation works (try invalid data)
- [ ] Response matches DTO schema
- [ ] Authorization works (public vs business endpoints)
- [ ] Database changes applied correctly
- [ ] No breaking changes to existing endpoints

### Deployment
1. Run migrations on Azure SQL Database
2. Deploy to Azure Container Apps
3. Update Swagger JSON
4. Test with Postman
5. Notify Aldi that APIs are ready

### Questions?
If anything is unclear, ask Prof Kristi to clarify with Aldi. The frontend team is ready to consume these APIs as soon as they're deployed.

---

**Created:** February 26, 2026  
**Status:** Ready for implementation  
**Estimated Time:** 8-11 hours total  
**Priority:** HIGH - Frontend is waiting for these APIs

Good luck! 🚀
