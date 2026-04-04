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
    public class VenuesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public VenuesController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/venues
        [HttpGet]
        public async Task<ActionResult<List<BizVenueListItemDto>>> GetVenues()
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Multi-tenancy filter is automatically applied
            var venues = await _context.Venues
                .OrderByDescending(v => v.CreatedAt)
                .Select(v => new BizVenueListItemDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Type = v.Type,
                    Address = v.Address,
                    ImageUrl = v.ImageUrl,
                    IsActive = v.IsActive,
                    OrderingEnabled = v.OrderingEnabled,
                    IsDigitalOrderingEnabled = v.IsDigitalOrderingEnabled,
                    AllowsDigitalOrdering = v.IsDigitalOrderingEnabled.HasValue
                        ? v.IsDigitalOrderingEnabled.Value
                        : (v.Type != null && v.Type.ToLower() == "restaurant" ? false : true),
                    ZoneCount = v.VenueZones.Count,
                    HasConfig = v.VenueConfig != null
                })
                .ToListAsync();

            return Ok(venues);
        }

        // GET: api/business/venues/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BizVenueDetailDto>> GetVenue(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues
                .Include(v => v.VenueConfig)
                .Include(v => v.VenueZones)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound();
            }

            return Ok(new BizVenueDetailDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Type = venue.Type,
                Description = venue.Description,
                Address = venue.Address,
                ImageUrl = venue.ImageUrl,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                IsActive = venue.IsActive,
                OrderingEnabled = venue.OrderingEnabled,
                IsDigitalOrderingEnabled = venue.IsDigitalOrderingEnabled,
                AllowsDigitalOrdering = venue.AllowsDigitalOrdering,
                CreatedAt = venue.CreatedAt,
                Config = venue.VenueConfig != null ? new BizVenueConfigDto
                {
                    Id = venue.VenueConfig.Id,
                    IsBookingEnabled = venue.VenueConfig.IsBookingEnabled,
                    IsSelfServiceEnabled = venue.VenueConfig.IsSelfServiceEnabled,
                    IsEventModeEnabled = venue.VenueConfig.IsEventModeEnabled,
                    MaxCapacity = venue.VenueConfig.MaxCapacity,
                    BookingDepositAmount = venue.VenueConfig.BookingDepositAmount
                } : null,
                Zones = venue.VenueZones.Select(z => new BizZoneSummaryDto
                {
                    Id = z.Id,
                    Name = z.Name,
                    ZoneType = z.ZoneType,
                    CapacityPerUnit = z.CapacityPerUnit,
                    BasePrice = z.BasePrice
                }).ToList()
            });
        }

        // POST: api/business/venues
        [HttpPost]
        public async Task<ActionResult<BizVenueDetailDto>> CreateVenue(BizCreateVenueRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = new Venue
            {
                Name = request.Name,
                Type = request.Type,
                Address = request.Address,
                ImageUrl = request.ImageUrl,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                OrderingEnabled = request.OrderingEnabled,
                IsDigitalOrderingEnabled = request.IsDigitalOrderingEnabled,
                BusinessId = businessId.Value,
                CreatedAt = DateTime.UtcNow
            };

            _context.Venues.Add(venue);
            await _context.SaveChangesAsync();

            // Create default config
            var config = new VenueConfig
            {
                VenueId = venue.Id,
                IsBookingEnabled = false,
                IsSelfServiceEnabled = false,
                IsEventModeEnabled = false,
                MaxCapacity = 0,
                BookingDepositAmount = 0
            };

            _context.VenueConfigs.Add(config);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVenue), new { id = venue.Id }, new BizVenueDetailDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Type = venue.Type,
                Description = venue.Description,
                Address = venue.Address,
                ImageUrl = venue.ImageUrl,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                IsActive = venue.IsActive,
                OrderingEnabled = venue.OrderingEnabled,
                IsDigitalOrderingEnabled = venue.IsDigitalOrderingEnabled,
                AllowsDigitalOrdering = venue.AllowsDigitalOrdering,
                CreatedAt = venue.CreatedAt,
                Config = new BizVenueConfigDto
                {
                    Id = config.Id,
                    IsBookingEnabled = config.IsBookingEnabled,
                    IsSelfServiceEnabled = config.IsSelfServiceEnabled,
                    IsEventModeEnabled = config.IsEventModeEnabled,
                    MaxCapacity = config.MaxCapacity,
                    BookingDepositAmount = config.BookingDepositAmount
                },
                Zones = new List<BizZoneSummaryDto>()
            });
        }

        // PUT: api/business/venues/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVenue(int id, BizUpdateVenueRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound();
            }

            venue.Name = request.Name;
            venue.Type = request.Type;
            venue.Address = request.Address;
            venue.ImageUrl = request.ImageUrl;
            venue.Latitude = request.Latitude;
            venue.Longitude = request.Longitude;
            venue.OrderingEnabled = request.OrderingEnabled;
            venue.IsDigitalOrderingEnabled = request.IsDigitalOrderingEnabled;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/business/venues/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVenue(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound();
            }

            venue.IsDeleted = true;
            venue.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/business/venues/5/toggle-active
        [HttpPost("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound();
            }

            venue.IsActive = !venue.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { venue.Id, venue.IsActive });
        }

        // GET: api/business/venues/5/config
        [HttpGet("{id}/config")]
        public async Task<ActionResult<BizVenueConfigDto>> GetVenueConfig(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues
                .Include(v => v.VenueConfig)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            if (venue.VenueConfig == null)
            {
                return NotFound("Config not found");
            }

            return Ok(new BizVenueConfigDto
            {
                Id = venue.VenueConfig.Id,
                IsBookingEnabled = venue.VenueConfig.IsBookingEnabled,
                IsSelfServiceEnabled = venue.VenueConfig.IsSelfServiceEnabled,
                IsEventModeEnabled = venue.VenueConfig.IsEventModeEnabled,
                MaxCapacity = venue.VenueConfig.MaxCapacity,
                BookingDepositAmount = venue.VenueConfig.BookingDepositAmount
            });
        }

        // PUT: api/business/venues/5/config
        [HttpPut("{id}/config")]
        public async Task<IActionResult> UpdateVenueConfig(int id, BizUpdateVenueConfigRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues
                .Include(v => v.VenueConfig)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            if (venue.VenueConfig == null)
            {
                venue.VenueConfig = new VenueConfig
                {
                    VenueId = venue.Id
                };
                _context.VenueConfigs.Add(venue.VenueConfig);
            }

            venue.VenueConfig.IsBookingEnabled = request.IsBookingEnabled;
            venue.VenueConfig.IsSelfServiceEnabled = request.IsSelfServiceEnabled;
            venue.VenueConfig.IsEventModeEnabled = request.IsEventModeEnabled;
            venue.VenueConfig.MaxCapacity = request.MaxCapacity;
            venue.VenueConfig.BookingDepositAmount = request.BookingDepositAmount;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
