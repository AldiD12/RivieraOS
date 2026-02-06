using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/venues/{venueId}/[controller]")]
    [ApiController]
    [Authorize(Policy = "Manager")]
    public class ZonesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ZonesController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/venues/5/zones
        [HttpGet]
        public async Task<ActionResult<List<BizZoneListItemDto>>> GetZones(int venueId)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Verify venue belongs to this business (multi-tenancy filter applies)
            var venueExists = await _context.Venues.AnyAsync(v => v.Id == venueId);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var zones = await _context.VenueZones
                .Where(z => z.VenueId == venueId)
                .OrderBy(z => z.Name)
                .Select(z => new BizZoneListItemDto
                {
                    Id = z.Id,
                    Name = z.Name,
                    ZoneType = z.ZoneType,
                    CapacityPerUnit = z.CapacityPerUnit,
                    BasePrice = z.BasePrice
                })
                .ToListAsync();

            return Ok(zones);
        }

        // GET: api/business/venues/5/zones/10
        [HttpGet("{id}")]
        public async Task<ActionResult<BizZoneDetailDto>> GetZone(int venueId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var zone = await _context.VenueZones
                .Include(z => z.Venue)
                .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);

            if (zone == null)
            {
                return NotFound();
            }

            // Verify venue belongs to this business
            if (zone.Venue?.BusinessId != businessId.Value)
            {
                return NotFound();
            }

            return Ok(new BizZoneDetailDto
            {
                Id = zone.Id,
                Name = zone.Name,
                ZoneType = zone.ZoneType,
                CapacityPerUnit = zone.CapacityPerUnit,
                BasePrice = zone.BasePrice,
                VenueId = zone.VenueId,
                VenueName = zone.Venue?.Name
            });
        }

        // POST: api/business/venues/5/zones
        [HttpPost]
        public async Task<ActionResult<BizZoneDetailDto>> CreateZone(int venueId, BizCreateZoneRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == venueId);
            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var zone = new VenueZone
            {
                Name = request.Name,
                ZoneType = request.ZoneType,
                CapacityPerUnit = request.CapacityPerUnit,
                BasePrice = request.BasePrice,
                VenueId = venueId
            };

            _context.VenueZones.Add(zone);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetZone), new { venueId, id = zone.Id }, new BizZoneDetailDto
            {
                Id = zone.Id,
                Name = zone.Name,
                ZoneType = zone.ZoneType,
                CapacityPerUnit = zone.CapacityPerUnit,
                BasePrice = zone.BasePrice,
                VenueId = zone.VenueId,
                VenueName = venue.Name
            });
        }

        // PUT: api/business/venues/5/zones/10
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateZone(int venueId, int id, BizUpdateZoneRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var zone = await _context.VenueZones
                .Include(z => z.Venue)
                .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);

            if (zone == null)
            {
                return NotFound();
            }

            // Verify venue belongs to this business
            if (zone.Venue?.BusinessId != businessId.Value)
            {
                return NotFound();
            }

            zone.Name = request.Name;
            zone.ZoneType = request.ZoneType;
            zone.CapacityPerUnit = request.CapacityPerUnit;
            zone.BasePrice = request.BasePrice;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/business/venues/5/zones/10 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteZone(int venueId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var zone = await _context.VenueZones
                .Include(z => z.Venue)
                .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);

            if (zone == null)
            {
                return NotFound();
            }

            // Verify venue belongs to this business
            if (zone.Venue?.BusinessId != businessId.Value)
            {
                return NotFound();
            }

            zone.IsDeleted = true;
            zone.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
