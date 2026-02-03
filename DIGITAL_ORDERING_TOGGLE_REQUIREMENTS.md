# Digital Ordering Toggle Feature - Backend Requirements

## Overview
Implement a venue-level toggle to enable/disable digital ordering functionality. This allows the same menu to be used for both digital ordering (beach venues) and catalog viewing (restaurant venues).

## Database Changes

### Venues Table
Add a new column to the `Venues` table:

```sql
ALTER TABLE Venues 
ADD COLUMN IsDigitalOrderingEnabled BIT NOT NULL DEFAULT 1;
```

**Column Details:**
- **Name**: `IsDigitalOrderingEnabled`
- **Type**: `BIT` (boolean)
- **Default**: `1` (true - enabled by default)
- **Description**: Controls whether customers can place digital orders or just view the menu

## API Response Updates

### GET /api/venues/{venueId}
Update the venue details endpoint to include the new flag:

```json
{
  "venueId": 1,
  "name": "Main Restaurant",
  "description": "Fine dining restaurant",
  "isDigitalOrderingEnabled": false,
  "address": "123 Beach Road",
  "phone": "+1234567890",
  "email": "info@venue.com",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### GET /api/venues/{venueId}/menu
Also include the flag when fetching menu data:

```json
{
  "venue": {
    "venueId": 1,
    "name": "Main Restaurant",
    "isDigitalOrderingEnabled": false
  },
  "categories": [
    {
      "id": 1,
      "name": "Cocktails",
      "products": [...]
    }
  ]
}
```

## Frontend Logic

### Conditional Rendering
Based on `isDigitalOrderingEnabled` value:

**If `true` (Digital Ordering Enabled):**
- Show "Add to Cart" buttons
- Show quantity controls (+/-)
- Show floating cart button
- Allow checkout process
- Enable order placement

**If `false` (View Only Mode):**
- Hide all ordering controls
- Show "View Only" indicator
- Display menu as catalog
- Show "Please order with your waiter" message
- No cart functionality

## Use Cases

### Beach Venue (Digital Ordering)
```json
{
  "venueId": 1,
  "name": "Beach Bar",
  "isDigitalOrderingEnabled": true
}
```
- Customers scan QR code
- View menu with "Add to Cart" buttons
- Place orders digitally
- Orders sent to kitchen/bar

### Restaurant Venue (Catalog Only)
```json
{
  "venueId": 2,
  "name": "Fine Dining Restaurant", 
  "isDigitalOrderingEnabled": false
}
```
- Customers scan QR code
- View menu in catalog mode
- No ordering buttons shown
- Must order through waiter

## SuperAdmin Management

### Venue Configuration
Add toggle in SuperAdmin dashboard:

```javascript
// In venue creation/edit form
{
  name: "Restaurant Name",
  description: "Venue description",
  isDigitalOrderingEnabled: true, // Toggle switch
  address: "123 Street",
  // ... other fields
}
```

## Implementation Steps

1. **Database Migration**
   - Add `IsDigitalOrderingEnabled` column to Venues table
   - Set default value to `true` for existing venues

2. **API Updates**
   - Update venue DTOs to include the new field
   - Modify venue endpoints to return the flag
   - Update menu endpoints to include venue info

3. **Frontend Updates**
   - Fetch venue details on menu page load
   - Conditionally render ordering controls
   - Add catalog mode styling
   - Update SuperAdmin venue forms

4. **Testing**
   - Test both enabled and disabled modes
   - Verify API responses include the flag
   - Test SuperAdmin toggle functionality

## Benefits

- **Unified Menu System**: Same menu data for all venue types
- **Flexible Ordering**: Toggle digital ordering per venue
- **Better UX**: Clear indication of ordering capabilities
- **Easy Management**: Simple toggle in SuperAdmin
- **Future-Proof**: Easy to extend with more venue types

## Example Scenarios

### Scenario 1: Beach Resort
- **Beach Bar**: `isDigitalOrderingEnabled: true` - Full digital ordering
- **Pool Restaurant**: `isDigitalOrderingEnabled: false` - Catalog only
- **Room Service**: `isDigitalOrderingEnabled: true` - Digital ordering

### Scenario 2: Hotel Complex  
- **Lobby Bar**: `isDigitalOrderingEnabled: true` - Quick digital orders
- **Fine Dining**: `isDigitalOrderingEnabled: false` - Waiter service only
- **Cafe**: `isDigitalOrderingEnabled: true` - Self-service ordering

This feature provides maximum flexibility while maintaining a unified menu management system.