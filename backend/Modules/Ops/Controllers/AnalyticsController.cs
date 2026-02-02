using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RivieraApi.Data;

namespace RivieraApi.Modules.Ops.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalyticsController : ControllerBase
{
    private readonly RivieraDbContext _context;

    public AnalyticsController(RivieraDbContext context)
    {
        _context = context;
    }

    // GET /api/analytics/dashboard?venueId=1&date=2024-01-26
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard([FromQuery] int venueId, [FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.UtcNow.Date;
        var startOfDay = targetDate;
        var endOfDay = targetDate.AddDays(1);

        // Get all orders for the day
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
            .Include(o => o.AssignedUser)
            .Where(o => o.VenueId == venueId && o.CreatedAt >= startOfDay && o.CreatedAt < endOfDay)
            .ToListAsync();

        // Overall stats
        var totalRevenue = orders.Sum(o => o.TotalAmount);
        var totalOrders = orders.Count;
        var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        var completedOrders = orders.Count(o => o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Paid);
        
        // Sunbed revenue (orders without a waiter creator)
        var sunbedRevenue = orders.Where(o => !o.UserId.HasValue).Sum(o => o.TotalAmount);
        var sunbedOrders = orders.Count(o => !o.UserId.HasValue);

        // Waiter performance - only orders they created (from their pad)
        var waiterStats = orders
            .Where(o => o.UserId.HasValue && o.User != null)
            .GroupBy(o => new { o.UserId, o.User!.FullName })
            .Select(g => new
            {
                userId = g.Key.UserId,
                name = g.Key.FullName,
                ordersCount = g.Count(),
                revenue = g.Sum(o => o.TotalAmount),
                avgOrderValue = g.Any() ? g.Average(o => o.TotalAmount) : 0,
                completedOrders = g.Count(o => o.Status == OrderStatus.Delivered || o.Status == OrderStatus.Paid)
            })
            .OrderByDescending(w => w.revenue)
            .ToList();

        // Top selling items
        var topItems = orders
            .SelectMany(o => o.OrderItems)
            .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
            .Select(g => new
            {
                productId = g.Key.ProductId,
                name = g.Key.Name,
                quantitySold = g.Sum(oi => oi.Quantity),
                revenue = g.Sum(oi => oi.UnitPriceAtTime * oi.Quantity)
            })
            .OrderByDescending(i => i.quantitySold)
            .Take(10)
            .ToList();

        // Hourly breakdown
        var hourlyStats = orders
            .GroupBy(o => o.CreatedAt.Hour)
            .Select(g => new
            {
                hour = g.Key,
                ordersCount = g.Count(),
                revenue = g.Sum(o => o.TotalAmount)
            })
            .OrderBy(h => h.hour)
            .ToList();

        // Recent orders (last 20)
        var recentOrders = orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(20)
            .Select(o => new
            {
                id = o.Id,
                totalAmount = o.TotalAmount,
                status = o.Status,
                createdAt = o.CreatedAt,
                waiterName = o.AssignedUser != null ? o.AssignedUser.FullName : "Unassigned",
                itemsCount = o.OrderItems.Count,
                items = o.OrderItems.Select(oi => new
                {
                    name = oi.Product.Name,
                    quantity = oi.Quantity
                }).ToList()
            })
            .ToList();

        return Ok(new
        {
            date = targetDate,
            overview = new
            {
                totalRevenue,
                totalOrders,
                avgOrderValue,
                completedOrders,
                completionRate = totalOrders > 0 ? (double)completedOrders / totalOrders * 100 : 0,
                sunbedRevenue,
                sunbedOrders,
                waiterRevenue = totalRevenue - sunbedRevenue,
                waiterOrders = totalOrders - sunbedOrders
            },
            waiterPerformance = waiterStats,
            topSellingItems = topItems,
            hourlyBreakdown = hourlyStats,
            recentOrders
        });
    }
}
