# Backend Task: Fix Bartender & Collector Dashboard Data

**Priority:** HIGH  
**Estimated Time:** 2-3 hours  
**Status:** PENDING  
**Owner:** Prof Kristi

---

## 📋 OVERVIEW

The Bartender (BarDisplay) and Collector (CollectorDashboard) frontends are complete and working, but they need additional data from the backend to function properly. The endpoints exist and authorization is correct, but the DTOs are missing some fields that the frontend expects.

**Current Status:**
- ✅ All endpoints exist and are deployed
- ✅ Authorization policies are correct (Bartender, Collector)
- ✅ Frontend is 100% complete
- ⚠️ DTOs missing some fields (items array, unitCode)
- ⚠️ SignalR events not broadcast (optional for MVP)

---

## 🎯 PRIORITY 1 - CRITICAL (Required for MVP)

### Task 1.1: Add Items Array to Order List DTO

**Problem:** BarDisplay expects `order.items` array but `BizOrderListItemDto` doesn't include it.

**Frontend Expectation:**
```javascript
// BarDisplay.jsx expects this structure
order.items = [
  {
    productName: "Mojito",
    quantity: 2,
    price: 12.50
  },
  {
    productName: "Caesar Salad",
    quantity: 1,
    price: 8.00
  }
]
```

**Current Backend Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-001",
  "itemCount": 3,
  "totalAmount": 45.50
  // NO items array!
}
```

---

#### Solution Option A: Add Items to List DTO (Recommended)

**File:** `BlackBear.Services.Core/DTOs/Order/BizOrderListItemDto.cs`

**BEFORE:**
```csharp
public class BizOrderListItemDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
```

**AFTER:**
```csharp
public class BizOrderListItemDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // NEW: Add items array
    public List<BizOrderItemDto> Items { get; set; } = new();
}

// Make sure this DTO exists
public class BizOrderItemDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Price { get; set; } // Total price for this item (Quantity * UnitPrice)
}
```

**File:** `BlackBear.Services.Core/Controllers/Business/OrdersController.cs`

**Update the GetActiveOrders endpoint:**

**BEFORE:**
```csharp
[HttpGet("active")]
[Authorize(Policy = "Bartender")]
public async Task<ActionResult<List<BizOrderListItemDto>>> GetActiveOrders([FromQuery] int? venueId)
{
    var businessId = int.Parse(User.FindFirst("businessId")?.Value ?? "0");
    
    var query = _context.Orders
        .Where(o => o.BusinessId == businessId && 
                    o.Status != "Delivered" && 
                    o.Status != "Cancelled");
    
    if (venueId.HasValue)
        query = query.Where(o => o.VenueId == venueId.Value);
    
    var orders = await query
        .OrderBy(o => o.CreatedAt)
        .Select(o => new BizOrderListItemDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            ItemCount = o.OrderItems.Count,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CreatedAt = o.CreatedAt
        })
        .ToListAsync();
    
    return Ok(orders);
}
```

**AFTER:**
```csharp
[HttpGet("active")]
[Authorize(Policy = "Bartender")]
public async Task<ActionResult<List<BizOrderListItemDto>>> GetActiveOrders([FromQuery] int? venueId)
{
    var businessId = int.Parse(User.FindFirst("businessId")?.Value ?? "0");
    
    var query = _context.Orders
        .Include(o => o.OrderItems) // IMPORTANT: Include items
        .Where(o => o.BusinessId == businessId && 
                    o.Status != "Delivered" && 
                    o.Status != "Cancelled");
    
    if (venueId.HasValue)
        query = query.Where(o => o.VenueId == venueId.Value);
    
    var orders = await query
        .OrderBy(o => o.CreatedAt)
        .Select(o => new BizOrderListItemDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            ItemCount = o.OrderItems.Count,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CreatedAt = o.CreatedAt,
            
            // NEW: Map items
            Items = o.OrderItems.Select(i => new BizOrderItemDto
            {
                Id = i.Id,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Price = i.Quantity * i.UnitPrice
            }).ToList()
        })
        .ToListAsync();
    
    return Ok(orders);
}
```

**Changes:**
- ✅ Add `.Include(o => o.OrderItems)` to load items
- ✅ Map `Items` property in the DTO
- ✅ Calculate total price per item (Quantity * UnitPrice)

---

#### Solution Option B: Document That Frontend Must Fetch Details (Alternative)

If you prefer to keep the list endpoint lightweight, document that the frontend should fetch full order details separately.

**Add to API documentation:**
```csharp
/// <remarks>
/// This endpoint returns a lightweight list of orders without items.
/// To get order items, call GET /api/business/Orders/{id} for each order.
/// </remarks>
```

**Note:** This requires frontend changes and will be slower (multiple API calls).

---

### Task 1.2: Add UnitCode Field to Order Entity/DTO

**Problem:** BarDisplay shows `order.unitCode` (which sunbed/table the order came from) but the backend doesn't include it.

**Frontend Expectation:**
```javascript
// BarDisplay.jsx line 234
<span className="bg-amber-600 text-white px-3 py-1 rounded-md">
  {order.unitCode}
