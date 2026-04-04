using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/venues/{venueId}/[controller]")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Policy = "SuperAdmin")]
    public class ZonesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public ZonesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/venues/10/zones
        [HttpGet]
        public async Task<ActionResult<List<ZoneListItemDto>>> GetZones(int venueId)
        {
            // Verify venue exists
            var venueExists = await _context.Venues.AnyAsync(v => v.Id == venueId);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var zones = await _context.VenueZones
                .Where(z => z.VenueId == venueId)
                .OrderBy(z => z.Name)
                .Select(z => new ZoneListItemDto
                {
                    Id = z.Id,
                    Name = z.Name,
                    ZoneType = z.ZoneType,
                    CapacityPerUnit = z.CapacityPerUnit,
                    BasePrice = z.BasePrice,
                    IsActive = z.IsActive
                })
                .ToListAsync();

            return Ok(zones);
        }

        // GET: api/superadmin/venues/10/zones/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ZoneDetailDto>> GetZone(int venueId, int id)
        {
            var zone = await _context.VenueZones
                .Include(z => z.Venue)
                .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);

            if (zone == null)
            {
                return NotFound();
            }

            return Ok(new ZoneDetailDto
            {
                Id = zone.Id,
                Name = zone.Name,
                ZoneType = zone.ZoneType,
                CapacityPerUnit = zone.CapacityPerUnit,
                BasePrice = zone.BasePrice,
                VenueId = zone.VenueId,
                VenueName = zone.Venue?.Name,
                IsActive = zone.IsActive
            });
        }

        // POST: api/superadmin/venues/10/zones
        [HttpPost]
        public async Task<ActionResult<ZoneDetailDto>> CreateZone(int venueId, CreateZoneRequest request)
        {
            var venue = await _context.Venues.FindAsync(venueId);
            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var zone = new VenueZone
            {
                Name = request.Name,
                ZoneType = request.ZoneType,
                IsActive = request.IsActive,
                VenueId = venueId
            };

            _context.VenueZones.Add(zone);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetZone), new { venueId, id = zone.Id }, new ZoneDetailDto
            {
                Id = zone.Id,
                Name = zone.Name,
                ZoneType = zone.ZoneType,
                CapacityPerUnit = zone.CapacityPerUnit,
                BasePrice = zone.BasePrice,
                VenueId = zone.VenueId,
                VenueName = venue.Name,
                IsActive = zone.IsActive
            });
        }

        // PUT: api/superadmin/venues/10/zones/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateZone(int venueId, int id, UpdateZoneRequest request)
        {
            var zone = await _context.VenueZones
                .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);

            if (zone == null)
            {
                return NotFound();
            }

            zone.Name = request.Name;
            zone.ZoneType = request.ZoneType;
            zone.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/venues/10/zones/5/toggle-active
        [HttpPost("{id}/toggle-active")]
        public async Task<IActionResult> ToggleZoneActive(int venueId, int id)
        {
            var zone = await _context.VenueZones
                .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);

            if (zone == null)
            {
                return NotFound();
            }

            zone.IsActive = !zone.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { isActive = zone.IsActive });
        }

        // DELETE: api/superadmin/venues/10/zones/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteZone(int venueId, int id)
        {
            var zone = await _context.VenueZones
                .FirstOrDefaultAsync(z => z.Id == id && z.VenueId == venueId);

            if (zone == null)
            {
                return NotFound();
            }

            // Soft delete
            zone.IsDeleted = true;
            zone.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
