# Missing Azure API Endpoints

## Critical Endpoints Needed for Full Frontend Integration

### 1. Orders System
```csharp
// Orders Controller
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    
    [HttpGet("active/{venueId}")]
    public async Task<IActionResult> GetActiveOrders(int venueId)
    
    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateStatusRequest request)
}
```

### 2. Discovery/Venue Status
```csharp
// Discovery Controller  
[Route("api/[controller]")]
public class DiscoveryController : ControllerBase
{
    [HttpGet("{venueId}/status")]
    public async Task<IActionResult> GetVenueStatus(int venueId)
    
    [HttpGet("{venueId}/zones")]
    public async Task<IActionResult> GetVenueZones(int venueId)
}
```

### 3. Menu/Products
```csharp
// Products Controller (extend existing)
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    [HttpGet("venue/{venueId}")]
    public async Task<IActionResult> GetMenuByVenue(int venueId)
    
    [HttpPatch("{id}/availability")]
    public async Task<IActionResult> ToggleAvailability(int id)
}
```

### 4. Reports & Analytics
```csharp
// Reports Controller
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    [HttpGet("daily")]
    public async Task<IActionResult> GetDailyReport()
    
    [HttpGet("tables/status")]
    public async Task<IActionResult> GetTablesStatus()
}
```

### 5. SignalR Hub
```csharp
// BeachHub for real-time updates
public class BeachHub : Hub
{
    public async Task JoinVenue(string venueId)
    public async Task OrderStatusChanged(int orderId, string status)
    public async Task NewOrder(object orderData)
}
```

## Current Workaround Status

The frontend currently falls back to:
- ✅ Mock data for missing endpoints
- ✅ Azure API for auth and businesses
- ⚠️ Limited functionality without orders/discovery endpoints

## Priority Implementation Order

1. **HIGH**: Orders system (core functionality)
2. **HIGH**: Products/Menu endpoints  
3. **MEDIUM**: Discovery/venue status
4. **MEDIUM**: Reports & analytics
5. **LOW**: SignalR real-time features