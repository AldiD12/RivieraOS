# Backend Swagger Deep Analysis - Context-Aware Routing Features

**Date:** February 26, 2026  
**Analysis:** Complete audit of existing backend structure  
**Purpose:** Determine what exists vs what needs to be built

---

## 🔍 CURRENT ZONE STRUCTURE (From Swagger)

### BizZoneListItemDto (What Business Admin sees)
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

### ❌ MISSING FIELDS FOR MANUAL OVERRIDE
The zone schema does NOT have:
- `isManualOverride` (boolean)
- `overrideReason` (string)
- `overrideUntil` (datetime)
- `overrideBy` (userId)

**Conclusion:** Manual zone override feature does NOT exist in backend yet.

---

## 🔍 EXISTING ENDPOINTS AUDIT

### ✅ What EXISTS:

#### Zones Management
- `GET /api/business/venues/{venueId}/Zones` - List zones
- `POST /api/business/venues/{venueId}/Zones` - Create zone
- `GET /api/business/venues/{venueId}/Zones/{id}` - Get zone details
- `PUT /api/business/venues/{venueId}/Zones/{id}` - Update zone
- `DELETE /api/business/venues/{venueId}/Zones/{id}` - Delete zone
- `POST /api/business/venues/{venueId}/Zones/{id}/toggle-active` - Toggle active status

#### Reviews
- `GET /api/business/venues/{venueId}/reviews` - Get reviews
- `GET /api/business/venues/{venueId}/reviews/stats` - Get review stats
- `POST /api/public/venues/{venueId}/reviews` - Submit review (public)

#### Events
- `GET /api/business/Events` - List events
- `POST /api/business/Events` - Create event
- `GET /api/business/Events/{id}` - Get event details
- `PUT /api/business/Events/{id}` - Update event
- `DELETE /api/business/Events/{id}` - Delete event
- `POST /api/business/Events/{id}/publish` - Publish event
- `POST /api/business/Events/{id}/unpublish` - Unpublish event

#### Venues
- `GET /api/business/Venues` - List venues
- `POST /api/business/Venues` - Create venue
- `GET /api/business/Venues/{id}` - Get venue details
- `PUT /api/business/Venues/{id}` - Update venue
- `DELETE /api/business/Venues/{id}` - Delete venue
- `POST /api/business/Venues/{id}/toggle-active` - Toggle active

### ❌ What DOES NOT EXIST:

1. **Negative Feedback Tracking**
   - No `POST /api/public/Feedback` endpoint
   - No `GET /api/business/feedback` endpoint
   - No feedback table in database

2. **Manual Zone Override**
   - No `PUT /api/business/zones/{id}/availability` endpoint
   - No override fields in zone schema
   - No way to manually mark zones as FULL

3. **Content Management (Experience Deck)**
   - No `/api/superadmin/content` endpoints
   - No content table in database
   - No way to manage curated content

4. **Public Venues List (for map)**
   - No `GET /api/public/Venues` endpoint
   - No way for public to see all venues

5. **Venue Availability (for map)**
   - No `GET /api/public/Venues/{id}/availability` endpoint
   - No real-time availability for public

---

## 📊 WHAT NEEDS TO BE BUILT

### Priority 1: Critical Business Logic Gaps

#### 1. Negative Feedback Tracking
**Why:** No proof of intercepted bad reviews  
**Backend Work:**
- Create `NegativeFeedback` table
- Create `POST /api/public/Feedback` endpoint
- Create `GET /api/business/feedback` endpoint (for viewing)

**Database Schema:**
```sql
CREATE TABLE NegativeFeedback (
    Id INT PRIMARY KEY IDENTITY(1,1),
    VenueId INT NOT NULL,
    Rating INT NOT NULL,
    Comment NVARCHAR(1000),
    UnitCode NVARCHAR(50),
    GuestName NVARCHAR(200),
    GuestPhone NVARCHAR(50),
    SubmittedAt DATETIME NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Intercepted',
    FOREIGN KEY (VenueId) REFERENCES Venues(Id)
);
```

