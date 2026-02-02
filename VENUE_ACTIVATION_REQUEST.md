# Backend Request: Add Venue Activation Support

## Issue
Venues cannot be activated/deactivated through the API. The `UpdateVenueRequest` schema doesn't include an `isActive` field, and there's no dedicated activation endpoint like staff members have.

## Current Situation
- ✅ Staff have activation: `POST /api/superadmin/businesses/{businessId}/Users/{id}/activate`
- ❌ Venues have NO activation support
- ❌ `UpdateVenueRequest` schema missing `isActive` field

## Required Backend Changes

### Option 1: Add Activation Endpoint (Recommended)
Add a dedicated venue activation endpoint similar to staff:

```
POST /api/superadmin/businesses/{businessId}/Venues/{id}/activate
```

**Request Body:** None (toggles current status)
**Response:** 200 OK
**Behavior:** Toggles venue `isActive` status (true ↔ false)

### Option 2: Add isActive to UpdateVenueRequest
Modify the `UpdateVenueRequest` schema to include:

```json
{
  "name": "string",
  "type": "string",
  "description": "string", 
  "address": "string",
  "imageUrl": "string",
  "latitude": 0,
  "longitude": 0,
  "isActive": true  // ← ADD THIS FIELD
}
```

## Database Schema
Ensure the `venues` table has an `isActive` column:
```sql
ALTER TABLE venues ADD COLUMN isActive BOOLEAN DEFAULT true;
```

## Frontend Impact
Once implemented, the frontend will:
- Show green "Activate" / yellow "Deactivate" buttons
- Allow instant venue status toggle
- Update venue list in real-time

## Priority
**HIGH** - This is basic CRUD functionality that users expect for venue management.

## Testing
After implementation, test:
1. Create venue (should be active by default)
2. Deactivate venue via API call
3. Verify venue shows as inactive in GET requests
4. Reactivate venue
5. Verify venue shows as active again

## API Endpoints to Implement

### Recommended: Activation Endpoint
```
POST /api/superadmin/businesses/{businessId}/Venues/{venueId}/activate
Authorization: Bearer {jwt_token}
Content-Type: application/json

Response: 200 OK
{
  "success": true,
  "message": "Venue activation toggled successfully",
  "isActive": true
}
```

### Alternative: Update Schema
Modify existing `PUT /api/superadmin/businesses/{businessId}/Venues/{id}` to accept `isActive` field.

---

**Contact:** Frontend team ready to implement once backend support is added.
**Timeline:** Please prioritize - this blocks venue management functionality.