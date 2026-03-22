using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class FeaturesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public FeaturesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/features
        [HttpGet]
        public async Task<ActionResult<List<BusinessFeatureDto>>> GetAllFeatures()
        {
            var features = await _context.BusinessFeatures
                .Include(f => f.Business)
                .OrderBy(f => f.Business.RegisteredName)
                .Select(f => new BusinessFeatureDto
                {
                    Id = f.Id,
                    BusinessId = f.BusinessId,
                    BusinessName = f.Business.BrandName ?? f.Business.RegisteredName,
                    HasDigitalMenu = f.HasDigitalMenu,
                    HasTableOrdering = f.HasTableOrdering,
                    HasBookings = f.HasBookings,
                    HasEvents = f.HasEvents,
                    HasPulse = f.HasPulse
                })
                .ToListAsync();

            return Ok(features);
        }

        // GET: api/superadmin/features/business/5
        [HttpGet("business/{businessId}")]
        public async Task<ActionResult<BusinessFeatureDto>> GetFeaturesByBusiness(int businessId)
        {
            var features = await _context.BusinessFeatures
                .Include(f => f.Business)
                .FirstOrDefaultAsync(f => f.BusinessId == businessId);

            if (features == null)
            {
                return NotFound(new { message = $"No features configured for business {businessId}" });
            }

            return Ok(new BusinessFeatureDto
            {
                Id = features.Id,
                BusinessId = features.BusinessId,
                BusinessName = features.Business.BrandName ?? features.Business.RegisteredName,
                HasDigitalMenu = features.HasDigitalMenu,
                HasTableOrdering = features.HasTableOrdering,
                HasBookings = features.HasBookings,
                HasEvents = features.HasEvents,
                HasPulse = features.HasPulse
            });
        }

        // PUT: api/superadmin/features/business/5
        [HttpPut("business/{businessId}")]
        public async Task<IActionResult> UpdateFeatures(int businessId, UpdateBusinessFeatureRequest request)
        {
            var features = await _context.BusinessFeatures
                .FirstOrDefaultAsync(f => f.BusinessId == businessId);

            if (features == null)
            {
                return NotFound(new { message = $"No features configured for business {businessId}" });
            }

            features.HasDigitalMenu = request.HasDigitalMenu;
            features.HasTableOrdering = request.HasTableOrdering;
            features.HasBookings = request.HasBookings;
            features.HasEvents = request.HasEvents;
            features.HasPulse = request.HasPulse;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/superadmin/features/business/5
        [HttpPatch("business/{businessId}")]
        public async Task<IActionResult> PatchFeatures(int businessId, PatchBusinessFeatureRequest request)
        {
            var features = await _context.BusinessFeatures
                .FirstOrDefaultAsync(f => f.BusinessId == businessId);

            if (features == null)
            {
                return NotFound(new { message = $"No features configured for business {businessId}" });
            }

            if (request.HasDigitalMenu.HasValue)
                features.HasDigitalMenu = request.HasDigitalMenu.Value;
            if (request.HasTableOrdering.HasValue)
                features.HasTableOrdering = request.HasTableOrdering.Value;
            if (request.HasBookings.HasValue)
                features.HasBookings = request.HasBookings.Value;
            if (request.HasEvents.HasValue)
                features.HasEvents = request.HasEvents.Value;
            if (request.HasPulse.HasValue)
                features.HasPulse = request.HasPulse.Value;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