</span>
```

---

#### Step 1: Check if Order Entity Has UnitCode

**File:** `BlackBear.Services.Core/Entities/Order.cs`

**Check if this field exists:**
```csharp
public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int BusinessId { get; set; }
    public int VenueId { get; set; }
    public int? ZoneUnitId { get; set; } // Does this exist?
    public string? UnitCode { get; set; } // Does this exist?
    // ... other fields
}
```

**If `UnitCode` field exists:** Skip to Step 3  
**If only `ZoneUnitId` exists:** Go to Step 2  
**If neither exists:** Go to Step 2

---

#### Step 2: Add UnitCode to Order Entity (If Missing)

**Option A: Add UnitCode as a direct field (Simpler)**

**File:** `BlackBear.Services.Core/Entities/Order.cs`

```csharp
public class Order
{
    // ... existing fields ...
    
    [StringLength(50)]
    public string? UnitCode { get; set; } // NEW: Store unit code directly
}
```

**Migration:**
```bash
dotnet ef migrations add AddUnitCodeToOrder
dotnet ef database update
```

**Update Public OrdersController** (when customer creates order):
```csharp
[HttpPost]
public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto dto)
{
    // ... existing validation ...
    
    // NEW: Get unit code if zoneUnitId provided
    string? unitCode = null;
    if (dto.ZoneUnitId.HasValue)
    {
        var unit = await _context.ZoneUnits
            .FirstOrDefaultAsync(u => u.Id == dto.ZoneUnitId.Value);
        unitCode = unit?.UnitCode;
    }
    
    var order = new Order
    {
        // ... existing fields ...
        ZoneUnitId = dto.ZoneUnitId,
        UnitCode = unitCode, // NEW: Store unit code
        // ... rest of fields ...
    };
    
    // ... rest of code ...
}
```

---

**Option B: Add navigation property and join (More normalized)**

**File:** `BlackBear.Services.Core/Entities/Order.cs`

```csharp
public class Order
{
    // ... existing fields ...
    