#### 2. Manual Zone Override
**Why:** Automatic counting inaccurate (cash payments, walk-ins)  
**Backend Work:**
- Add columns to `VenueZones` table
- Create `PUT /api/business/zones/{id}/availability` endpoint

**Database Migration:**
```sql
ALTER TABLE VenueZones ADD IsManualOverride BIT DEFAULT 0;
ALTER TABLE VenueZones ADD OverrideReason NVARCHAR(500);
ALTER TABLE VenueZones ADD OverrideUntil DATETIME;
ALTER TABLE VenueZones ADD OverrideBy INT;
```

### Priority 2: Context-Aware Routing (Map)

#### 3. Public Venues List
**Why:** Show all venues on map  
**Backend Work:**
- Create `GET /api/public/Venues` endpoint
- Return venues with lat/long and availability count

#### 4. Venue Availability
**Why:** Real-time availability for bottom sheet  
**Backend Work:**
- Create `GET /api/public/Venues/{id}/availability` endpoint
- Return zone-by-zone availability

### Priority 3: Experience Deck (Optional)

#### 5. Content Management
**Why:** Show content while order is being prepared  
**Backend Work:**
- Create `Content` table
- Create CRUD endpoints for content management

---

## 🎯 WHAT CAN BE DONE NOW (Frontend Only)

### Phase 0: UI Controls with Mock Data

We can build the admin UI controls NOW using mock data:

1. **Zone Override Toggle** - Build UI, use mock API calls
2. **Feedback Viewer** - Build UI, use mock data
3. **Content Manager** - Build UI, use mock data

**Benefits:**
- Test UI flows immediately
- Prof Kristi knows exactly what UI expects
- No wasted backend work if UI needs change
- Faster iteration

**How:**
```javascript
// Mock API call (replace later with real endpoint)
const handleSaveOverride = async (zoneId) => {
  // TODO: Replace with real API when backend is ready
  console.log('Mock: Saving zone override', zoneId);
  alert('Override saved (mock)');
  
  // Real implementation will be:
  // await fetch(`${API_URL}/api/business/zones/${zoneId}/availability`, {
  //   method: 'PUT',
  //   body: JSON.stringify({ isAvailable: false, reason, overrideUntil })
  // });
};
```

---

## 📅 RECOMMENDED IMPLEMENTATION ORDER

### Week 1: Frontend UI (No Backend Needed)
**Days 1-3:** Build admin UI controls with mock data
- Zone override toggle
- Feedback viewer
- Content manager

**Benefit:** Can test and iterate on UI immediately

### Week 2: Backend APIs (Prof Kristi)
**Days 1-2:** Critical APIs (4-5 hours)
- Negative feedback tracking
- Manual zone override

**Days 3-4:** Map APIs (2-3 hours)
- Public venues list
- Venue availability

### Week 3: Connect & Polish
**Days 1-2:** Replace mock data with real APIs
**Days 3-5:** Test, fix bugs, deploy

---

## ✅ CONCLUSION

**What Exists:**
- ✅ 90% of APIs for ordering, events, reviews
- ✅ Zone management (but no manual override)
- ✅ Venue management (but no public list)

**What's Missing:**
- ❌ Negative feedback tracking (new table + 2 endpoints)
- ❌ Manual zone override (4 columns + 1 endpoint)
- ❌ Public venues list (1 endpoint)
- ❌ Venue availability (1 endpoint)
- ❌ Content management (new table + CRUD endpoints)

**Total New Backend Work:** 8-11 hours

**Smart Approach:**
1. Build UI first with mock data (2-3 days)
2. Prof Kristi builds APIs (8-11 hours)
3. Connect UI to real APIs (1 day)

This way we can test UI flows immediately and Prof Kristi knows exactly what to build.

---

**Created:** February 26, 2026  
**Status:** Complete analysis  
**Next Step:** Build admin UI controls with mock data
