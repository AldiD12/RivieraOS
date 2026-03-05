using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/[controller]")]
    [ApiController]
    [Authorize(Policy = "BusinessOwner")]
    public class ProfileController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ProfileController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/profile
        [HttpGet]
        [Authorize(Policy = "Manager")]
        public async Task<ActionResult<BusinessProfileDto>> GetProfile()
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == businessId.Value);

            if (business == null)
            {
                return NotFound("Business not found");
            }

            return Ok(new BusinessProfileDto
            {
                Id = business.Id,
                RegisteredName = business.RegisteredName,
                BrandName = business.BrandName,
                TaxId = business.TaxId,
                ContactEmail = business.ContactEmail,
                LogoUrl = business.LogoUrl,
                SubscriptionStatus = business.SubscriptionStatus,
                IsActive = business.IsActive,
                CreatedAt = business.CreatedAt
            });
        }

        // GET: api/business/profile/features
        [HttpGet("features")]
        [Authorize(Policy = "Manager")]
        public async Task<ActionResult<BizBusinessFeatureDto>> GetMyFeatures()
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var features = await _context.BusinessFeatures
                .FirstOrDefaultAsync(f => f.BusinessId == businessId.Value);

            if (features == null)
            {
                return NotFound("Features not configured for this business");
            }

            return Ok(new BizBusinessFeatureDto
            {
                HasDigitalMenu = features.HasDigitalMenu,
                HasTableOrdering = features.HasTableOrdering,
                HasBookings = features.HasBookings,
                HasEvents = features.HasEvents,
                HasPulse = features.HasPulse
            });
        }

        // PUT: api/business/profile
        [HttpPut]
        public async Task<IActionResult> UpdateProfile(UpdateBusinessProfileRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == businessId.Value);

            if (business == null)
            {
                return NotFound("Business not found");
            }

            // Only allow updating certain fields
            business.BrandName = request.BrandName;
            business.ContactEmail = request.ContactEmail;
            business.LogoUrl = request.LogoUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
