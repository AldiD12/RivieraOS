# Backend Events System Requirements - March 5, 2026

## URGENT: Events System Backend Tasks for Prof. Kristi

**Status:** Frontend complete, backend needs fixes
**Priority:** HIGH - Events showing but missing critical fields
**Deployed API:** https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api

---

## Current Situation

### ✅ What's Working
- Events CRUD in Business Admin Dashboard
- Events CRUD in Super Admin Dashboard  
- Public Events API endpoint: `GET /api/public/Events`
- Events display on Discovery Page (Night Mode)
- WhatsApp booking flow for events
- Image upload to Azure Blob Storage
- VIP features (entry types, minimum spend, vibe tags)

### ❌ What's Broken
1. **Public API missing `isPublished` and `isDeleted` fields**
2. **Missing `businessName` in response** (shows "Black Bear" for all events)
3. **Missing venue details** (address, WhatsApp number)
4. **No vibe filtering** (vibe field not returned)
5. **No capacity tracking** (maxGuests, spotsRemaining always 0)

---

## TASK 1: Fix Public Events API Response ⚠️ CRITICAL

**Endpoint:** `GET /api/public/Events`

**Current Response (BROKEN):**
```json
[
  {
    "id": 1,
    "name": "summer party",
    "venueId": 16,
    "venueName": "Beach Bar",
    "venueAddress": "",
    "businessName": "Black Bear",
    "startTime": "2026-05-12T20:00:00",
    "endTime": "2026-05-13T08:00:00",
    "flyerImageUrl": "https://blackbearassets.blob.core.windows.net/images/5a5faf41-bf50-4384-8b18-9cbcfb813e61.jpg",
    "isTicketed": false,
    "ticketPrice": 0,
    "maxGuests": 0,
    "spotsRemaining": 0
  }
]
```

**Required Response (FIXED):**
```json
[
  {
    "id": 1,
    "name": "summer party",
    "description": "Epic summer beach party with international DJs",
    "venueId": 16,
    "venueName": "Beach Bar",
    "venueAddress": "Ksamil Beach, Albania",
    "venueWhatsappNumber": "355123456789",
    "businessId": 1,
    "businessName": "Beach Bar Business",
    "startTime": "2026-05-12T20:00:00",
    "endTime": "2026-05-13T08:00:00",
    "flyerImageUrl": "https://blackbearassets.blob.core.windows.net/images/5a5faf41-bf50-4384-8b18-9cbcfb813e61.jpg",
    "vibe": "Techno",
    "entryType": "Reservation",
    "isTicketed": false,
    "ticketPrice": 0,
    "minimumSpend": 200,
    "maxGuests": 500,
    "spotsRemaining": 450,
    "isPublished": true,
    "isDeleted": false
  }
]
```

### Required Changes:

1. **Add `isPublished` field** (boolean)
   - Filter: Only return events where `isPublished = true`
   - This is critical for frontend filtering

2. **Add `isDeleted` field** (boolean)
   - Filter: Only return events where `isDeleted = false`
   - Soft delete support

3. **Fix `businessName`** (string)
   - Currently shows "Black Bear" for all events
   - Should show the actual business name from the Business table
   - Join: `Events -> Venues -> Businesses`

4. **Add `venueAddress`** (string)
   - Currently empty string
   - Should show venue's full address
   - Join: `Events -> Venues`

5. **Add `venueWhatsappNumber`** (string)
   - NEW FIELD - critical for WhatsApp booking
   - Should show venue's WhatsApp number
   - Join: `Events -> Venues`

6. **Add `businessId`** (int)
   - NEW FIELD - useful for filtering
   - Join: `Events -> Venues -> Businesses`

7. **Add `description`** (string)
   - Event description text
   - Should be in Events table already

8. **Add `vibe`** (string)
   - Event vibe/genre (House, Techno, Commercial, Live Music, Hip Hop, Chill)
   - Should be in Events table already
   - Used for filtering in frontend

9. **Add `entryType`** (string)
   - Entry type (Free, Ticketed, Reservation)
   - Should be in Events table already

10. **Add `minimumSpend`** (decimal)
    - Minimum spend per table (for VIP/reservation events)
    - Should be in Events table already

11. **Fix `maxGuests`** (int)
    - Currently always 0
    - Should show event capacity

12. **Fix `spotsRemaining`** (int)
    - Currently always 0
    - Should calculate: `maxGuests - bookedGuests`