    public int? ZoneUnitId { get; set; }
    public ZoneUnit? ZoneUnit { get; set; } // NEW: Navigation property
}
```

**No migration needed if ZoneUnitId already exists.**

---

#### Step 3: Add UnitCode to DTOs

**File:** `BlackBear.Services.Core/DTOs/Order/BizOrderListItemDto.cs`

```csharp
public class BizOrderListItemDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string? UnitCode { get; set; } // NEW: Add unit code
    public int ItemCount { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<BizOrderItemDto> Items { get; set; } = new();
}
```

---

#### Step 4: Update OrdersController to Include UnitCode

**File:** `BlackBear.Services.Core/Controllers/Business/OrdersController.cs`

**If using Option A (direct field):**
```csharp
[HttpGet("active")]
[Authorize(Policy = "Bartender")]
public async Task<ActionResult<List<BizOrderListItemDto>>> GetActiveOrders([FromQuery] int? venueId)
{
    var businessId = int.Parse(User.FindFirst("businessId")?.Value ?? "0");
    
    var query = _context.Orders
        .Include(o => o.OrderItems)
        .Where(o => o.BusinessId == businessId && 
                    o.Status != "Delivered" && 
                    o.Status != "Cancelled");
    
    if (venueId.HasValue)
        query = query.Where(o => o.VenueId == venueId.Value);
    
    var orders = await query
        .OrderBy(o => o.CreatedAt)
        .Select(o => new BizOrderListItemDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            UnitCode = o.UnitCode, // NEW: Include unit code
            ItemCount = o.OrderItems.Count,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CreatedAt = o.CreatedAt,
            Items = o.OrderItems.Select(i => new BizOrderItemDto
            {
                Id = i.Id,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Price = i.Quantity * i.UnitPrice
            }).ToList()
        })
        .ToListAsync();
    
    return Ok(orders);
}
```

**If using Option B (navigation property):**
```csharp
[HttpGet("active")]
[Authorize(Policy = "Bartender")]
public async Task<ActionResult<List<BizOrderListItemDto>>> GetActiveOrders([FromQuery] int? venueId)
{
    var businessId = int.Parse(User.FindFirst("businessId")?.Value ?? "0");
    
    var query = _context.Orders
        .Include(o => o.OrderItems)
        .Include(o => o.ZoneUnit) // NEW: Include unit for join
        .Where(o => o.BusinessId == businessId && 
                    o.Status != "Delivered" && 
                    o.Status != "Cancelled");
    
    if (venueId.HasValue)
        query = query.Where(o => o.VenueId == venueId.Value);
    
    var orders = await query
        .OrderBy(o => o.CreatedAt)
        .Select(o => new BizOrderListItemDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            UnitCode = o.ZoneUnit != null ? o.ZoneUnit.UnitCode : null, // NEW: Get from join
            ItemCount = o.OrderItems.Count,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            CreatedAt = o.CreatedAt,
            Items = o.OrderItems.Select(i => new BizOrderItemDto
            {
                Id = i.Id,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Price = i.Quantity * i.UnitPrice
            }).ToList()
        })
        .ToListAsync();
    
    return Ok(orders);
}
```

---

## 🎯 PRIORITY 2 - IMPORTANT (Real-time Updates)

### Task 2.1: Add SignalR Broadcast for New Orders

**Problem:** When a customer creates an order, the Bartender dashboard doesn't update in real-time.

**File:** `BlackBear.Services.Core/Controllers/Public/OrdersController.cs`

**Location:** `POST /api/public/orders` endpoint

**Add SignalR broadcast after order is created:**

```csharp
using Microsoft.AspNetCore.SignalR;
using BlackBear.Services.Core.Hubs;

[ApiController]
[Route("api/public/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<BeachHub> _hubContext; // NEW: Inject hub
    
    public OrdersController(
        ApplicationDbContext context,
        IHubContext<BeachHub> hubContext) // NEW: Add parameter
    {
        _context = context;
        _hubContext = hubContext;
    }
    
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CreateOrderDto dto)
    {
        // ... existing validation and order creation code ...
        
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        
        // NEW: Broadcast to all connected clients
        await _hubContext.Clients.All.SendAsync("NewOrder", new
        {
            orderId = order.Id,
            orderNumber = order.OrderNumber,
            venueId = order.VenueId,
            status = order.Status,
            unitCode = order.UnitCode,
            totalAmount = order.TotalAmount,
            itemCount = order.OrderItems.Count
        });
        
        // ... rest of code (return response) ...
    }
}
```

**Frontend already listens for this event:**
```javascript
// BarDisplay.jsx line 89
connection.on('NewOrder', (data) => {
  console.log('📦 New order received:', data);
  fetchOrders(); // Refresh orders list
});
```

---

### Task 2.2: Add SignalR Broadcast for Booking Created

**Problem:** When a customer or collector creates a booking, other collectors don't see it in real-time.

**File:** `BlackBear.Services.Core/Controllers/Business/UnitBookingsController.cs`

**Location:** `POST /api/business/venues/{venueId}/bookings` endpoint

```csharp
using Microsoft.AspNetCore.SignalR;
using BlackBear.Services.Core.Hubs;

