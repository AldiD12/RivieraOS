# Backend Developer - Next Priorities After Staff Authorization Fix

## 🎯 **Priority 1: Complete Business API Implementation**

### **1. Fix Business Profile Endpoint (Immediate)**
- `GET /api/business/Profile` currently returns 403 for Manager role
- Should work like other business endpoints (Dashboard, Staff, Categories work fine)
- Add Manager role to authorization: `[Authorize(Roles = "Manager,Owner")]`

### **2. Implement Missing Business Endpoints**
Based on swagger.json, these might need implementation or authorization fixes:
- `PUT /api/business/Profile` - Update business profile
- `POST /api/business/Venues` - Create venues
- `PUT /api/business/Venues/{id}` - Update venues
- `DELETE /api/business/Venues/{id}` - Delete venues
- `POST /api/business/venues/{venueId}/Zones` - Create zones
- `PUT /api/business/venues/{venueId}/Zones/{zoneId}` - Update zones

## 🎯 **Priority 2: Customer-Facing APIs (High Impact)**

### **3. Public Menu API for QR Code Scanning**
Customers need to access menus without authentication:
```csharp
[AllowAnonymous]
[HttpGet("public/business/{businessId}/menu")]
public async Task<IActionResult> GetPublicMenu(int businessId)
```

### **4. Public Venue Discovery API**
For mobile app and customer discovery:
```csharp
[AllowAnonymous]
[HttpGet("public/venues")]
public async Task<IActionResult> GetPublicVenues()

[AllowAnonymous]
[HttpGet("public/venues/{venueId}")]
public async Task<IActionResult> GetPublicVenueDetails(int venueId)
```

### **5. Order Management API**
Customer ordering system:
```csharp
[AllowAnonymous]
[HttpPost("public/orders")]
public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)

[AllowAnonymous]
[HttpGet("public/orders/{orderId}/status")]
public async Task<IActionResult> GetOrderStatus(int orderId)
```

## 🎯 **Priority 3: Staff Workflow APIs**

### **6. Waiter/Bartender APIs**
Staff-specific endpoints for daily operations:
```csharp
[Authorize(Roles = "Waiter,Bartender,Manager")]
[HttpGet("staff/orders/pending")]
public async Task<IActionResult> GetPendingOrders()

[Authorize(Roles = "Waiter,Bartender,Manager")]
[HttpPut("staff/orders/{orderId}/status")]
public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
```

### **7. Real-time Notifications (SignalR)**
For live order updates:
```csharp
public class OrderHub : Hub
{
    public async Task JoinBusinessGroup(string businessId)
    public async Task NotifyNewOrder(int businessId, Order order)
    public async Task NotifyOrderStatusChange(int businessId, int orderId, string status)
}
```

## 🎯 **Priority 4: Advanced Features**

### **8. Analytics & Reporting APIs**
Business intelligence for managers:
```csharp
[Authorize(Roles = "Manager,Owner")]
[HttpGet("business/analytics/sales")]
public async Task<IActionResult> GetSalesAnalytics([FromQuery] DateTime from, [FromQuery] DateTime to)

[Authorize(Roles = "Manager,Owner")]
[HttpGet("business/analytics/popular-items")]
public async Task<IActionResult> GetPopularItems()
```

### **9. Inventory Management**
Stock tracking and alerts:
```csharp
[Authorize(Roles = "Manager,Owner,Bartender")]
[HttpGet("business/inventory")]
public async Task<IActionResult> GetInventory()

[Authorize(Roles = "Manager,Owner,Bartender")]
[HttpPut("business/inventory/{itemId}")]
public async Task<IActionResult> UpdateInventoryLevel(int itemId, [FromBody] UpdateInventoryRequest request)
```

### **10. Payment Integration**
Payment processing APIs:
```csharp
[AllowAnonymous]
[HttpPost("payments/process")]
public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)

[AllowAnonymous]
[HttpGet("payments/{paymentId}/status")]
public async Task<IActionResult> GetPaymentStatus(string paymentId)
```

## 📋 **Implementation Order Recommendation**

### **Week 1: Core Business Fixes**
1. Fix Business Profile authorization (30 minutes)
2. Complete missing business CRUD operations (2-3 days)
3. Test all business management features (1 day)

### **Week 2: Customer APIs**
1. Public menu API for QR scanning (2 days)
2. Public venue discovery API (2 days)
3. Basic order creation API (1 day)

### **Week 3: Staff Operations**
1. Staff workflow APIs (3 days)
2. Order status management (2 days)

### **Week 4: Real-time & Advanced**
1. SignalR implementation (3 days)
2. Analytics APIs (2 days)

## 🎯 **Immediate Next Step**

**Fix Business Profile endpoint first** - it's a 5-minute change that will complete the business management functionality:

```csharp
// Change this:
[Authorize(Roles = "Owner")]
public async Task<IActionResult> GetProfile()

// To this:
[Authorize(Roles = "Manager,Owner")]
public async Task<IActionResult> GetProfile()
```

This will make the business dashboard 100% functional for Manager role!