using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/businesses/{businessId}/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class VenuesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public VenuesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/businesses/5/venues
        [HttpGet]
        public async Task<ActionResult<List<VenueListItemDto>>> GetVenues(int businessId)
        {
            // Verify business exists
            var businessExists = await _context.Businesses.AnyAsync(b => b.Id == businessId);
            if (!businessExists)
            {
                return NotFound("Business not found");
            }

            var venues = await _context.Venues
                .Where(v => v.BusinessId == businessId)
                .OrderByDescending(v => v.CreatedAt)
                .Select(v => new VenueListItemDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Type = v.Type,
                    Address = v.Address,
                    ImageUrl = v.ImageUrl,
                    CreatedAt = v.CreatedAt,
                    IsActive = v.IsActive,
                    OrderingEnabled = v.OrderingEnabled,
                    ZoneCount = v.VenueZones.Count,
                    HasConfig = v.VenueConfig != null
                })
                .ToListAsync();

            return Ok(venues);
        }

        // GET: api/superadmin/businesses/5/venues/10
        [HttpGet("{id}")]
        public async Task<ActionResult<VenueDetailDto>> GetVenue(int businessId, int id)
        {
            var venue = await _context.Venues
                .Include(v => v.Business)
                .Include(v => v.VenueConfig)
                .Include(v => v.VenueZones)
                .FirstOrDefaultAsync(v => v.Id == id && v.BusinessId == businessId);

            if (venue == null)
            {
                return NotFound();
            }

            var dto = new VenueDetailDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Type = venue.Type,
                Description = venue.Description,
                Address = venue.Address,
                ImageUrl = venue.ImageUrl,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                CreatedAt = venue.CreatedAt,
                IsActive = venue.IsActive,
                OrderingEnabled = venue.OrderingEnabled,
                BusinessId = venue.BusinessId,
                BusinessName = venue.Business?.BrandName ?? venue.Business?.RegisteredName,
                Config = venue.VenueConfig != null ? new VenueConfigDto
                {
                    Id = venue.VenueConfig.Id,
                    IsBookingEnabled = venue.VenueConfig.IsBookingEnabled,
                    IsSelfServiceEnabled = venue.VenueConfig.IsSelfServiceEnabled,
                    IsEventModeEnabled = venue.VenueConfig.IsEventModeEnabled,
                    MaxCapacity = venue.VenueConfig.MaxCapacity,
                    BookingDepositAmount = venue.VenueConfig.BookingDepositAmount
                } : null,
                Zones = venue.VenueZones.Select(z => new ZoneSummaryDto
                {
                    Id = z.Id,
                    Name = z.Name,
                    ZoneType = z.ZoneType,
                    CapacityPerUnit = z.CapacityPerUnit,
                    BasePrice = z.BasePrice
                }).ToList()
            };

            return Ok(dto);
        }

        // POST: api/superadmin/businesses/5/venues
        [HttpPost]
        public async Task<ActionResult<VenueDetailDto>> CreateVenue(int businessId, CreateVenueRequest request)
        {
            // Verify business exists
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
            {
                return NotFound("Business not found");
            }

            var venue = new Venue
            {
                Name = request.Name,
                Type = request.Type,
                Description = request.Description,
                Address = request.Address,
                ImageUrl = request.ImageUrl,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                OrderingEnabled = request.OrderingEnabled,
                BusinessId = businessId,
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

            return CreatedAtAction(nameof(GetVenue), new { businessId, id = venue.Id }, new VenueDetailDto
            {
                Id = venue.Id,
                Name = venue.Name,
                Type = venue.Type,
                Description = venue.Description,
                Address = venue.Address,
                ImageUrl = venue.ImageUrl,
                Latitude = venue.Latitude,
                Longitude = venue.Longitude,
                CreatedAt = venue.CreatedAt,
                IsActive = venue.IsActive,
                OrderingEnabled = venue.OrderingEnabled,
                BusinessId = venue.BusinessId,
                BusinessName = business.BrandName ?? business.RegisteredName,
                Config = new VenueConfigDto
                {
                    Id = config.Id,
                    IsBookingEnabled = config.IsBookingEnabled,
                    IsSelfServiceEnabled = config.IsSelfServiceEnabled,
                    IsEventModeEnabled = config.IsEventModeEnabled,
                    MaxCapacity = config.MaxCapacity,
                    BookingDepositAmount = config.BookingDepositAmount
                },
                Zones = new List<ZoneSummaryDto>()
            });
        }

        // PUT: api/superadmin/businesses/5/venues/10
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVenue(int businessId, int id, UpdateVenueRequest request)
        {
            var venue = await _context.Venues
                .FirstOrDefaultAsync(v => v.Id == id && v.BusinessId == businessId);

            if (venue == null)
            {
                return NotFound();
            }

            venue.Name = request.Name;
            venue.Type = request.Type;
            venue.Description = request.Description;
            venue.Address = request.Address;
            venue.ImageUrl = request.ImageUrl;
            venue.Latitude = request.Latitude;
            venue.Longitude = request.Longitude;
            venue.OrderingEnabled = request.OrderingEnabled;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/superadmin/businesses/5/venues/10 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVenue(int businessId, int id)
        {
            var venue = await _context.Venues
                .FirstOrDefaultAsync(v => v.Id == id && v.BusinessId == businessId);

            if (venue == null)
            {
                return NotFound();
            }

            // Soft delete
            venue.IsDeleted = true;
            venue.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/businesses/5/venues/10/activate
        [HttpPost("{id}/activate")]
        public async Task<IActionResult> ActivateVenue(int businessId, int id)
        {
            var venue = await _context.Venues
                .FirstOrDefaultAsync(v => v.Id == id && v.BusinessId == businessId);

            if (venue == null)
            {
                return NotFound();
            }

            // Toggle IsActive status
            venue.IsActive = !venue.IsActive;

            await _context.SaveChangesAsync();

            return Ok(new { venue.Id, venue.IsActive });
        }

        // GET: api/superadmin/businesses/5/venues/10/config
        [HttpGet("{id}/config")]
        public async Task<ActionResult<VenueConfigDto>> GetVenueConfig(int businessId, int id)
        {
            var venue = await _context.Venues
                .Include(v => v.VenueConfig)
                .FirstOrDefaultAsync(v => v.Id == id && v.BusinessId == businessId);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            if (venue.VenueConfig == null)
            {
                return NotFound("Config not found");
            }

            return Ok(new VenueConfigDto
            {
                Id = venue.VenueConfig.Id,
                IsBookingEnabled = venue.VenueConfig.IsBookingEnabled,
                IsSelfServiceEnabled = venue.VenueConfig.IsSelfServiceEnabled,
                IsEventModeEnabled = venue.VenueConfig.IsEventModeEnabled,
                MaxCapacity = venue.VenueConfig.MaxCapacity,
                BookingDepositAmount = venue.VenueConfig.BookingDepositAmount
            });
        }

        // PUT: api/superadmin/businesses/5/venues/10/config
        [HttpPut("{id}/config")]
        public async Task<IActionResult> UpdateVenueConfig(int businessId, int id, UpdateVenueConfigRequest request)
        {
            var venue = await _context.Venues
                .Include(v => v.VenueConfig)
                .FirstOrDefaultAsync(v => v.Id == id && v.BusinessId == businessId);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            if (venue.VenueConfig == null)
            {
                // Create config if it doesn't exist
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
