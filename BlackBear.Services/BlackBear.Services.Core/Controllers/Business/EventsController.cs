using BlackBear.Services.Core.Attributes;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/[controller]")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Policy = "Manager")]
    [RequireFeature(nameof(BusinessFeature.HasEvents))]
    public class EventsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public EventsController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/events?venueId=1&upcoming=true
        [HttpGet]
        public async Task<ActionResult<List<BizEventListItemDto>>> GetEvents(
            [FromQuery] int? venueId = null,
            [FromQuery] bool? upcoming = null)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var query = _context.ScheduledEvents
                .Include(e => e.Venue)
                .Include(e => e.EventBookings)
                .Where(e => e.Venue != null && e.Venue.BusinessId == businessId.Value)
                .AsQueryable();

            if (venueId.HasValue)
            {
                query = query.Where(e => e.VenueId == venueId.Value);
            }

            if (upcoming == true)
            {
                query = query.Where(e => e.StartTime >= DateTime.UtcNow);
            }
            else if (upcoming == false)
            {
                query = query.Where(e => e.StartTime < DateTime.UtcNow);
            }

            var events = await query
                .OrderByDescending(e => e.StartTime)
                .Select(e => new BizEventListItemDto
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
                    BookingCount = e.EventBookings.Count
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/business/events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BizEventDetailDto>> GetEvent(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var evt = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .Include(e => e.EventBookings)
                .FirstOrDefaultAsync(e => e.Id == id && e.Venue != null && e.Venue.BusinessId == businessId.Value);

            if (evt == null)
            {
                return NotFound();
            }

            return Ok(new BizEventDetailDto
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
                BookingCount = evt.EventBookings.Count,
                TotalGuests = evt.EventBookings.Sum(b => b.GuestCount)
            });
        }

        // POST: api/business/events
        [HttpPost]
        public async Task<ActionResult<BizEventDetailDto>> CreateEvent(BizCreateEventRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Verify venue belongs to this business
            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == request.VenueId);

            if (venue == null)
            {
                return BadRequest("Venue not found or doesn't belong to your business");
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
                CreatedAt = DateTime.UtcNow
            };

            _context.ScheduledEvents.Add(evt);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEvent), new { id = evt.Id }, new BizEventDetailDto
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
                VenueName = venue.Name,
                BookingCount = 0,
                TotalGuests = 0
            });
        }

        // PUT: api/business/events/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, BizUpdateEventRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var evt = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .FirstOrDefaultAsync(e => e.Id == id && e.Venue != null && e.Venue.BusinessId == businessId.Value);

            if (evt == null)
            {
                return NotFound();
            }

            // If venue is changing, verify new venue belongs to this business
            if (request.VenueId != evt.VenueId)
            {
                var newVenue = await _context.Venues.AnyAsync(v => v.Id == request.VenueId);
                if (!newVenue)
                {
                    return BadRequest("Venue not found or doesn't belong to your business");
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

        // DELETE: api/business/events/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var evt = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .FirstOrDefaultAsync(e => e.Id == id && e.Venue != null && e.Venue.BusinessId == businessId.Value);

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

        // POST: api/business/events/5/publish
        [HttpPost("{id}/publish")]
        public async Task<IActionResult> PublishEvent(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var evt = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .FirstOrDefaultAsync(e => e.Id == id && e.Venue != null && e.Venue.BusinessId == businessId.Value);

            if (evt == null)
            {
                return NotFound();
            }

            evt.IsPublished = true;
            await _context.SaveChangesAsync();

            return Ok(new { evt.Id, evt.IsPublished });
        }

        // POST: api/business/events/5/unpublish
        [HttpPost("{id}/unpublish")]
        public async Task<IActionResult> UnpublishEvent(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var evt = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .FirstOrDefaultAsync(e => e.Id == id && e.Venue != null && e.Venue.BusinessId == businessId.Value);

            if (evt == null)
            {
                return NotFound();
            }

            evt.IsPublished = false;
            await _context.SaveChangesAsync();

            return Ok(new { evt.Id, evt.IsPublished });
        }
    }
}