---

## TASK 2: Add Event Booking Tracking (Optional - Phase 2)

**Purpose:** Track event reservations/bookings

**New Table:** `EventBookings`
```sql
CREATE TABLE EventBookings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    EventId INT NOT NULL,
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerPhone NVARCHAR(20) NOT NULL,
    NumberOfGuests INT NOT NULL,
    BookingDate DATETIME NOT NULL DEFAULT GETDATE(),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending', -- Pending, Confirmed, Cancelled
    Notes NVARCHAR(500),
    FOREIGN KEY (EventId) REFERENCES Events(Id)
)
```

**New Endpoints:**
```
POST /api/public/Events/{eventId}/book
GET /api/business/Events/{eventId}/bookings
GET /api/superadmin/Events/{eventId}/bookings
```

**Note:** This is optional for now. WhatsApp booking works without database tracking.

---

## TASK 3: Ensure Events Table Has All Required Fields

**Events Table Schema (Required):**
```sql
CREATE TABLE Events (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    VenueId INT NOT NULL,
    StartTime DATETIME NOT NULL,
    EndTime DATETIME NOT NULL,
    FlyerImageUrl NVARCHAR(500),
    Vibe NVARCHAR(50), -- House, Techno, Commercial, Live Music, Hip Hop, Chill
    EntryType NVARCHAR(20), -- Free, Ticketed, Reservation
    IsTicketed BIT NOT NULL DEFAULT 0,
    TicketPrice DECIMAL(10,2) DEFAULT 0,
    MinimumSpend DECIMAL(10,2) DEFAULT 0,
    MaxGuests INT DEFAULT 0,
    IsPublished BIT NOT NULL DEFAULT 0,
    IsDeleted BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (VenueId) REFERENCES Venues(Id)
)
```

**Check if these fields exist:**
- `Description` (NVARCHAR)
- `Vibe` (NVARCHAR)
- `EntryType` (NVARCHAR)
- `MinimumSpend` (DECIMAL)
- `IsPublished` (BIT)
- `IsDeleted` (BIT)

**If missing, add them:**
```sql
ALTER TABLE Events ADD Description NVARCHAR(1000);
ALTER TABLE Events ADD Vibe NVARCHAR(50);
ALTER TABLE Events ADD EntryType NVARCHAR(20);
ALTER TABLE Events ADD MinimumSpend DECIMAL(10,2) DEFAULT 0;
ALTER TABLE Events ADD IsPublished BIT NOT NULL DEFAULT 0;
ALTER TABLE Events ADD IsDeleted BIT NOT NULL DEFAULT 0;
```

---

## TASK 4: Ensure Venues Table Has WhatsApp Number

**Venues Table (Required Field):**
```sql
ALTER TABLE Venues ADD WhatsappNumber NVARCHAR(20);
```

**Update existing venues:**
```sql
UPDATE Venues SET WhatsappNumber = '355123456789' WHERE Id = 16; -- Beach Bar
-- Add WhatsApp numbers for all venues
```

---

## TASK 5: Update Business/SuperAdmin Events Endpoints

**Endpoints to Update:**

### Business Admin
```
GET /api/business/Events
POST /api/business/Events
PUT /api/business/Events/{id}
DELETE /api/business/Events/{id}
POST /api/business/Events/{id}/publish
POST /api/business/Events/{id}/unpublish
```

**Required Changes:**
- Ensure all fields are saved (vibe, entryType, minimumSpend, description)
- `POST /publish` should set `isPublished = true`
- `POST /unpublish` should set `isPublished = false`
- `DELETE` should set `isDeleted = true` (soft delete)

### Super Admin
```
GET /api/superadmin/Events
POST /api/superadmin/Events
PUT /api/superadmin/Events/{id}
DELETE /api/superadmin/Events/{id}
POST /api/superadmin/Events/{id}/publish
POST /api/superadmin/Events/{id}/unpublish
POST /api/superadmin/Events/{id}/restore
```

**Required Changes:**
- Same as Business Admin
- `POST /restore` should set `isDeleted = false`

---

## Testing Checklist

### Test 1: Public Events API
```bash
curl https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Events
```

**Expected:**
- Only published events (`isPublished = true`)
- Only non-deleted events (`isDeleted = false`)
- All fields present (businessName, venueAddress, venueWhatsappNumber, vibe, etc.)
- Correct businessName (not "Black Bear" for all)

