# 🔴 CRITICAL: Public Endpoints Implementation - Complete Specification

## Overview

The customer-facing ordering system (SpotPage) requires public endpoints that don't require authentication. These endpoints are called when customers scan QR codes at tables/sunbeds.

**Current Status:** Swagger definitions exist but endpoints return 404 in production.

---

## Required Public Endpoints

### 1. GET /api/public/Orders/menu

**Purpose:** Get menu (categories and products) for customer ordering at a specific venue

**Authorization:** None (public endpoint)

**Route:** `GET /api/public/Orders/menu`

**Query Parameters:**
- `venueId` (integer, required) - The venue ID from QR code

**Response:** `200 OK` with array of categories

```json
[
  {
    "categoryId": 1,
    "categoryName": "Cocktails",
    "venueName": "BEACH",
    "products": [
      {
        "id": 10,
        "name": "Mojito",
        "description": "Classic Cuban cocktail with mint and lime",
        "price": 12.50,
        "imageUrl": "https://blackbearstorage.blob.core.windows.net/products/mojito.jpg",
        "isAvailable": true
      },
      {
        "id": 11,
        "name": "Piña Colada",
        "description": "Tropical coconut and pineapple cocktail",
        "price": 14.00,
        "imageUrl": "https://blackbearstorage.blob.core.windows.net/products/pina-colada.jpg",
        "isAvailable": true
      }
    ]
  },
  {
    "categoryId": 2,
    "categoryName": "Appetizers",
    "venueName": "BEACH",
    "products": [
      {
        "id": 20,
        "name": "Bruschetta",
        "description": "Toasted bread with tomatoes and basil",
        "price": 8.50,
        "imageUrl": "https://blackbearstorage.blob.core.windows.net/products/bruschetta.jpg",
        "isAvailable": true
      }
    ]
  }
]
```

**Implementation:**

```csharp
// Controllers/Public/OrdersController.cs

[HttpGet("menu")]
public async Task<IActionResult> GetMenu([FromQuery] int venueId)
{
    // Validate venueId
    if (venueId <= 0)
    {
        return BadRequest(new { message = "Invalid venue ID" });
    }

    // Get all active categories for this venue with their products
    var categories = await _context.Categories
        .Where(c => c.BusinessId == venueId && !c.IsDeleted)
        .Include(c => c.Products.Where(p => !p.IsDeleted && p.IsAvailable))
        .OrderBy(c => c.SortOrder)
        .Select(c => new PublicMenuCategoryDto
        {
            CategoryId = c.Id,
            CategoryName = c.Name,
            VenueName = c.Business.Name,
            Products = c.Products
                .OrderBy(p => p.SortOrder)
                .Select(p => new PublicMenuProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    ImageUrl = p.ImageUrl,
                    IsAvailable = p.IsAvailable
                })
                .ToList()
        })
        .ToListAsync();

    return Ok(categories);
}
```

**DTOs:**

```csharp
// DTOs/Public/PublicMenuDtos.cs

public class PublicMenuCategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string VenueName { get; set; } = string.Empty;
    public List<PublicMenuProductDto> Products { get; set; } = new();
}

public class PublicMenuProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsAvailable { get; set; }
}
```

---

### 2. POST /api/public/Orders

**Purpose:** Create a new order from customer (already exists, verify it works)

**Authorization:** None (public endpoint)

**Route:** `POST /api/public/Orders`

**Request Body:**

```json
{
  "venueId": 18,
  "zoneId": 16,
  "zoneUnitId": 89,
  "customerName": "John Doe",
  "notes": "No ice please",
  "items": [
    {
      "productId": 10,
      "quantity": 2
    },
    {
      "productId": 20,
      "quantity": 1
    }
  ]
}
```

**Response:** `200 OK` with order details

```json
{
  "id": 123,
  "orderNumber": "ORD-20260219-123",
  "venueId": 18,
  "venueName": "BEACH",
  "customerName": "John Doe",
  "totalAmount": 33.50,
  "status": "Pending",
  "createdAt": "2026-02-19T14:30:00Z",
  "items": [
    {
      "productName": "Mojito",
      "quantity": 2,
      "unitPrice": 12.50,
      "totalPrice": 25.00
    },
    {
      "productName": "Bruschetta",
      "quantity": 1,
      "unitPrice": 8.50,
      "totalPrice": 8.50
    }
  ]
}
```

**Verify this endpoint exists and works correctly.**

