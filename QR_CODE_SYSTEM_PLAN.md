# QR Code System - Technical Plan

## 🎯 QR Code Purpose

Each QR code at a sunbed/table serves **dual purpose**:
1. **Order** - Show menu items eligible for that specific venue
2. **Book** - Reserve that specific sunbed/table

---

## 📱 QR Code Structure

### URL Format
```
https://riviera.app/spot?v={venueId}&z={zoneId}&u={unitId}
```

### Example
```
https://riviera.app/spot?v=5&z=12&u=A23
```

**Parameters**:
- `v` = Venue ID (e.g., 5 = "Beach Club Coral")
- `z` = Zone ID (e.g., 12 = "VIP Section")
- `u` = Unit ID (e.g., A23 = Sunbed number A23)

---

## 🍽️ Menu Filtering Logic

### Problem
Not all menu items are available at all venues. For example:
- Beach venue → Show beach drinks, snacks
- Pool venue → Show pool menu, cocktails
- Restaurant venue → Show full restaurant menu

### Solution: Venue-Specific Menu

**Backend Logic** (Already exists in swagger):
```
GET /api/public/venues/{venueId}/menu
```

This endpoint returns **only items available at that venue**.

### How It Works

**Database Structure**:
```
Products Table:
- id
- name
- price
- category_id
- image_url

Product_Venue_Exclusions Table:
- product_id
- venue_id
```

**Logic**:
- If product is in exclusions for venue → Don't show
- Otherwise → Show in menu

**Example**:
```
Product: "Mojito" (id: 45)
Venues: 
  - Beach Club (id: 5) ✅ Available
  - Pool Bar (id: 6) ✅ Available  
  - Restaurant (id: 7) ❌ Excluded

When QR scanned at Restaurant (v=7):
→ Mojito will NOT appear in menu
```

---

## 🏗️ Frontend Implementation

### Page: `/spot` (Unified QR Landing Page)

**URL**: `https://riviera.app/spot?v=5&z=12&u=A23`

**On Load**:
1. Parse URL parameters (venueId, zoneId, unitId)
2. Fetch venue details: `GET /api/public/venues/{venueId}`
3. Fetch venue menu: `GET /api/public/venues/{venueId}/menu`
4. Fetch unit details: `GET /api/public/zones/{zoneId}/units/{unitId}`
5. Check unit availability
6. Display page with two tabs

---

### Tab 1: Order (Menu)

**API Call**:
```javascript
GET /api/public/venues/5/menu
```

**Response** (Only items available at this venue):
```json
{
  "categories": [
    {
      "id": 1,
      "name": "Cocktails",
      "products": [
        {
          "id": 45,
          "name": "Mojito",
          "price": 8.50,
          "imageUrl": "...",
          "isAvailable": true
        },
        {
          "id": 46,
          "name": "Piña Colada",
          "price": 9.00,
          "imageUrl": "...",
          "isAvailable": true
        }
      ]
    },
    {
      "id": 2,
      "name": "Snacks",
      "products": [...]
    }
  ]
}
```

**UI**:
- Category tabs (Cocktails, Food, Snacks)
- Product cards with images
- Add to cart button
- Cart summary at bottom
- "Place Order" button

**Order Submission**:
```javascript
POST /api/public/orders
{
  "venueId": 5,
  "zoneId": 12,
  "unitId": "A23",
  "items": [
    { "productId": 45, "quantity": 2 },
    { "productId": 46, "quantity": 1 }
  ],
  "specialRequests": "No ice in Mojito"
}
```

---

### Tab 2: Book (Reservation)

**Display Info**:
- Venue name: "Beach Club Coral"
- Zone: "VIP Section"
- Unit: "Sunbed A23"
- Current status: Available / Occupied / Reserved

**Booking Form**:
- Date selector (default: today)
- Time slot selector (2 hours, 4 hours, full day)
- Guest count (1-6)
- Special requests (optional)

**API Call**:
```javascript
POST /api/public/bookings
{
  "venueId": 5,
  "zoneId": 12,
  "unitId": "A23",
  "date": "2026-02-07",
  "startTime": "10:00",
  "duration": 4, // hours
  "guestCount": 2,
  "customerName": "John Doe",
  "customerPhone": "+355-69-123-4567",
  "specialRequests": "Near the bar"
}
```

**Response**:
```json
{
  "bookingId": 789,
  "confirmationCode": "BCR-789",
  "status": "confirmed",
  "venueId": 5,
  "unitId": "A23",
  "startTime": "10:00",
  "endTime": "14:00",
  "totalPrice": 50.00
}
```

---

## 🔢 QR Code Generation System

### When to Generate QR Codes

**Scenario 1: New Venue Created**
- Admin creates venue in dashboard
- System generates QR codes for all units in all zones

**Scenario 2: New Zone/Units Added**
- Admin adds zone with units
- System generates QR codes for new units

### QR Code Generation Process

**Backend Endpoint** (Needs to be created):
```
POST /api/business/venues/{venueId}/zones/{zoneId}/units/{unitId}/generate-qr
```

**Response**:
```json
{
  "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?data=https://riviera.app/spot?v=5&z=12&u=A23",
  "qrCodeData": "https://riviera.app/spot?v=5&z=12&u=A23",
  "unitId": "A23",
  "printUrl": "/api/business/venues/5/zones/12/units/A23/qr-print"
}
```

### QR Code Storage

