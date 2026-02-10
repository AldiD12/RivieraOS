# SignalR Backend Implementation Task

**For:** Prof Kristi (Backend Developer)  
**Priority:** Medium  
**Status:** Pending  

---

## Overview

The frontend Bar Display now uses SignalR for real-time order updates instead of polling. The backend needs to broadcast SignalR events when orders are created or updated.

---

## What Already Exists

According to the README, you already have:
- SignalR Hub at `/hubs/beach` (BeachHub.cs)
- Events defined: `NewOrder`, `OrderStatusChanged`, `OrderAssigned`, `LayoutUpdate`

---

## What Needs to Be Done

### 1. Broadcast `NewOrder` Event

**When:** A new order is created via `POST /api/business/Orders`

**Code Location:** `OrdersController.cs` → `CreateOrder` method

**What to Add:**
```csharp
// After successfully creating the order in database
await _hubContext.Clients.All.SendAsync("NewOrder", new
{
    id = order.Id,
    orderNumber = order.OrderNumber,
    status = order.Status,
    venueId = order.VenueId,
    zoneName = order.Zone?.Name,
    customerName = order.CustomerName,
    items = order.Items.Select(i => new {
        productName = i.Product.Name,
        quantity = i.Quantity,
        price = i.Price
    }),
    totalAmount = order.TotalAmount,
    createdAt = order.CreatedAt
});
```

**Why:** Bar Display listens for `NewOrder` event to instantly show new orders without refresh.

---

### 2. Broadcast `OrderStatusChanged` Event

**When:** Order status is updated via `PUT /api/business/Orders/{id}/status`

**Code Location:** `OrdersController.cs` → `UpdateOrderStatus` method

**What to Add:**
```csharp
// After successfully updating order status in database
await _hubContext.Clients.All.SendAsync("OrderStatusChanged", new
{
    orderId = order.Id,
    orderNumber = order.OrderNumber,
    oldStatus = oldStatus, // Store before update
    newStatus = order.Status,
    updatedAt = DateTime.UtcNow
});
```

**Why:** Bar Display listens for `OrderStatusChanged` to update order cards instantly when bartender changes status.

---

## Implementation Steps

### Step 1: Inject IHubContext into OrdersController

```csharp
using Microsoft.AspNetCore.SignalR;

public class OrdersController : ControllerBase
{
    private readonly IHubContext<BeachHub> _hubContext;
    
    public OrdersController(
        ApplicationDbContext context,
        IHubContext<BeachHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }
}
```

### Step 2: Add Event Broadcasting to CreateOrder

```csharp
[HttpPost]
public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
{
    // ... existing validation and order creation logic ...
    
    await _context.SaveChangesAsync();
    
    // 🔴 ADD THIS: Broadcast to all connected clients
    await _hubContext.Clients.All.SendAsync("NewOrder", new
    {
        id = order.Id,
        orderNumber = order.OrderNumber,
        status = order.Status,
        venueId = order.VenueId,
        zoneName = order.Zone?.Name,
        customerName = order.CustomerName,
        items = order.Items.Select(i => new {
            productName = i.Product.Name,
            quantity = i.Quantity,
            price = i.Price
        }),
        totalAmount = order.TotalAmount,
        createdAt = order.CreatedAt
    });
    
    return Ok(order);
}
```

### Step 3: Add Event Broadcasting to UpdateOrderStatus

```csharp
[HttpPut("{id}/status")]
public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
{
    var order = await _context.Orders.FindAsync(id);
    if (order == null) return NotFound();
    
    var oldStatus = order.Status; // Store old status
    order.Status = dto.Status;
    
    await _context.SaveChangesAsync();
    
    // 🔴 ADD THIS: Broadcast status change
    await _hubContext.Clients.All.SendAsync("OrderStatusChanged", new
    {
        orderId = order.Id,
        orderNumber = order.OrderNumber,
        oldStatus = oldStatus,
        newStatus = order.Status,
        updatedAt = DateTime.UtcNow
    });
    
    return Ok(order);
}
```

---

## Testing the Implementation

### Test 1: New Order Event
1. Open Bar Display in browser (`/bar`)
2. Check browser console - should see "🔴 Bar Display - SignalR Connected"
3. Create a new order via API or customer QR code
4. Bar Display should instantly show the new order (no 10-second wait)

### Test 2: Status Change Event
1. Keep Bar Display open
2. Click "Mark as Preparing" on an order
3. Order should instantly move to "Preparing" column
4. No page refresh needed

### Test 3: Connection Status
1. Stop the backend server
2. Bar Display should show red "OFFLINE" indicator
3. Restart backend
4. Should auto-reconnect and show green "LIVE" indicator

---

## Frontend Connection Details

**Hub URL:** `{API_BASE_URL}/hubs/beach`
- Production: `https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/hubs/beach`
- Development: `http://localhost:5171/hubs/beach`

**Events Frontend Listens For:**
- `NewOrder` → Refreshes order list
- `OrderStatusChanged` → Refreshes order list

**Auto-Reconnect:** Enabled (frontend handles reconnection automatically)

---

## Optional Enhancements (Future)

### 1. Targeted Broadcasting (More Efficient)
Instead of `Clients.All`, broadcast only to specific business:

```csharp
// Add business users to groups when they connect
await _hubContext.Clients.Group($"business_{businessId}")
    .SendAsync("NewOrder", orderData);
```

### 2. Sound Notification
Backend can include a `playSound` flag for urgent orders:

```csharp
await _hubContext.Clients.All.SendAsync("NewOrder", new
{
    // ... order data ...
    playSound = true // Frontend can play notification sound
});
```

### 3. Order Assignment
When a waiter claims an order, broadcast `OrderAssigned` event.

---

## Questions?

If you need clarification on:
- Where to find OrdersController.cs
- How to inject IHubContext
- Testing SignalR locally

Let me know and I can provide more specific guidance.

---

## Summary

**What to do:**
1. Inject `IHubContext<BeachHub>` into OrdersController
2. Add `_hubContext.Clients.All.SendAsync("NewOrder", ...)` after creating order
3. Add `_hubContext.Clients.All.SendAsync("OrderStatusChanged", ...)` after updating status
4. Test with Bar Display open in browser

**Result:** Bar Display gets instant updates without polling, better UX for bartenders.
