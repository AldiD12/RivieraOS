using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    [EnableRateLimiting("public")]
    public class OrdersController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly IHubContext<BeachHub> _hubContext;

        public OrdersController(BlackBearDbContext context, IHubContext<BeachHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/public/orders/menu?venueId=1
        [HttpGet("menu")]
        public async Task<ActionResult<List<PublicMenuCategoryDto>>> GetMenu([FromQuery] int venueId)
        {
            // Verify venue exists
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            // Feature gate: check if business has table ordering enabled
            var hasOrdering = await _context.BusinessFeatures
                .AnyAsync(bf => bf.BusinessId == venue.BusinessId && bf.HasTableOrdering);
            if (!hasOrdering)
            {
                return NotFound("Digital ordering is not available for this venue");
            }

            // Get categories with products for this business, excluding venue-specific exclusions
            var excludedCategoryIds = await _context.CategoryVenueExclusions
                .Where(e => e.VenueId == venueId)
                .Select(e => e.CategoryId)
                .ToListAsync();

            var excludedProductIds = await _context.ProductVenueExclusions
                .Where(e => e.VenueId == venueId)
                .Select(e => e.ProductId)
                .ToListAsync();

            var categories = await _context.Categories
                .IgnoreQueryFilters()
                .Where(c => !c.IsDeleted && c.IsActive && c.BusinessId == venue.BusinessId)
                .Where(c => !excludedCategoryIds.Contains(c.Id))
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .Select(c => new PublicMenuCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    BusinessName = c.Business != null ? (c.Business.BrandName ?? c.Business.RegisteredName) : null,
                    Products = c.Products
                        .Where(p => !p.IsDeleted && p.IsAvailable && !excludedProductIds.Contains(p.Id))
                        .OrderBy(p => p.Name)
                        .Select(p => new PublicMenuItemDto
                        {
                            Id = p.Id,
                            Name = p.Name,
                            Description = p.Description,
                            ImageUrl = p.ImageUrl,
                            Price = p.Price,
                            OldPrice = p.OldPrice,
                            IsAlcohol = p.IsAlcohol,
                            CategoryName = c.Name
                        })
                        .ToList()
                })
                .ToListAsync();

            // Filter out empty categories
            categories = categories.Where(c => c.Products.Any()).ToList();

            return Ok(categories);
        }

        // POST: api/public/orders
        [HttpPost]
        public async Task<ActionResult<PublicOrderConfirmationDto>> CreateOrder(PublicCreateOrderRequest request)
        {
            // Verify venue exists
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == request.VenueId && !v.IsDeleted);

            if (venue == null)
            {
                return BadRequest("Venue not found");
            }

            // Feature gate: check if business has table ordering enabled
            var hasOrdering = await _context.BusinessFeatures
                .AnyAsync(bf => bf.BusinessId == venue.BusinessId && bf.HasTableOrdering);
            if (!hasOrdering)
            {
                return BadRequest("Digital ordering is not available for this venue");
            }

            // Verify zone exists and belongs to venue
            var zone = await _context.VenueZones
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(z => z.Id == request.ZoneId && z.VenueId == request.VenueId && !z.IsDeleted);

            if (zone == null)
            {
                return BadRequest("Zone not found or doesn't belong to this venue");
            }

            // Verify all products exist and are available
            var productIds = request.Items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _context.Products
                .IgnoreQueryFilters()
                .Where(p => productIds.Contains(p.Id) && !p.IsDeleted && p.IsAvailable && p.BusinessId == venue.BusinessId)
                .ToDictionaryAsync(p => p.Id);

            if (products.Count != productIds.Count)
            {
                var missingIds = productIds.Where(id => !products.ContainsKey(id)).ToList();
                return BadRequest($"Products not found or unavailable: {string.Join(", ", missingIds)}");
            }

            // Check product venue exclusions
            var excludedProductIds = await _context.ProductVenueExclusions
                .Where(e => e.VenueId == request.VenueId && productIds.Contains(e.ProductId))
                .Select(e => e.ProductId)
                .ToListAsync();

            if (excludedProductIds.Any())
            {
                return BadRequest($"Products not available at this venue: {string.Join(", ", excludedProductIds)}");
            }

            // Generate order number (sequential per venue per day)
            var today = DateTime.UtcNow.Date;
            var orderCount = await _context.Orders
                .IgnoreQueryFilters()
                .CountAsync(o => o.VenueId == request.VenueId && o.CreatedAt >= today);

            var orderNumber = (orderCount + 1).ToString("D3"); // e.g., "001", "002"

            // Get unit code if a specific unit was provided
            string? unitCode = null;
            if (request.ZoneUnitId.HasValue)
            {
                var unit = await _context.ZoneUnits
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(u => u.Id == request.ZoneUnitId.Value && u.VenueId == request.VenueId);
                unitCode = unit?.UnitCode;
            }

            // Create order
            var order = new Order
            {
                OrderNumber = orderNumber,
                Status = "Pending",
                Notes = request.Notes,
                CustomerName = request.CustomerName,
                VenueId = request.VenueId,
                VenueZoneId = request.ZoneId,
                BusinessId = venue.BusinessId,
                ZoneUnitId = request.ZoneUnitId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Create order items
            foreach (var item in request.Items)
            {
                var product = products[item.ProductId];
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    ProductName = product.Name,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    Notes = item.Notes,
                    CreatedAt = DateTime.UtcNow
                };
                _context.OrderItems.Add(orderItem);
            }

            await _context.SaveChangesAsync();

            // Broadcast new order to connected clients
            await _hubContext.Clients.All.SendAsync("NewOrder", new
            {
                id = order.Id,
                orderNumber = order.OrderNumber,
                status = order.Status,
                venueId = order.VenueId,
                zoneName = zone.Name,
                unitCode,
                customerName = order.CustomerName,
                items = request.Items.Select(i => new
                {
                    productName = products[i.ProductId].Name,
                    quantity = i.Quantity,
                    price = products[i.ProductId].Price
                }),
                totalAmount = request.Items.Sum(i => products[i.ProductId].Price * i.Quantity),
                createdAt = order.CreatedAt
            });

            // Build response
            var response = new PublicOrderConfirmationDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                CustomerName = order.CustomerName,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                ZoneName = zone.Name,
                VenueName = venue.Name,
                Items = request.Items.Select(i => new PublicOrderItemDto
                {
                    ProductName = products[i.ProductId].Name,
                    Quantity = i.Quantity,
                    UnitPrice = products[i.ProductId].Price,
                    Notes = i.Notes
                }).ToList()
            };
            response.TotalAmount = response.Items.Sum(i => i.Subtotal);

            return CreatedAtAction(nameof(GetOrderStatus), new { orderNumber = order.OrderNumber, venueId = request.VenueId }, response);
        }

        // GET: api/public/orders/{orderNumber}?venueId=1
        [HttpGet("{orderNumber}")]
        public async Task<ActionResult<PublicOrderStatusDto>> GetOrderStatus(string orderNumber, [FromQuery] int venueId)
        {
            var order = await _context.Orders
                .IgnoreQueryFilters()
                .Include(o => o.VenueZone)
                .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber && o.VenueId == venueId && !o.IsDeleted);

            if (order == null)
            {
                return NotFound("Order not found");
            }

            return Ok(new PublicOrderStatusDto
            {
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                ZoneName = order.VenueZone?.Name ?? string.Empty
            });
        }
    }
}