**Option 1: Generate on-the-fly**
- Store only the URL data
- Generate QR image when needed
- Pros: No storage needed
- Cons: Slower

**Option 2: Pre-generate and store**
- Generate QR images
- Store in Azure Blob Storage
- Store URL in database
- Pros: Fast loading
- Cons: Storage costs

**Recommended**: Option 1 (on-the-fly) using QR code library

---

## 🖨️ QR Code Printing System

### Admin Dashboard Feature

**Location**: Business Dashboard → Venues Tab → Zone Details

**UI**:
```
Zone: VIP Section
Units: 20 sunbeds

[Print All QR Codes] button

Unit List:
┌─────────────────────────────────┐
│ A1  [View QR] [Print QR]        │
│ A2  [View QR] [Print QR]        │
│ A3  [View QR] [Print QR]        │
│ ...                             │
└─────────────────────────────────┘
```

**Print Format** (PDF):
```
┌──────────────────────────────┐
│  Beach Club Coral            │
│  VIP Section                 │
│  Sunbed A23                  │
│                              │
│  [QR CODE IMAGE]             │
│                              │
│  Scan to Order & Book        │
└──────────────────────────────┘
```

**Bulk Print**:
- Generate PDF with all QR codes
- One QR per page (for lamination)
- Include venue name, zone, unit number
- Waterproof/laminated stickers

---

## 🔐 Security Considerations

### QR Code Validation

**Problem**: Someone could manually create fake QR codes

**Solution**: Add validation token
```
https://riviera.app/spot?v=5&z=12&u=A23&t=abc123xyz
```

**Token Generation**:
```javascript
token = HMAC-SHA256(venueId + zoneId + unitId + SECRET_KEY)
```

**Validation**:
- Frontend sends: venueId, zoneId, unitId, token
- Backend verifies token matches
- If invalid → Show error

---

## 📊 QR Code Analytics

### Track QR Scans

**Database Table**: `qr_scans`
```sql
CREATE TABLE qr_scans (
  id INT PRIMARY KEY,
  venue_id INT,
  zone_id INT,
  unit_id VARCHAR(10),
  scanned_at DATETIME,
  ip_address VARCHAR(50),
  user_agent TEXT,
  action VARCHAR(20) -- 'order' or 'book'
)
```

**Metrics to Track**:
- Total scans per unit
- Scans per day/hour
- Order conversion rate (scans → orders)
- Booking conversion rate (scans → bookings)
- Popular units
- Peak hours

---

## 🎨 QR Code Design

### Physical QR Code Sticker

**Size**: 10cm x 10cm (waterproof)

**Layout**:
```
┌────────────────────────┐
│                        │
│   BEACH CLUB CORAL     │ ← Venue name
│   VIP Section          │ ← Zone name
│                        │
│   ┌──────────────┐     │
│   │              │     │
│   │   QR CODE    │     │ ← QR code (7cm x 7cm)
│   │              │     │
│   └──────────────┘     │
│                        │
│   Sunbed A23           │ ← Unit number (large)
│                        │
│   Scan to Order & Book │ ← Instructions
│                        │
└────────────────────────┘
```

**Colors**:
- Background: White
- Text: Black
- Accent: Venue brand color
- QR Code: Black on white

---

## 🚀 Implementation Steps

### Phase 1: Backend (Week 1)
1. ✅ Verify menu filtering works (`GET /api/public/venues/{id}/menu`)
2. ✅ Verify booking endpoint exists (`POST /api/public/bookings`)
3. ✅ Verify order endpoint exists (`POST /api/public/orders`)
4. ⚠️ Add QR code generation endpoint (if needed)
5. ⚠️ Add QR scan tracking (analytics)

### Phase 2: Frontend (Week 2)
1. Create `/spot` page (unified QR landing)
2. Implement Order tab (menu display)
3. Implement Book tab (reservation form)
4. Add cart functionality
5. Add order tracking
6. Test QR code flow end-to-end

### Phase 3: Admin Tools (Week 3)
1. Add "Generate QR" button in dashboard
2. Add "Print QR" functionality
3. Add bulk QR generation
4. Add QR analytics dashboard
5. Test printing and lamination

---

## 💡 Smart Features

### Auto-Detection
- Detect if unit is already booked
- Show "Extend Booking" option if customer has active booking
- Show "Order More" if customer has active order

### Personalization
- Remember customer's previous orders
- Show "Order Again" quick button
- Save favorite items

### Real-Time Updates
- Show live order status
- Show booking countdown timer
- Notify when order is ready

---

## 🔧 Technical Stack

**QR Code Generation**:
- Library: `qrcode.react` (React)
- Or: `qrcode` (Node.js)
- Or: External API (qrserver.com)

**QR Code Scanning**:
- Native camera app (iOS/Android)
- No special app needed
- Opens in browser automatically

**PDF Generation** (for printing):
- Library: `jsPDF` or `pdfmake`
- Generate printable QR sheets

---

## 📝 Summary

**QR Code URL**:
```
https://riviera.app/spot?v={venueId}&z={zoneId}&u={unitId}
```

**Two Tabs**:
1. **Order** - Menu filtered by venue
2. **Book** - Reserve that specific unit

**Menu Filtering**:
- Backend returns only items available at venue
- Uses Product_Venue_Exclusions table
- Automatic filtering, no frontend logic needed

**Next Steps**:
1. Verify backend endpoints work
2. Build `/spot` page with tabs
3. Test with real QR codes
4. Add admin QR generation tools
