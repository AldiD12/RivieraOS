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
    [Authorize(Policy = "Manager")]
    public class DashboardController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public DashboardController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/dashboard
        [HttpGet]
        public async Task<ActionResult<BusinessDashboardDto>> GetDashboard()
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == businessId.Value);

            if (business == null)
            {
                return NotFound("Business not found");
            }

            // Get counts - using the multi-tenancy filter automatically
            var totalVenues = await _context.Venues.CountAsync();
            var activeVenues = await _context.Venues.CountAsync(v => v.IsActive);

            var totalStaff = await _context.Users
                .CountAsync(u => u.BusinessId == businessId.Value);
            var activeStaff = await _context.Users
                .CountAsync(u => u.BusinessId == businessId.Value && u.IsActive);

            var totalCategories = await _context.Categories.CountAsync();
            var totalProducts = await _context.Products.CountAsync();
            var availableProducts = await _context.Products.CountAsync(p => p.IsAvailable);

            var totalEvents = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .CountAsync(e => e.Venue != null && e.Venue.BusinessId == businessId.Value);
            var upcomingEvents = await _context.ScheduledEvents
                .Include(e => e.Venue)
                .CountAsync(e => e.Venue != null && e.Venue.BusinessId == businessId.Value && e.StartTime >= DateTime.UtcNow);

            return Ok(new BusinessDashboardDto
            {
                Business = new BusinessInfoDto
                {
                    Id = business.Id,
                    RegisteredName = business.RegisteredName,
                    BrandName = business.BrandName,
                    LogoUrl = business.LogoUrl,
                    SubscriptionStatus = business.SubscriptionStatus,
                    IsActive = business.IsActive,
                    CreatedAt = business.CreatedAt
                },
                TotalVenues = totalVenues,
                ActiveVenues = activeVenues,
                TotalStaff = totalStaff,
                ActiveStaff = activeStaff,
                TotalCategories = totalCategories,
                TotalProducts = totalProducts,
                AvailableProducts = availableProducts,
                TotalEvents = totalEvents,
                UpcomingEvents = upcomingEvents
            });
        }
    }
}