[ApiController]
[Route("api/business/venues/{venueId}/[controller]")]
[Authorize(Policy = "Collector")]
public class UnitBookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<BeachHub> _hubContext; // NEW: Inject hub
    
    public UnitBookingsController(
        ApplicationDbContext context,
        IHubContext<BeachHub> hubContext) // NEW: Add parameter
    {
        _context = context;
        _hubContext = hubContext;
    }
    
    [HttpPost]
    public async Task<ActionResult<BookingDto>> CreateBooking(
        int venueId,
        [FromBody] CreateBookingDto dto)
    {
        // ... existing validation and booking creation code ...
        
        _context.UnitBookings.Add(booking);
        await _context.SaveChangesAsync();
        
        // NEW: Broadcast to all connected clients
        await _hubContext.Clients.All.SendAsync("BookingCreated", new
        {
            bookingId = booking.Id,
            venueId = booking.VenueId,
            zoneUnitId = booking.ZoneUnitId,
            status = booking.Status,
            guestName = booking.GuestName,
            guestCount = booking.GuestCount
        });
        
        // ... rest of code (return response) ...
    }
}
```

**Frontend already listens for this event:**
```javascript
// CollectorDashboard.jsx line 107
connection.on('BookingCreated', (data) => {
  console.log('📅 New booking:', data);
  fetchUnits(); // Refresh units
  fetchBookings(); // Refresh bookings
});
```

---

### Task 2.3: Add SignalR Broadcast for Booking Status Changes

**Problem:** When a collector checks in/out a booking, other collectors don't see the update.

**File:** `BlackBear.Services.Core/Controllers/Business/UnitBookingsController.cs`

**Add broadcasts to check-in, check-out, and cancel endpoints:**

```csharp
[HttpPost("{id}/check-in")]
public async Task<IActionResult> CheckIn(int venueId, int id)
{
    // ... existing code ...
    
    booking.Status = "Occupied";
    booking.CheckInTime = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    
    // NEW: Broadcast status change
    await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
    {
        bookingId = booking.Id,
        zoneUnitId = booking.ZoneUnitId,
        status = booking.Status,
        venueId = booking.VenueId
    });
    
    return NoContent();
}

[HttpPost("{id}/check-out")]
public async Task<IActionResult> CheckOut(int venueId, int id)
{
    // ... existing code ...
    
    booking.Status = "Completed";
    booking.CheckOutTime = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    
    // NEW: Broadcast status change
    await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
    {
        bookingId = booking.Id,
        zoneUnitId = booking.ZoneUnitId,
        status = booking.Status,
        venueId = booking.VenueId
    });
    
    return NoContent();
}

[HttpPost("{id}/cancel")]
public async Task<IActionResult> Cancel(int venueId, int id)
{
    // ... existing code ...
    
    booking.Status = "Cancelled";
    await _context.SaveChangesAsync();
    
    // NEW: Broadcast status change
    await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
    {
        bookingId = booking.Id,
        zoneUnitId = booking.ZoneUnitId,
        status = booking.Status,
        venueId = booking.VenueId
    });
    
    return NoContent();
}
```

**Frontend already listens for this event:**
```javascript
// CollectorDashboard.jsx line 112
connection.on('BookingStatusChanged', (data) => {
  console.log('🔄 Booking status changed:', data);
  fetchUnits();
  fetchBookings();
});
```

---

## 🧪 TESTING CHECKLIST

### Test Priority 1 Changes

**Test 1.1: Order Items Array**
```bash
# Login as Bartender
POST /api/auth/login
{
  "phone": "+355691234567",
  "pin": "1234"
}

# Get active orders
GET /api/business/Orders/active
Authorization: Bearer {token}

# Expected response:
{
  "id": 1,
  "orderNumber": "ORD-001",
  "unitCode": "5",
  "itemCount": 2,
  "totalAmount": 20.50,
  "status": "Pending",
  "items": [
    {
      "id": 1,
      "productName": "Mojito",
      "quantity": 2,
      "unitPrice": 7.50,
      "price": 15.00
    },
    {
      "id": 2,
      "productName": "Water",
      "quantity": 1,
      "unitPrice": 5.50,
      "price": 5.50
    }
  ]
}
```

**Test 1.2: Unit Code Field**
```bash
# Create order from SpotPage (as customer)
POST /api/public/orders
{
  "venueId": 1,
  "zoneUnitId": 5,
  "items": [
    { "productId": 1, "quantity": 2 }
  ]
}

