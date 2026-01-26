using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RivieraApi.Hubs;
using RivieraApi.Modules.Ops.Services;
using RivieraApi.Modules.Ops.DTOs;
using RivieraApi.Modules.Catalog;

namespace RivieraApi.Modules.Ops.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly IHubContext<BeachHub> _hubContext;

    public OrderController(OrderService orderService, IHubContext<BeachHub> hubContext)
    {
        _orderService = orderService;
        _hubContext = hubContext;
    }

    // POST /api/order - FluentValidation automatically validates CreateOrderDto
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        // If validation fails, ModelState will contain errors and return 400 automatically
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var order = await _orderService.CreateOrderAsync(dto);

            // Broadcast to Bar Display
            await _hubContext.Clients.All.SendAsync("NewOrder", new
            {
                orderId = order.Id,
                venueId = order.VenueId,
                sunbedCode = order.Product?.UnitCode,
                totalAmount = order.TotalAmount,
                items = order.OrderItems.Select(oi => new
                {
                    name = oi.Product.Name,
                    quantity = oi.Quantity,
                    price = oi.UnitPriceAtTime
                }).ToList(),
                createdAt = order.CreatedAt
            });

            // If sunbed was occupied, broadcast layout update
            if (order.ProductId.HasValue)
            {
                await _hubContext.Clients.All.SendAsync("LayoutUpdate", new
                {
                    productId = order.ProductId.Value,
                    status = ProductStatus.Occupied,
                    isAvailable = false
                });
            }

            return Ok(new OrderResponseDto
            {
                Id = order.Id,
                VenueId = order.VenueId,
                SunbedCode = order.Product?.UnitCode,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDto
                {
                    Id = oi.Id,
                    ProductId = oi.ProductId,
                    Name = oi.Product.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPriceAtTime,
                    TotalPrice = oi.UnitPriceAtTime * oi.Quantity
                }).ToList()
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Failed to create order", error = ex.Message });
        }
    }

    // GET /api/order
    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] int? venueId, [FromQuery] OrderStatus? status)
    {
        var orders = await _orderService.GetOrdersAsync(venueId, status);

        return Ok(orders.Select(o => new
        {
            o.Id,
            o.VenueId,
            venueName = o.Venue.Name,
            sunbedCode = o.Product?.UnitCode,
            o.TotalAmount,
            o.Status,
            o.PaymentMethod,
            o.CreatedAt,
            assignedUserId = o.AssignedUserId,
            assignedUserName = o.AssignedUser?.FullName,
            assignedAt = o.AssignedAt,
            items = o.OrderItems.Select(oi => new
            {
                name = oi.Product.Name,
                quantity = oi.Quantity,
                price = oi.UnitPriceAtTime
            }).ToList()
        }));
    }

    // PATCH /api/order/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _orderService.UpdateOrderStatusAsync(id, request.Status);
        
        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        // Broadcast status update
        await _hubContext.Clients.All.SendAsync("OrderStatusUpdated", new
        {
            orderId = id,
            status = request.Status
        });

        return Ok(new
        {
            message = "Order status updated",
            orderId = id,
            status = request.Status
        });
    }

    // PATCH /api/order/{id}/assign
    [HttpPatch("{id}/assign")]
    public async Task<IActionResult> AssignOrder(int id, [FromBody] AssignOrderRequest request)
    {
        var order = await _orderService.AssignOrderAsync(id, request.UserId);
        
        if (order == null)
        {
            return NotFound(new { message = "Order not found" });
        }

        // Broadcast assignment update
        await _hubContext.Clients.All.SendAsync("OrderAssigned", new
        {
            orderId = id,
            assignedUserId = request.UserId,
            assignedUserName = order.AssignedUser?.FullName
        });

        return Ok(new
        {
            message = "Order assigned successfully",
            orderId = id,
            assignedUserId = request.UserId,
            assignedUserName = order.AssignedUser?.FullName
        });
    }
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
}

public class AssignOrderRequest
{
    public int UserId { get; set; }
}
