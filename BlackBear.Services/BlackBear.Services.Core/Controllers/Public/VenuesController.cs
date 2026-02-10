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
                OrderingEnabled = venue.OrderingEnabled
            });
        }
    }
}
