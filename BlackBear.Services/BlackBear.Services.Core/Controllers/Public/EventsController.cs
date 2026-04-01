using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    [EnableRateLimiting("public")]
    public class EventsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public EventsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/public/events/geographic-zones
        [HttpGet("geographic-zones")]
        public async Task<ActionResult<List<PublicGeographicZoneDto>>> GetGeographicZones()
        {
            var zones = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished && e.EndTime > DateTime.UtcNow)
                .Where(e => e.Venue != null && e.Venue.GeographicZone != null)
                .Where(e => e.Venue != null && _context.BusinessFeatures
                    .Any(bf => bf.BusinessId == e.Venue.BusinessId && !bf.IsDeleted && bf.HasEvents))
                .GroupBy(e => e.Venue!.GeographicZone)
                .Select(g => new PublicGeographicZoneDto
                {
                    Zone = g.Key!,
                    EventCount = g.Count()
                })
                .OrderByDescending(z => z.EventCount)
                .ToListAsync();

            return Ok(zones);
        }

        // GET: api/public/events?venueId=1&businessId=1&geographicZone=Dhërmi
        [HttpGet]
        public async Task<ActionResult<List<PublicEventListItemDto>>> GetEvents(
            [FromQuery] int? venueId = null,
            [FromQuery] int? businessId = null,
            [FromQuery] string? geographicZone = null,
            [FromQuery] int limit = 50)
        {
            limit = Math.Clamp(limit, 1, 100);

            var query = _context.ScheduledEvents
                .Include(e => e.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished && e.StartTime >= DateTime.UtcNow)
                // Feature gate: only show events for businesses that have HasEvents enabled
                .Where(e => e.Venue != null && _context.BusinessFeatures
                    .Any(bf => bf.BusinessId == e.Venue.BusinessId && !bf.IsDeleted && bf.HasEvents))
                .AsQueryable();

            if (venueId.HasValue)
            {
                query = query.Where(e => e.VenueId == venueId.Value);
            }

            if (businessId.HasValue)
            {
                query = query.Where(e => e.Venue != null && e.Venue.BusinessId == businessId.Value);
            }

            if (!string.IsNullOrEmpty(geographicZone))
            {
                query = query.Where(e => e.Venue != null && e.Venue.GeographicZone == geographicZone);
            }

            var events = await query
                .OrderBy(e => e.StartTime)
                .Take(limit)
                .Select(e => new PublicEventListItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Description = e.Description,
                    FlyerImageUrl = e.FlyerImageUrl,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsTicketed = e.IsTicketed,
                    TicketPrice = e.TicketPrice,
                    MinimumSpend = e.MinimumSpend,
                    MaxGuests = e.MaxGuests,
                    Vibe = e.Vibe,
                    EntryType = e.EntryType,
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    VenueAddress = e.Venue != null ? e.Venue.Address : null,
                    VenueGeographicZone = e.Venue != null ? e.Venue.GeographicZone : null,
                    VenueWhatsappNumber = e.Venue != null ? e.Venue.WhatsappNumber : null,
                    BusinessId = e.Venue != null ? e.Venue.BusinessId : null,
                    BusinessName = e.Venue != null && e.Venue.Business != null ? e.Venue.Business.BrandName ?? e.Venue.Business.RegisteredName : null,
                    SpotsRemaining = e.MaxGuests > 0 ? e.MaxGuests - e.EventBookings.Sum(b => b.GuestCount) : 0,
                    IsPublished = e.IsPublished,
                    IsDeleted = e.IsDeleted
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
                // Feature gate: only show events for businesses that have HasEvents enabled
                .Where(e => e.Venue != null && _context.BusinessFeatures
                    .Any(bf => bf.BusinessId == e.Venue.BusinessId && !bf.IsDeleted && bf.HasEvents))
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
                MinimumSpend = evt.MinimumSpend,
                MaxGuests = evt.MaxGuests,
                Vibe = evt.Vibe,
                EntryType = evt.EntryType,
                SpotsRemaining = evt.MaxGuests > 0 ? evt.MaxGuests - evt.EventBookings.Sum(b => b.GuestCount) : 0,
                VenueId = evt.VenueId,
                VenueName = evt.Venue?.Name,
                VenueAddress = evt.Venue?.Address,
                VenueGeographicZone = evt.Venue?.GeographicZone,
                VenueWhatsappNumber = evt.Venue?.WhatsappNumber,
                VenueLatitude = evt.Venue?.Latitude,
                VenueLongitude = evt.Venue?.Longitude,
                BusinessId = evt.Venue?.BusinessId,
                BusinessName = evt.Venue?.Business?.BrandName ?? evt.Venue?.Business?.RegisteredName,
                BusinessLogoUrl = evt.Venue?.Business?.LogoUrl,
                IsPublished = evt.IsPublished,
                IsDeleted = evt.IsDeleted
            });
        }

        // GET: api/public/events/venue/5
        [HttpGet("venue/{venueId}")]
        public async Task<ActionResult<List<PublicEventListItemDto>>> GetEventsByVenue(int venueId, [FromQuery] int limit = 20)
        {
            limit = Math.Clamp(limit, 1, 100);

            var events = await _context.ScheduledEvents
                .Include(e => e.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished && e.VenueId == venueId && e.StartTime >= DateTime.UtcNow)
                .Where(e => e.Venue != null && _context.BusinessFeatures
                    .Any(bf => bf.BusinessId == e.Venue.BusinessId && !bf.IsDeleted && bf.HasEvents))
                .OrderBy(e => e.StartTime)
                .Take(limit)
                .Select(e => new PublicEventListItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Description = e.Description,
                    FlyerImageUrl = e.FlyerImageUrl,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsTicketed = e.IsTicketed,
                    TicketPrice = e.TicketPrice,
                    MinimumSpend = e.MinimumSpend,
                    MaxGuests = e.MaxGuests,
                    Vibe = e.Vibe,
                    EntryType = e.EntryType,
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    VenueAddress = e.Venue != null ? e.Venue.Address : null,
                    VenueGeographicZone = e.Venue != null ? e.Venue.GeographicZone : null,
                    VenueWhatsappNumber = e.Venue != null ? e.Venue.WhatsappNumber : null,
                    BusinessId = e.Venue != null ? e.Venue.BusinessId : null,
                    BusinessName = e.Venue != null && e.Venue.Business != null ? e.Venue.Business.BrandName ?? e.Venue.Business.RegisteredName : null,
                    SpotsRemaining = e.MaxGuests > 0 ? e.MaxGuests - e.EventBookings.Sum(b => b.GuestCount) : 0,
                    IsPublished = e.IsPublished,
                    IsDeleted = e.IsDeleted
                })
                .ToListAsync();

            return Ok(events);
        }

        // GET: api/public/events/business/5
        [HttpGet("business/{businessId}")]
        public async Task<ActionResult<List<PublicEventListItemDto>>> GetEventsByBusiness(int businessId, [FromQuery] int limit = 20)
        {
            limit = Math.Clamp(limit, 1, 100);

            var events = await _context.ScheduledEvents
                .Include(e => e.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(e => e.EventBookings)
                .IgnoreQueryFilters()
                .Where(e => !e.IsDeleted && e.IsPublished && e.Venue != null && e.Venue.BusinessId == businessId && e.StartTime >= DateTime.UtcNow)
                .Where(e => _context.BusinessFeatures
                    .Any(bf => bf.BusinessId == e.Venue!.BusinessId && !bf.IsDeleted && bf.HasEvents))
                .OrderBy(e => e.StartTime)
                .Take(limit)
                .Select(e => new PublicEventListItemDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Description = e.Description,
                    FlyerImageUrl = e.FlyerImageUrl,
                    StartTime = e.StartTime,
                    EndTime = e.EndTime,
                    IsTicketed = e.IsTicketed,
                    TicketPrice = e.TicketPrice,
                    MinimumSpend = e.MinimumSpend,
                    MaxGuests = e.MaxGuests,
                    Vibe = e.Vibe,
                    EntryType = e.EntryType,
                    VenueId = e.VenueId,
                    VenueName = e.Venue != null ? e.Venue.Name : null,
                    VenueAddress = e.Venue != null ? e.Venue.Address : null,
                    VenueGeographicZone = e.Venue != null ? e.Venue.GeographicZone : null,
                    VenueWhatsappNumber = e.Venue != null ? e.Venue.WhatsappNumber : null,
                    BusinessId = e.Venue != null ? e.Venue.BusinessId : null,
                    BusinessName = e.Venue != null && e.Venue.Business != null ? e.Venue.Business.BrandName ?? e.Venue.Business.RegisteredName : null,
                    SpotsRemaining = e.MaxGuests > 0 ? e.MaxGuests - e.EventBookings.Sum(b => b.GuestCount) : 0,
                    IsPublished = e.IsPublished,
                    IsDeleted = e.IsDeleted
                })
                .ToListAsync();

            return Ok(events);
        }
    }
}