---

### 3. GET /api/public/Orders/{orderNumber}

**Purpose:** Get order status by order number (for customer tracking)

**Authorization:** None (public endpoint)

**Route:** `GET /api/public/Orders/{orderNumber}`

**Path Parameters:**
- `orderNumber` (string, required) - The order number (e.g., "ORD-20260219-123")

**Response:** `200 OK` with order details

```json
{
  "id": 123,
  "orderNumber": "ORD-20260219-123",
  "status": "Preparing",
  "customerName": "John Doe",
  "totalAmount": 33.50,
  "createdAt": "2026-02-19T14:30:00Z",
  "items": [
    {
      "productName": "Mojito",
      "quantity": 2,
      "unitPrice": 12.50
    }
  ]
}
```

**Verify this endpoint exists and works correctly.**

---

### 4. GET /api/public/Venues/{id}

**Purpose:** Get venue details including digital ordering settings

**Authorization:** None (public endpoint)

**Route:** `GET /api/public/Venues/{id}`

**Path Parameters:**
- `id` (integer, required) - The venue ID

**Response:** `200 OK` with venue details

```json
{
  "id": 18,
  "name": "BEACH",
  "type": "BEACH",
  "description": "Beautiful beachfront venue",
  "address": "123 Beach Road",
  "phone": "+355123456789",
  "allowsDigitalOrdering": true,
  "orderingEnabled": true,
  "googlePlaceId": "ChIJ...",
  "imageUrl": "https://blackbearstorage.blob.core.windows.net/venues/beach.jpg"
}
```

**Verify this endpoint exists and works correctly.**

---

### 5. POST /api/public/Reservations

**Purpose:** Create table/sunbed reservation from customer

**Authorization:** None (public endpoint)

**Route:** `POST /api/public/Reservations`

**Request Body:**

```json
{
  "zoneUnitId": 89,
  "venueId": 18,
  "guestName": "John Doe",
  "guestPhone": "+355123456789",
  "guestEmail": "john@example.com",
  "guestCount": 2,
  "notes": "Prefer shade",
  "startTime": "2026-02-19T10:00:00Z"
}
```

**Response:** `200 OK` with reservation details

```json
{
  "id": 456,
  "bookingCode": "BK-789ABC",
  "venueId": 18,
  "venueName": "BEACH",
  "zoneName": "VIP Section",
  "unitCode": "A1",
  "guestName": "John Doe",
  "guestPhone": "+355123456789",
  "guestEmail": "john@example.com",
  "guestCount": 2,
  "status": "Confirmed",
  "startTime": "2026-02-19T10:00:00Z",
  "createdAt": "2026-02-19T09:45:00Z"
}
```

**Verify this endpoint exists and works correctly.**

---

### 6. GET /api/public/Reservations/{bookingCode}

**Purpose:** Get reservation details by booking code

**Authorization:** None (public endpoint)

**Route:** `GET /api/public/Reservations/{bookingCode}`

**Path Parameters:**
- `bookingCode` (string, required) - The booking code (e.g., "BK-789ABC")

**Response:** `200 OK` with reservation details

```json
{
  "id": 456,
  "bookingCode": "BK-789ABC",
  "venueName": "BEACH",
  "zoneName": "VIP Section",
  "unitCode": "A1",
  "guestName": "John Doe",
  "guestPhone": "+355123456789",
  "guestCount": 2,
  "status": "Confirmed",
  "startTime": "2026-02-19T10:00:00Z"
}
```

**Verify this endpoint exists and works correctly.**

---

### 7. POST /api/public/venues/{venueId}/reviews

**Purpose:** Submit customer review for venue

**Authorization:** None (public endpoint)

**Route:** `POST /api/public/venues/{venueId}/reviews`

**Path Parameters:**
- `venueId` (integer, required) - The venue ID

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Amazing service and beautiful location!",
  "guestName": "John Doe"
}
```

**Response:** `200 OK` with review confirmation

```json
{
  "id": 789,
  "venueId": 18,
  "rating": 5,
  "comment": "Amazing service and beautiful location!",
  "guestName": "John Doe",
  "createdAt": "2026-02-19T15:00:00Z"
}
```

**Verify this endpoint exists and works correctly.**

---

### 8. GET /api/public/venues/{venueId}/reviews/rating

**Purpose:** Get average rating for venue

**Authorization:** None (public endpoint)

**Route:** `GET /api/public/venues/{venueId}/reviews/rating`

**Path Parameters:**
- `venueId` (integer, required) - The venue ID

**Response:** `200 OK` with rating stats

```json
{
  "venueId": 18,
  "averageRating": 4.7,
  "totalReviews": 156,
  "ratingDistribution": {
    "5": 98,
    "4": 42,
    "3": 12,
    "2": 3,
    "1": 1
  }
}
```

**Verify this endpoint exists and works correctly.**

---

## Testing Checklist

After implementation, test each endpoint:

### 1. Menu Endpoint
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/menu?venueId=18

Expected: 200 OK with categories and products
```

