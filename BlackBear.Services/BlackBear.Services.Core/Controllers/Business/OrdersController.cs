using BlackBear.Services.Core.Attributes;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Hubs;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/[controller]")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Policy = "Bartender")]
    [RequireFeature(nameof(BusinessFeature.HasTableOrdering))]
    public class OrdersController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHubContext<BeachHub> _hubContext;

        public OrdersController(BlackBearDbContext context, ICurrentUserService currentUserService, IHubContext<BeachHub> hubContext)
        {
            _context = context;
            _currentUserService = currentUserService;
            _hubContext = hubContext;
        }

        // GET: api/business/orders?venueId=1&status=Pending&zoneId=1
        [HttpGet]
        public async Task<ActionResult<List<BizOrderListItemDto>>> GetOrders(
            [FromQuery] int? venueId = null,
            [FromQuery] string? status = null,
            [FromQuery] int? zoneId = null)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var query = _context.Orders
                .Include(o => o.Venue)
                .Include(o => o.VenueZone)
                .Include(o => o.OrderItems)
                .Include(o => o.ZoneUnit)
                .Where(o => o.BusinessId == businessId.Value)
                .AsQueryable();

            if (venueId.HasValue)
            {
                query = query.Where(o => o.VenueId == venueId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (zoneId.HasValue)
            {
                query = query.Where(o => o.VenueZoneId == zoneId.Value);
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new BizOrderListItemDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    UnitCode = o.ZoneUnit != null ? o.ZoneUnit.UnitCode : null,
                    Status = o.Status,
                    CustomerName = o.CustomerName,
                    Notes = o.Notes,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    VenueId = o.VenueId,
                    VenueName = o.Venue != null ? o.Venue.Name : string.Empty,
                    ZoneId = o.VenueZoneId,
                    ZoneName = o.VenueZone != null ? o.VenueZone.Name : string.Empty,
                    ItemCount = o.OrderItems.Count,
                    TotalAmount = o.OrderItems.Sum(i => i.Quantity * i.UnitPrice),
                    Items = o.OrderItems.Select(i => new BizOrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        Notes = i.Notes
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/business/orders/active?venueId=1
        [HttpGet("active")]
        public async Task<ActionResult<List<BizOrderListItemDto>>> GetActiveOrders([FromQuery] int? venueId = null)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var activeStatuses = new[] { "Pending", "Preparing", "Ready" };

            var query = _context.Orders
                .Include(o => o.Venue)
                .Include(o => o.VenueZone)
                .Include(o => o.OrderItems)
                .Include(o => o.ZoneUnit)
                .Where(o => o.BusinessId == businessId.Value && activeStatuses.Contains(o.Status))
                .AsQueryable();

            if (venueId.HasValue)
            {
                query = query.Where(o => o.VenueId == venueId.Value);
            }

            var orders = await query
                .OrderBy(o => o.CreatedAt) // Oldest first for active orders
                .Select(o => new BizOrderListItemDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    UnitCode = o.ZoneUnit != null ? o.ZoneUnit.UnitCode : null,
                    Status = o.Status,
                    CustomerName = o.CustomerName,
                    Notes = o.Notes,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    VenueId = o.VenueId,
                    VenueName = o.Venue != null ? o.Venue.Name : string.Empty,
                    ZoneId = o.VenueZoneId,
                    ZoneName = o.VenueZone != null ? o.VenueZone.Name : string.Empty,
                    ItemCount = o.OrderItems.Count,
                    TotalAmount = o.OrderItems.Sum(i => i.Quantity * i.UnitPrice),
                    Items = o.OrderItems.Select(i => new BizOrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        Notes = i.Notes
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/business/orders/zone/5
        [HttpGet("zone/{zoneId}")]
        public async Task<ActionResult<List<BizOrderListItemDto>>> GetOrdersByZone(int zoneId)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Verify zone belongs to business
            var zone = await _context.VenueZones
                .Include(z => z.Venue)
                .FirstOrDefaultAsync(z => z.Id == zoneId && z.Venue != null && z.Venue.BusinessId == businessId.Value);

            if (zone == null)
            {
                return NotFound("Zone not found");
            }

            var orders = await _context.Orders
                .Include(o => o.Venue)
                .Include(o => o.VenueZone)
                .Include(o => o.OrderItems)
                .Include(o => o.ZoneUnit)
                .Where(o => o.VenueZoneId == zoneId && o.BusinessId == businessId.Value)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new BizOrderListItemDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    UnitCode = o.ZoneUnit != null ? o.ZoneUnit.UnitCode : null,
                    Status = o.Status,
                    CustomerName = o.CustomerName,
                    Notes = o.Notes,
                    CreatedAt = o.CreatedAt,
                    UpdatedAt = o.UpdatedAt,
                    VenueId = o.VenueId,
                    VenueName = o.Venue != null ? o.Venue.Name : string.Empty,
                    ZoneId = o.VenueZoneId,
                    ZoneName = o.VenueZone != null ? o.VenueZone.Name : string.Empty,
                    ItemCount = o.OrderItems.Count,
                    TotalAmount = o.OrderItems.Sum(i => i.Quantity * i.UnitPrice),
                    Items = o.OrderItems.Select(i => new BizOrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        Notes = i.Notes
                    }).ToList()
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/business/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BizOrderDetailDto>> GetOrder(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var order = await _context.Orders
                .Include(o => o.Venue)
                .Include(o => o.VenueZone)
                .Include(o => o.OrderItems)
                .Include(o => o.HandledByUser)
                .FirstOrDefaultAsync(o => o.Id == id && o.BusinessId == businessId.Value);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(new BizOrderDetailDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                CustomerName = order.CustomerName,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                CompletedAt = order.CompletedAt,
                VenueId = order.VenueId,
                VenueName = order.Venue?.Name ?? string.Empty,
                ZoneId = order.VenueZoneId,
                ZoneName = order.VenueZone?.Name ?? string.Empty,
                ZoneType = order.VenueZone?.ZoneType,
                HandledByUserId = order.HandledByUserId,
                HandledByUserName = order.HandledByUser?.FullName,
                Items = order.OrderItems.Select(i => new BizOrderItemDto
                {
                    Id = i.Id,
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice,
                    Notes = i.Notes
                }).ToList(),
                TotalAmount = order.OrderItems.Sum(i => i.Quantity * i.UnitPrice)
            });
        }

        // PUT: api/business/orders/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, BizUpdateOrderStatusRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            var userId = _currentUserService.UserId;

            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.BusinessId == businessId.Value);

            if (order == null)
            {
                return NotFound();
            }

            // Validate status transition
            var validTransitions = new Dictionary<string, string[]>
            {
                { "Pending", new[] { "Preparing", "Cancelled" } },
                { "Preparing", new[] { "Ready", "Cancelled" } },
                { "Ready", new[] { "Delivered", "Cancelled" } },
                { "Delivered", Array.Empty<string>() },
                { "Cancelled", Array.Empty<string>() }
            };

            if (!validTransitions.TryGetValue(order.Status, out var allowedStatuses) ||
                !allowedStatuses.Contains(request.Status))
            {
                return BadRequest($"Cannot transition from '{order.Status}' to '{request.Status}'");
            }

            var oldStatus = order.Status;
            order.Status = request.Status;
            order.UpdatedAt = DateTime.UtcNow;

            // Set handler if not already set
            if (!order.HandledByUserId.HasValue && !string.IsNullOrEmpty(userId) && int.TryParse(userId, out var userIdInt))
            {
                order.HandledByUserId = userIdInt;
            }

            // Set completion time for final states
            if (request.Status == "Delivered" || request.Status == "Cancelled")
            {
                order.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("OrderStatusChanged", new
            {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                oldStatus,
                newStatus = order.Status,
                updatedAt = order.UpdatedAt
            });

            return Ok(new { order.Id, order.Status, order.UpdatedAt });
        }
    }
}
