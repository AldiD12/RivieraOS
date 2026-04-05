using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/[controller]")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Policy = "SuperAdmin")]
    public class EventsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public EventsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/events?page=1&pageSize=20&venueId=1&upcoming=true
        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<EventListItemDto>>> GetEvents(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] int? venueId = null,
            [FromQuery] int? businessId = null,
            [FromQuery] bool? upcoming = null,
            [FromQuery] string? search = null)
        {
            var query = _context.ScheduledEvents
                .Include(e => e.Venue)
                .Include(e => e.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted)
                .AsQueryable();

            if (venueId.HasValue)
            {
                query = query.Where(e => e.VenueId == venueId.Value);
            }

            if (businessId.HasValue)
            {
                query = query.Where(e => e.BusinessId == businessId.Value);
            }

            if (upcoming == true)
            {
                query = query.Where(e => e.StartTime >= DateTime.UtcNow);
            }
            else if (upcoming == false)
            {
                query = query.Where(e => e.StartTime < DateTime.UtcNow);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(e =>
                    e.Name.ToLower().Contains(search) ||
                    (e.Description != null && e.Description.ToLower().Contains(search)));
            }

            var totalCount = await query.CountAsync();

            var events = await query
                .OrderByDescending(e => e.StartTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EventListItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    FlyerImageUrl = e.FlyerImageUrl,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsTicketed = e.IsTicketed,
                    TicketPrice = e.TicketPrice,
                    MinimumSpend = e.MinimumSpend,
                    MaxGuests = e.MaxGuests,
                    Vibe = e.Vibe,
                    EntryType = e.EntryType,
                    IsPublished = e.IsPublished,
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    BusinessName = e.Business != null ? e.Business.BrandName ?? e.Business.RegisteredName : null,
                    BookingCount = e.EventBookings.Count
                })
                .ToListAsync();

            return Ok(new PaginatedResponse<EventListItemDto>
            {
                Items = events,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            });
        }

        // GET: api/superadmin/events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDetailDto>> GetEvent(int id)
        {
            var evt = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .Include(e => e.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evt == null)
            {
                return NotFound();
            }

            return Ok(new EventDetailDto
            {
                Id = evt.Id,
                Name = evt.Name,
                Description = evt.Description,
                FlyerImageUrl = evt.FlyerImageUrl,
                StartTime = evt.StartTime,
                EndTime = evt.EndTime,
                IsTicketed = evt.IsTicketed,
                TicketPrice = evt.TicketPrice,
                MinimumSpend = evt.MinimumSpend,
                MaxGuests = evt.MaxGuests,
                Vibe = evt.Vibe,
                EntryType = evt.EntryType,
                IsPublished = evt.IsPublished,
                CreatedAt = evt.CreatedAt,
                VenueId = evt.VenueId,
                VenueName = evt.Venue?.Name,
                BusinessId = evt.BusinessId,
                BusinessName = evt.Business?.BrandName ?? evt.Business?.RegisteredName,
                BookingCount = evt.EventBookings.Count,
                TotalGuests = evt.EventBookings.Sum(b => b.GuestCount)
            });
        }

        // POST: api/superadmin/events
        [HttpPost]
        public async Task<ActionResult<EventDetailDto>> CreateEvent([FromQuery] int businessId, CreateEventRequest request)
        {
            // Verify business exists
            var business = await _context.Businesses
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.Id == businessId && !b.IsDeleted);

            if (business == null)
            {
                return BadRequest("Business not found");
            }

            // If VenueId provided, verify it exists and belongs to this business
            Venue? venue = null;
            if (request.VenueId.HasValue)
            {
                venue = await _context.Venues
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(v => v.Id == request.VenueId.Value && v.BusinessId == businessId && !v.IsDeleted);

                if (venue == null)
                {
                    return BadRequest("Venue not found");
                }
            }

            var evt = new ScheduledEvent
            {
                Name = request.Name,
                Description = request.Description,
                FlyerImageUrl = request.FlyerImageUrl,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                IsTicketed = request.IsTicketed,
                TicketPrice = request.TicketPrice,
                MinimumSpend = request.MinimumSpend,
                MaxGuests = request.MaxGuests,
                Vibe = request.Vibe,
                EntryType = request.EntryType,
                IsPublished = request.IsPublished,
                VenueId = request.VenueId,
                BusinessId = businessId,
                CreatedAt = DateTime.UtcNow
            };

            _context.ScheduledEvents.Add(evt);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = evt.Id }, new EventDetailDto
            {
                Id = evt.Id,
                Name = evt.Name,
                Description = evt.Description,
                FlyerImageUrl = evt.FlyerImageUrl,
                StartTime = evt.StartTime,
                EndTime = evt.EndTime,
                IsTicketed = evt.IsTicketed,
                TicketPrice = evt.TicketPrice,
                MinimumSpend = evt.MinimumSpend,
                MaxGuests = evt.MaxGuests,
                Vibe = evt.Vibe,
                EntryType = evt.EntryType,
                IsPublished = evt.IsPublished,
                CreatedAt = evt.CreatedAt,
                VenueId = evt.VenueId,
                VenueName = venue?.Name,
                BusinessId = businessId,
                BusinessName = business.BrandName ?? business.RegisteredName,
                BookingCount = 0,
                TotalGuests = 0
            });
        }

        // PUT: api/superadmin/events/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, UpdateEventRequest request)
        {
            var evt = await _context.ScheduledEvents
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            if (evt == null)
            {
                return NotFound();
            }

            // If VenueId provided and changing, verify new venue exists
            if (request.VenueId.HasValue && request.VenueId != evt.VenueId)
            {
                var venueExists = await _context.Venues
                    .IgnoreQueryFilters()
                    .AnyAsync(v => v.Id == request.VenueId.Value && !v.IsDeleted);

                if (!venueExists)
                {
                    return BadRequest("Venue not found");
                }
            }

            evt.Name = request.Name;
            evt.Description = request.Description;
            evt.FlyerImageUrl = request.FlyerImageUrl;
            evt.StartTime = request.StartTime;
            evt.EndTime = request.EndTime;
            evt.IsTicketed = request.IsTicketed;
            evt.TicketPrice = request.TicketPrice;
            evt.MinimumSpend = request.MinimumSpend;
            evt.MaxGuests = request.MaxGuests;
            evt.Vibe = request.Vibe;
            evt.EntryType = request.EntryType;
            evt.IsPublished = request.IsPublished;
            evt.VenueId = request.VenueId;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/superadmin/events/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var evt = await _context.ScheduledEvents
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            if (evt == null)
            {
                return NotFound();
            }

            evt.IsDeleted = true;
            evt.DeletedAt = DateTime.UtcNow;
            evt.IsPublished = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/events/5/publish
        [HttpPost("{id}/publish")]
        public async Task<IActionResult> PublishEvent(int id)
        {
            var evt = await _context.ScheduledEvents
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            if (evt == null)
            {
                return NotFound();
            }

            evt.IsPublished = true;
            await _context.SaveChangesAsync();

            return Ok(new { evt.Id, evt.IsPublished });
        }

        // POST: api/superadmin/events/5/unpublish
        [HttpPost("{id}/unpublish")]
        public async Task<IActionResult> UnpublishEvent(int id)
        {
            var evt = await _context.ScheduledEvents
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            if (evt == null)
            {
                return NotFound();
            }

            evt.IsPublished = false;
            await _context.SaveChangesAsync();

            return Ok(new { evt.Id, evt.IsPublished });
        }

        // POST: api/superadmin/events/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreEvent(int id)
        {
            var evt = await _context.ScheduledEvents
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == id && e.IsDeleted);

            if (evt == null)
            {
                return NotFound();
            }

            evt.IsDeleted = false;
            evt.DeletedAt = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
