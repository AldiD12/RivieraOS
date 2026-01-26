using Microsoft.EntityFrameworkCore;
using RivieraApi.Data;
using RivieraApi.Modules.Ops.DTOs;
using RivieraApi.Modules.Catalog;

namespace RivieraApi.Modules.Ops.Services;

public class OrderService
{
    private readonly RivieraDbContext _context;

    public OrderService(RivieraDbContext context)
    {
        _context = context;
    }

    public async Task<Order> CreateOrderAsync(CreateOrderDto dto)
    {
        // Calculate total
        var totalAmount = dto.Items.Sum(item => item.Price * item.Quantity);

        // Create order
        var order = new Order
        {
            VenueId = dto.VenueId,
            UserId = dto.UserId,
            ProductId = dto.ProductId, // For sunbed orders
            TotalAmount = totalAmount,
            Status = OrderStatus.Pending,
            PaymentMethod = dto.PaymentMethod,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Create order items
        foreach (var itemDto in dto.Items)
        {
            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = itemDto.ProductId,
                Quantity = itemDto.Quantity,
                UnitPriceAtTime = itemDto.Price, // Use Price from DTO
                CreatedAt = DateTime.UtcNow
            };
            _context.OrderItems.Add(orderItem);
        }

        await _context.SaveChangesAsync();

        // If this order includes a sunbed, mark it as occupied
        if (dto.ProductId.HasValue)
        {
            var sunbed = await _context.Products.FindAsync(dto.ProductId.Value);
            if (sunbed != null && sunbed.UnitCode != null) // It's a sunbed
            {
                sunbed.Status = ProductStatus.Occupied;
                sunbed.IsAvailable = false;
                sunbed.CurrentGuestName = dto.GuestName;
                sunbed.CurrentGuestName = dto.GuestName ?? "Guest";
                await _context.SaveChangesAsync();
            }
        }

        // Load relationships for return
        await _context.Entry(order)
            .Collection(o => o.OrderItems)
            .Query()
            .Include(oi => oi.Product)
            .LoadAsync();

        return order;
    }

    public async Task<List<Order>> GetOrdersAsync(int? venueId = null, OrderStatus? status = null)
    {
        var query = _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.Venue)
            .Include(o => o.Product)
            .Include(o => o.AssignedUser)
            .AsQueryable();

        if (venueId.HasValue)
        {
            query = query.Where(o => o.VenueId == venueId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
    }

    public async Task<Order?> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return null;

        order.Status = newStatus;
        
        if (newStatus == OrderStatus.Delivered || newStatus == OrderStatus.Paid)
        {
            order.CompletedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> AssignOrderAsync(int orderId, int userId)
    {
        var order = await _context.Orders
            .Include(o => o.AssignedUser)
            .FirstOrDefaultAsync(o => o.Id == orderId);
            
        if (order == null) return null;

        order.AssignedUserId = userId;
        order.AssignedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync();
        return order;
    }
}
