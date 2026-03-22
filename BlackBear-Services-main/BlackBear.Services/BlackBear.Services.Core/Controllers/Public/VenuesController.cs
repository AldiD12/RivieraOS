using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    public class VenuesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public VenuesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/public/venues
        [HttpGet]
        public async Task<ActionResult<List<PublicVenueListItemDto>>> GetVenues(
            [FromQuery] string? type = null,
            [FromQuery] bool? isActive = true)
        {
            var query = _context.Venues
                .Include(v => v.Business)
                .IgnoreQueryFilters()
                .Where(v => !v.IsDeleted)
                .AsQueryable();

            if (isActive.HasValue)
                query = query.Where(v => v.IsActive == isActive.Value);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(v => v.Type == type);

            var venues = await query
                .OrderBy(v => v.Name)
                .ToListAsync();

            // Get unit counts per venue
            var venueIds = venues.Select(v => v.Id).ToList();
            var unitCounts = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Where(u => venueIds.Contains(u.VenueId) && !u.IsDeleted)
                .GroupBy(u => u.VenueId)
                .Select(g => new
                {
                    VenueId = g.Key,
                    AvailableCount = g.Count(u => u.Status == "Available")
                })
                .ToListAsync();

            // Check for manual overrides on zones
            var overriddenZones = await _context.VenueZones
                .IgnoreQueryFilters()
                .Where(z => venueIds.Contains(z.VenueId) && !z.IsDeleted
                    && z.IsManualOverride && (z.OverrideUntil == null || z.OverrideUntil > DateTime.UtcNow))
                .Select(z => z.VenueId)
                .Distinct()
                .ToListAsync();

            var unitCountDict = unitCounts.ToDictionary(x => x.VenueId, x => x.AvailableCount);

            var result = venues.Select(v =>
            {
                var availableCount = unitCountDict.GetValueOrDefault(v.Id, 0);

                return new PublicVenueListItemDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Type = v.Type,
                    Description = v.Description,
                    Address = v.Address,
                    ImageUrl = v.ImageUrl,
                    Latitude = v.Latitude,
                    Longitude = v.Longitude,
                    IsActive = v.IsActive,
                    AllowsDigitalOrdering = v.AllowsDigitalOrdering,
                    HasAvailability = availableCount > 0,
                    AvailableUnitsCount = availableCount,
                    BusinessId = v.BusinessId,
                    BusinessName = v.Business?.BrandName ?? v.Business?.RegisteredName
                };
            }).ToList();

            return Ok(result);
        }

        // GET: api/public/venues/5
        [HttpGet("{id}")]
        public async Task<ActionResult<PublicVenueDetailDto>> GetVenue(int id)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted && v.IsActive);

            if (venue == null)
            {
                return NotFound();
            }

            return Ok(new PublicVenueDetailDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Type = venue.Type,
                Description = venue.Description,
                Address = venue.Address,
                ImageUrl = venue.ImageUrl,
                OrderingEnabled = venue.OrderingEnabled,
                AllowsDigitalOrdering = venue.AllowsDigitalOrdering
            });
        }

        // GET: api/public/venues/5/availability
        [HttpGet("{id}/availability")]
        public async Task<ActionResult<PublicVenueAvailabilityDetailDto>> GetVenueAvailability(int id)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == id && !v.IsDeleted && v.IsActive);

            if (venue == null)
            {
                return NotFound();
            }

            var zones = await _context.VenueZones
                .IgnoreQueryFilters()
                .Where(z => z.VenueId == id && !z.IsDeleted && z.IsActive)
                .ToListAsync();

            var zoneIds = zones.Select(z => z.Id).ToList();

            var units = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Where(u => zoneIds.Contains(u.VenueZoneId) && !u.IsDeleted)
                .ToListAsync();

            var zoneAvailability = zones.Select(z =>
            {
                var zoneUnits = units.Where(u => u.VenueZoneId == z.Id).ToList();
                var isOverrideActive = z.IsManualOverride
                    && (z.OverrideUntil == null || z.OverrideUntil > DateTime.UtcNow);

                return new PublicZoneAvailabilityInfoDto
                {
                    Id = z.Id,
                    Name = z.Name,
                    ZoneType = z.ZoneType,
                    TotalUnits = zoneUnits.Count,
                    AvailableUnits = isOverrideActive ? 0 : zoneUnits.Count(u => u.Status == "Available"),
                    BasePrice = z.BasePrice,
                    IsManualOverride = isOverrideActive
                };
            }).ToList();

            return Ok(new PublicVenueAvailabilityDetailDto
            {
                VenueId = venue.Id,
                VenueName = venue.Name,
                TotalUnits = units.Count,
                AvailableUnits = zoneAvailability.Sum(z => z.AvailableUnits),
                ReservedUnits = units.Count(u => u.Status == "Reserved"),
                OccupiedUnits = units.Count(u => u.Status == "Occupied"),
                Zones = zoneAvailability
            });
        }
    }
}