### 2. Create Order
```bash
POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders
Content-Type: application/json

{
  "venueId": 18,
  "customerName": "Test Customer",
  "items": [{"productId": 10, "quantity": 1}]
}

Expected: 200 OK with order details
```

### 3. Get Order
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Orders/ORD-20260219-123

Expected: 200 OK with order status
```

### 4. Get Venue
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Venues/18

Expected: 200 OK with venue details
```

### 5. Create Reservation
```bash
POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Reservations
Content-Type: application/json

{
  "zoneUnitId": 89,
  "venueId": 18,
  "guestName": "Test Guest",
  "guestPhone": "+355123456789",
  "guestCount": 2,
  "startTime": "2026-02-19T10:00:00Z"
}

Expected: 200 OK with booking code
```

### 6. Get Reservation
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/Reservations/BK-789ABC

Expected: 200 OK with reservation details
```

### 7. Submit Review
```bash
POST https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/venues/18/reviews
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great experience!",
  "guestName": "Test User"
}

Expected: 200 OK with review confirmation
```

### 8. Get Rating
```bash
GET https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api/public/venues/18/reviews/rating

Expected: 200 OK with rating stats
```

---

## Priority

🔴 **CRITICAL - BLOCKING PRODUCTION**

**Endpoint #1 (Menu)** is the highest priority - SpotPage is completely broken without it.

The other endpoints may already exist - verify them first before implementing.

---

## File Structure

```
BlackBear.Services.Core/
  Controllers/
    Public/
      OrdersController.cs      ← Add GetMenu() method here
      ReservationsController.cs ← Verify endpoints exist
      VenuesController.cs       ← Verify endpoints exist
  DTOs/
    Public/
      PublicMenuDtos.cs         ← NEW FILE - Add menu DTOs
      PublicOrderDtos.cs        ← Verify exists
      PublicReservationDtos.cs  ← Verify exists
      PublicVenueDtos.cs        ← Verify exists
```

---

## Security Notes

✅ All endpoints are public (no authentication required)  
✅ Validate all input parameters  
✅ Only return active/available items  
✅ Don't expose sensitive business data  
✅ Rate limit to prevent abuse  
✅ Sanitize customer input (names, notes, comments)

---

## Frontend Integration

Frontend is already configured to call these endpoints:

```javascript
// SpotPage - Menu
const menuResponse = await fetch(`${API_URL}/public/Orders/menu?venueId=${venueId}`);

// SpotPage - Create Order
const orderResponse = await fetch(`${API_URL}/public/Orders`, {
  method: 'POST',
  body: JSON.stringify(orderData)
});

// SpotPage - Create Reservation
const reservationResponse = await fetch(`${API_URL}/public/Reservations`, {
  method: 'POST',
  body: JSON.stringify(bookingData)
});

// ReviewPage - Submit Review
const reviewResponse = await fetch(`${API_URL}/public/venues/${venueId}/reviews`, {
  method: 'POST',
  body: JSON.stringify(reviewData)
});
```

---

## Estimated Time

- **Menu endpoint (NEW):** 45 minutes
- **Verify other endpoints:** 30 minutes
- **Testing all endpoints:** 1 hour
- **Total:** 2-2.5 hours

---

## Current Error

```
GET /api/public/Orders/menu?venueId=18
404 (Not Found)
```

This is blocking all customer ordering functionality.

---

## Next Steps

1. ✅ Implement `GET /api/public/Orders/menu` endpoint
2. ✅ Create `PublicMenuDtos.cs` with DTOs
3. ✅ Test menu endpoint with venue 18
4. ✅ Verify other public endpoints work
5. ✅ Deploy to Azure
6. ✅ Test on production with real QR codes

---

**Status:** ⏳ Waiting for Prof Kristi to implement and deploy
