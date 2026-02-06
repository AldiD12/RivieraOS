using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public EventsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/public/events?venueId=1&businessId=1
        [HttpGet]
        public async Task<ActionResult<List<PublicEventListItemDto>>> GetEvents(
            [FromQuery] int? venueId = null,
            [FromQuery] int? businessId = null,
            [FromQuery] int limit = 50)
        {
            var query = _context.ScheduledEvents
                .Include(e => e.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished && e.StartTime >= DateTime.UtcNow)
                .AsQueryable();

            if (venueId.HasValue)
            {
                query = query.Where(e => e.VenueId == venueId.Value);
            }

            if (businessId.HasValue)
            {
                query = query.Where(e => e.Venue != null && e.Venue.BusinessId == businessId.Value);
            }

            var events = await query
                .OrderBy(e => e.StartTime)
                .Take(limit)
                .Select(e => new PublicEventListItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    FlyerImageUrl = e.FlyerImageUrl,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsTicketed = e.IsTicketed,
                    TicketPrice = e.TicketPrice,
                    MaxGuests = e.MaxGuests,
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    VenueAddress = e.Venue != null ? e.Venue.Address : null,
                    BusinessName = e.Venue != null && e.Venue.Business != null ? e.Venue.Business.BrandName ?? e.Venue.Business.RegisteredName : null,
                    SpotsRemaining = e.MaxGuests > 0 ? e.MaxGuests - e.EventBookings.Sum(b => b.GuestCount) : 0
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/public/events/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PublicEventDetailDto>> GetEvent(int id)
        {
            var evt = await _context.ScheduledEvents
                .Include(e => e.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evt == null)
            {
                return NotFound();
            }

            return Ok(new PublicEventDetailDto
            {
                Id = evt.Id,
                Name = evt.Name,
                Description = evt.Description,
                FlyerImageUrl = evt.FlyerImageUrl,
                StartTime = evt.StartTime,
                EndTime = evt.EndTime,
                IsTicketed = evt.IsTicketed,
                TicketPrice = evt.TicketPrice,
                MaxGuests = evt.MaxGuests,
                SpotsRemaining = evt.MaxGuests > 0 ? evt.MaxGuests - evt.EventBookings.Sum(b => b.GuestCount) : 0,
                VenueId = evt.VenueId,
                VenueName = evt.Venue?.Name,
                VenueAddress = evt.Venue?.Address,
                VenueLatitude = evt.Venue?.Latitude,
                VenueLongitude = evt.Venue?.Longitude,
                BusinessName = evt.Venue?.Business?.BrandName ?? evt.Venue?.Business?.RegisteredName,
                BusinessLogoUrl = evt.Venue?.Business?.LogoUrl
            });
        }

        // GET: api/public/events/venue/5
        [HttpGet("venue/{venueId}")]
        public async Task<ActionResult<List<PublicEventListItemDto>>> GetEventsByVenue(int venueId, [FromQuery] int limit = 20)
        {
            var events = await _context.ScheduledEvents
                .Include(e => e.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished && e.VenueId == venueId && e.StartTime >= DateTime.UtcNow)
                .OrderBy(e => e.StartTime)
                .Take(limit)
                .Select(e => new PublicEventListItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    FlyerImageUrl = e.FlyerImageUrl,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsTicketed = e.IsTicketed,
                    TicketPrice = e.TicketPrice,
                    MaxGuests = e.MaxGuests,
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    VenueAddress = e.Venue != null ? e.Venue.Address : null,
                    BusinessName = e.Venue != null && e.Venue.Business != null ? e.Venue.Business.BrandName ?? e.Venue.Business.RegisteredName : null,
                    SpotsRemaining = e.MaxGuests > 0 ? e.MaxGuests - e.EventBookings.Sum(b => b.GuestCount) : 0
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/public/events/business/5
        [HttpGet("business/{businessId}")]
        public async Task<ActionResult<List<PublicEventListItemDto>>> GetEventsByBusiness(int businessId, [FromQuery] int limit = 20)
        {
            var events = await _context.ScheduledEvents
                .Include(e => e.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished && e.Venue != null && e.Venue.BusinessId == businessId && e.StartTime >= DateTime.UtcNow)
                .OrderBy(e => e.StartTime)
                .Take(limit)
                .Select(e => new PublicEventListItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    FlyerImageUrl = e.FlyerImageUrl,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsTicketed = e.IsTicketed,
                    TicketPrice = e.TicketPrice,
                    MaxGuests = e.MaxGuests,
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    VenueAddress = e.Venue != null ? e.Venue.Address : null,
                    BusinessName = e.Venue != null && e.Venue.Business != null ? e.Venue.Business.BrandName ?? e.Venue.Business.RegisteredName : null,
                    SpotsRemaining = e.MaxGuests > 0 ? e.MaxGuests - e.EventBookings.Sum(b => b.GuestCount) : 0
                })
                .ToListAsync();

            return Ok(events);
        }
    }
}
