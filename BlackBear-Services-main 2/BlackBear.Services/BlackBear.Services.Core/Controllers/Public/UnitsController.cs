using BlackBear.Services.Core.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    [EnableRateLimiting("public")]
    public class UnitsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public UnitsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/public/units/{unitId}/hierarchy
        [HttpGet("{unitId}/hierarchy")]
        public async Task<IActionResult> GetUnitHierarchy(int unitId)
        {
            var unit = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Include(u => u.VenueZone)
                .Include(u => u.Venue)
                .Include(u => u.Business)
                .Where(u => u.Id == unitId && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (unit == null)
                return NotFound(new { error = "Unit not found", unitId });

            if (unit.VenueZone == null || unit.Venue == null || unit.Business == null)
                return BadRequest(new { error = "Unit hierarchy incomplete", unitId });

            return Ok(new
            {
                unitId = unit.Id,
                unitName = unit.UnitCode,
                unitType = unit.UnitType,
                zoneId = unit.VenueZone.Id,
                zoneName = unit.VenueZone.Name,
                venueId = unit.Venue.Id,
                venueName = unit.Venue.Name,
                businessId = unit.Business.Id,
                businessName = unit.Business.BrandName ?? unit.Business.RegisteredName
            });
        }
    }
}