### Test 2: Create Event with All Fields
```bash
POST /api/business/Events
{
  "name": "Techno Night",
  "description": "Underground techno party",
  "venueId": 16,
  "startTime": "2026-06-01T22:00:00",
  "endTime": "2026-06-02T06:00:00",
  "flyerImageUrl": "https://...",
  "vibe": "Techno",
  "entryType": "Reservation",
  "isTicketed": false,
  "minimumSpend": 300,
  "maxGuests": 200
}
```

**Expected:**
- Event created with all fields
- `isPublished = false` by default
- `isDeleted = false` by default

### Test 3: Publish Event
```bash
POST /api/business/Events/1/publish
```

**Expected:**
- `isPublished = true`
- Event now appears in public API

### Test 4: Unpublish Event
```bash
POST /api/business/Events/1/unpublish
```

**Expected:**
- `isPublished = false`
- Event no longer appears in public API

### Test 5: Delete Event
```bash
DELETE /api/business/Events/1
```

**Expected:**
- `isDeleted = true`
- Event no longer appears in public API
- Event still visible in Business/SuperAdmin dashboards

---

## Priority Order

1. **CRITICAL:** Fix Public Events API response (Task 1)
   - Add `isPublished`, `isDeleted` fields
   - Fix `businessName` join
   - Add `venueWhatsappNumber` join
   - Add all missing fields

2. **HIGH:** Ensure Events table has all fields (Task 3)
   - Add missing columns if needed

3. **HIGH:** Ensure Venues table has WhatsApp (Task 4)
   - Add WhatsappNumber column
   - Update existing venues

4. **MEDIUM:** Update Business/SuperAdmin endpoints (Task 5)
   - Ensure publish/unpublish works
   - Ensure soft delete works

5. **LOW:** Event booking tracking (Task 2)
   - Can be done later
   - WhatsApp works without it

---

## SQL Quick Reference

### Check if column exists:
```sql
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Events' 
AND COLUMN_NAME = 'IsPublished';
```

### Add column if missing:
```sql
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Events' AND COLUMN_NAME = 'IsPublished'
)
BEGIN
    ALTER TABLE Events ADD IsPublished BIT NOT NULL DEFAULT 0;
END
```

### Update existing events to published:
```sql
UPDATE Events SET IsPublished = 1 WHERE IsDeleted = 0 OR IsDeleted IS NULL;
```

---

## Frontend Integration Notes

**Frontend expects this exact structure:**
```typescript
interface Event {
  id: number;
  name: string;
  description?: string;
  venueId: number;
  venueName: string;
  venueAddress: string;
  venueWhatsappNumber: string; // CRITICAL for WhatsApp booking
  businessId: number;
  businessName: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  flyerImageUrl?: string;
  vibe?: string; // House, Techno, Commercial, Live Music, Hip Hop, Chill
  entryType?: string; // Free, Ticketed, Reservation
  isTicketed: boolean;
  ticketPrice: number;
  minimumSpend: number;
  maxGuests: number;
  spotsRemaining: number;
  isPublished: boolean;
  isDeleted: boolean;
}
```

**Frontend filtering logic:**
```javascript
// If isPublished/isDeleted fields don't exist, assume published
const isPublished = event.isPublished !== undefined ? event.isPublished : true;
const isDeleted = event.isDeleted !== undefined ? event.isDeleted : false;
return isPublished && !isDeleted;
```

**WhatsApp booking message:**
```
Hi! I'd like to book for {eventName} at {venueName} on {date}.

📅 Event: {eventName}
📍 Venue: {venueName}
🕐 Date & Time: {date} at {time}
💎 Minimum Spend: €{minimumSpend} per table

How many people: 
Preferred arrival time: 
```

---

## Questions for Kristi

1. Does the Events table have all required fields?
2. Does the Venues table have WhatsappNumber field?
3. Is the Public Events API doing proper joins for businessName and venueAddress?
4. Are publish/unpublish endpoints working correctly?
5. Should we implement event booking tracking now or later?

---

## Contact

**Frontend Developer:** Aldi
**Backend Developer:** Prof. Kristi
**Deployed Frontend:** https://riviera-os.vercel.app
**Deployed Backend:** https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api

---

**Last Updated:** March 5, 2026
**Status:** Waiting for backend implementation
