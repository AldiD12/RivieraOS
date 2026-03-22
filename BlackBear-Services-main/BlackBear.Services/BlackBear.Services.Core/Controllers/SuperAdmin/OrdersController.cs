using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class OrdersController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public OrdersController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/orders?page=1&pageSize=20&venueId=1&businessId=1&status=Pending
        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<OrderListItemDto>>> GetOrders(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] int? venueId = null,
            [FromQuery] int? businessId = null,
            [FromQuery] int? zoneId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? search = null)
        {
            var query = _context.Orders
                .Include(o => o.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(o => o.VenueZone)
                .Include(o => o.OrderItems)
                .IgnoreQueryFilters()
                .Where(o => !o.IsDeleted)
                .AsQueryable();

            if (venueId.HasValue)
            {
                query = query.Where(o => o.VenueId == venueId.Value);
            }

            if (businessId.HasValue)
            {
                query = query.Where(o => o.BusinessId == businessId.Value);
            }

            if (zoneId.HasValue)
            {
                query = query.Where(o => o.VenueZoneId == zoneId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(o =>
                    o.OrderNumber.ToLower().Contains(search) ||
                    (o.CustomerName != null && o.CustomerName.ToLower().Contains(search)));
            }

            var totalCount = await query.CountAsync();

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderListItemDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    Status = o.Status,
                    CustomerName = o.CustomerName,
                    CreatedAt = o.CreatedAt,
                    CompletedAt = o.CompletedAt,
                    VenueId = o.VenueId,
                    VenueName = o.Venue != null ? o.Venue.Name : null,
                    ZoneId = o.VenueZoneId,
                    ZoneName = o.VenueZone != null ? o.VenueZone.Name : null,
                    BusinessId = o.BusinessId,
                    BusinessName = o.Venue != null && o.Venue.Business != null
                        ? o.Venue.Business.BrandName ?? o.Venue.Business.RegisteredName
                        : null,
                    ItemCount = o.OrderItems.Count,
                    TotalAmount = o.OrderItems.Sum(i => i.Quantity * i.UnitPrice)
                })
                .ToListAsync();

            return Ok(new PaginatedResponse<OrderListItemDto>
            {
                Items = orders,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            });
        }

        // GET: api/superadmin/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDetailDto>> GetOrder(int id)
        {
            var order = await _context.Orders
                .Include(o => o.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(o => o.VenueZone)
                .Include(o => o.OrderItems)
                .Include(o => o.HandledByUser)
                .IgnoreQueryFilters()
                .Where(o => !o.IsDeleted)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null)
            {
                return NotFound();
            }

            return Ok(new OrderDetailDto
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
                VenueName = order.Venue?.Name,
                ZoneId = order.VenueZoneId,
                ZoneName = order.VenueZone?.Name,
                ZoneType = order.VenueZone?.ZoneType,
                BusinessId = order.BusinessId,
                BusinessName = order.Venue?.Business?.BrandName ?? order.Venue?.Business?.RegisteredName,
                HandledByUserId = order.HandledByUserId,
                HandledByUserName = order.HandledByUser?.FullName,
                Items = order.OrderItems.Select(i => new OrderItemDto
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

        // DELETE: api/superadmin/orders/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);

            if (order == null)
            {
                return NotFound();
            }

            order.IsDeleted = true;
            order.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/orders/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreOrder(int id)
        {
            var order = await _context.Orders
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(o => o.Id == id && o.IsDeleted);

            if (order == null)
            {
                return NotFound();
            }

            order.IsDeleted = false;
            order.DeletedAt = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
