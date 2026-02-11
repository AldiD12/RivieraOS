# Restaurant Table Reservation Request - Backend Requirements

**Date:** February 11, 2026  
**Priority:** � LOW (Simple Notification System)  
**Assigned To:** Prof Kristi  
**Feature:** Table reservation requests sent to manager

---

## Feature Overview

**Use Case:** Guest at beach/pool wants to request a table at the restaurant. Manager receives notification and handles it manually.

**User Flow:**
1. Guest scans QR code at beach sunbed (Venue Type: BEACH)
2. Sees menu + "Reserve Table" button
3. Clicks "Reserve Table"
4. Fills simple form (name, phone, time, party size, notes)
5. Submits request
6. Manager receives notification in dashboard
7. Manager contacts guest to confirm

---

## Current Status

### ✅ Already Implemented:
- Venue types (BEACH, POOL, RESTAURANT)
- Manager dashboard
- Notification system (can be extended)

### ❌ Missing:
- Table reservation request endpoint
- Manager view for reservation requests

---

## Backend Requirements (SIMPLE VERSION)

### 1. Database Schema

#### New Table: `TableReservationRequests`

```sql
CREATE TABLE TableReservationRequests (
    Id INT PRIMARY KEY IDENTITY(1,1),
    
    -- Business & Venue
    BusinessId INT NOT NULL,
    VenueId INT,                             -- Optional: which venue guest is at
    
    -- Guest Information
    GuestName NVARCHAR(100) NOT NULL,
    GuestPhone NVARCHAR(20) NOT NULL,
    PartySize INT NOT NULL,
    PreferredTime NVARCHAR(50),              -- Free text: "1pm", "around 7pm", etc.
    SpecialRequests NVARCHAR(500),           -- Any notes from guest
    
    -- Status
    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',  -- Pending, Contacted, Confirmed, Declined
    
    -- Metadata
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    HandledAt DATETIME2,
    HandledByUserId INT,                     -- Manager who handled it
    
    -- Foreign Keys
    FOREIGN KEY (BusinessId) REFERENCES Businesses(Id),
    FOREIGN KEY (VenueId) REFERENCES Venues(Id),
    FOREIGN KEY (HandledByUserId) REFERENCES Users(Id)
);

-- Index
CREATE INDEX IX_TableReservationRequests_BusinessId_Status ON TableReservationRequests(BusinessId, Status);
```

---

### 2. API Endpoints

#### Public Endpoint (No Auth Required)

**POST /api/public/TableRequests**
- Submit a table reservation request
- Body:

```json
{
  "businessId": 1,
  "venueId": 3,
  "guestName": "John Smith",
  "guestPhone": "+1234567890",
  "partySize": 4,
  "preferredTime": "around 1pm",
  "specialRequests": "Window seat if possible"
}
```

- Returns: Simple confirmation

```json
{
  "success": true,
  "message": "Your table request has been sent to the manager. They will contact you shortly.",
  "requestId": 123
}
```

---

#### Business/Manager Endpoints (Auth Required)

**GET /api/business/table-requests**
- Get all table requests for the business
- Query params: `status` (optional: Pending, Contacted, Confirmed, Declined)
- Auth: Manager
- Returns:

```json
[
  {
    "id": 123,
    "guestName": "John Smith",
    "guestPhone": "+1234567890",
    "partySize": 4,
    "preferredTime": "around 1pm",
    "specialRequests": "Window seat if possible",
    "status": "Pending",
    "createdAt": "2026-02-11T14:30:00Z",
    "venueName": "Main Beach"
  }
]
```

**PUT /api/business/table-requests/{id}/status**
- Update request status
- Body:

```json
{
  "status": "Contacted"  // or "Confirmed", "Declined"
}
```

**GET /api/business/table-requests/pending**
- Quick endpoint to get pending requests count
- Returns: `{ "count": 5 }`

---

### 3. Business Logic

#### Validation Rules
- Guest name required
- Phone number required (basic format validation)
- Party size must be > 0
- Business must exist

#### Status Flow
```
Pending → Contacted → Confirmed
         ↓
      Declined
```

#### Notifications (Optional - Phase 2)
- Real-time notification to manager dashboard via SignalR
- Badge count on manager dashboard showing pending requests

---

## Implementation Priority

### Phase 1 (MVP - Simple):
1. ✅ Create `TableReservationRequests` table
2. ✅ Public endpoint: Submit request
3. ✅ Manager endpoint: View requests
4. ✅ Manager endpoint: Update status

### Phase 2 (Enhancement):
1. ⏳ Real-time SignalR notifications to manager
2. ⏳ SMS/Email notification to manager
3. ⏳ Guest can check request status

---

## Testing Checklist

### Database:
- [ ] Create TableReservationRequests table
- [ ] Test foreign key constraints

### API Endpoints:
- [ ] POST /api/public/TableRequests creates request successfully
- [ ] GET /api/business/table-requests returns all requests
- [ ] PUT /api/business/table-requests/{id}/status updates status
- [ ] Validation: Required fields enforced

### Manager Dashboard:
- [ ] Manager can see pending requests
- [ ] Manager can mark as Contacted/Confirmed/Declined
- [ ] Badge shows count of pending requests

---

## Frontend Integration (After Backend Ready)

Once backend is deployed, frontend will:
1. Add "Reserve Table" button on Beach/Pool QR pages (BEACH/POOL venues only)
2. Show simple modal with form:
   - Name (text)
   - Phone (text)
   - Party size (number)
   - Preferred time (text: "around 1pm")
   - Special requests (textarea)
3. Submit to backend
4. Show success message: "Request sent! Manager will contact you shortly."
5. Add "Table Requests" section to Manager dashboard
6. Show list of pending requests with action buttons

---

## Questions?

- **Should manager get real-time notification?** (Recommended: Yes, via SignalR)
- **Should guest get confirmation SMS?** (Recommended: Phase 2)
- **Max party size limit?** (Recommended: 20 guests)

---

**Status:** 📋 REQUIREMENTS DEFINED - SIMPLE VERSION

This is much simpler than a full reservation system - just a request/notification flow!