# Check order has unitCode
GET /api/business/Orders/active
# Should return unitCode: "5"
```

---

### Test Priority 2 Changes

**Test 2.1: SignalR New Order Event**
1. Open BarDisplay in browser
2. Check console: "✅ SignalR Connected"
3. Create order from SpotPage (different browser/tab)
4. BarDisplay should show new order immediately
5. Check console: "📦 New order received: {data}"

**Test 2.2: SignalR Booking Created Event**
1. Open CollectorDashboard in browser
2. Check console: "✅ SignalR Connected"
3. Create booking (different browser/tab or quick booking)
4. CollectorDashboard should update immediately
5. Check console: "📅 New booking: {data}"

**Test 2.3: SignalR Booking Status Changed Event**
1. Open CollectorDashboard in two browsers
2. In Browser 1: Check in a booking
3. Browser 2 should update immediately
4. Check console: "🔄 Booking status changed: {data}"

---

## 📋 IMPLEMENTATION CHECKLIST

### Priority 1 - Critical (Required for MVP)
- [ ] Add `Items` property to `BizOrderListItemDto`
- [ ] Create/verify `BizOrderItemDto` exists
- [ ] Update `GetActiveOrders` to include items (`.Include()` and map)
- [ ] Check if Order entity has `UnitCode` field
- [ ] If missing, add `UnitCode` to Order entity (migration)
- [ ] Update Public OrdersController to store `UnitCode` when creating order
- [ ] Add `UnitCode` to `BizOrderListItemDto`
- [ ] Update `GetActiveOrders` to include `UnitCode`
- [ ] Test with Postman/Swagger
- [ ] Test with BarDisplay frontend

### Priority 2 - Important (Real-time Updates)
- [ ] Inject `IHubContext<BeachHub>` in Public OrdersController
- [ ] Add `NewOrder` SignalR broadcast after order creation
- [ ] Inject `IHubContext<BeachHub>` in UnitBookingsController
- [ ] Add `BookingCreated` SignalR broadcast after booking creation
- [ ] Add `BookingStatusChanged` broadcast in check-in endpoint
- [ ] Add `BookingStatusChanged` broadcast in check-out endpoint
- [ ] Add `BookingStatusChanged` broadcast in cancel endpoint
- [ ] Test SignalR events with frontend

### Deployment
- [ ] Run migrations (if UnitCode added)
- [ ] Commit changes
- [ ] Push to repository
- [ ] Deploy to Azure Container Apps
- [ ] Verify deployment successful
- [ ] Test in production

---

## 🚀 DEPLOYMENT NOTES

### If You Added UnitCode Field (Migration Required)

```bash
# Create migration
dotnet ef migrations add AddUnitCodeToOrder

# Update database
dotnet ef database update

# Or in production (Azure)
# Migration will run automatically on deployment
```

### If No Schema Changes (No Migration)

Just deploy the code changes - no database migration needed.

---

## 💡 QUICK REFERENCE

### Files to Modify

**Priority 1:**
1. `BlackBear.Services.Core/DTOs/Order/BizOrderListItemDto.cs` - Add Items and UnitCode
2. `BlackBear.Services.Core/DTOs/Order/BizOrderItemDto.cs` - Create if missing
3. `BlackBear.Services.Core/Entities/Order.cs` - Add UnitCode field (if missing)
4. `BlackBear.Services.Core/Controllers/Business/OrdersController.cs` - Update GetActiveOrders
5. `BlackBear.Services.Core/Controllers/Public/OrdersController.cs` - Store UnitCode on create

**Priority 2:**
6. `BlackBear.Services.Core/Controllers/Public/OrdersController.cs` - Add NewOrder broadcast
7. `BlackBear.Services.Core/Controllers/Business/UnitBookingsController.cs` - Add broadcasts

---

## ✅ SUCCESS CRITERIA

**Priority 1 Complete When:**
- ✅ GET /api/business/Orders/active returns `items` array
- ✅ GET /api/business/Orders/active returns `unitCode` field
- ✅ BarDisplay shows order items correctly
- ✅ BarDisplay shows unit codes correctly
- ✅ No console errors in frontend

**Priority 2 Complete When:**
- ✅ Creating order triggers SignalR event
- ✅ BarDisplay updates in real-time
- ✅ Creating booking triggers SignalR event
- ✅ CollectorDashboard updates in real-time
- ✅ Check-in/out triggers SignalR event
- ✅ Multiple collectors see updates simultaneously

---

## 📞 QUESTIONS?

If you have questions or need clarification:
1. Check `BARTENDER_COLLECTOR_FINAL_DIAGNOSIS.md` for detailed analysis
2. Check `frontend/src/pages/BarDisplay.jsx` to see what frontend expects
3. Check `frontend/src/pages/CollectorDashboard.jsx` for booking expectations
4. Check `backend-temp/BlackBear.Services/BlackBear.Services.Core/Hubs/BeachHub.cs` for SignalR setup

---

**Created:** February 18, 2026  
**For:** Prof Kristi (Backend Developer)  
**Estimated Time:** 2-3 hours  
**Status:** READY FOR IMPLEMENTATION
