using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
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
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == businessId.Value);

            if (business == null)
            {
                return NotFound("Business not found");
            }

            // Get all counts in parallel to minimize round-trips
            var venueCountsTask = _context.Venues
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Active = g.Count(v => v.IsActive)
                })
                .FirstOrDefaultAsync();

            var staffCountsTask = _context.Users
                .Where(u => u.BusinessId == businessId.Value)
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Active = g.Count(u => u.IsActive)
                })
                .FirstOrDefaultAsync();

            var productCountsTask = _context.Products
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Available = g.Count(p => p.IsAvailable)
                })
                .FirstOrDefaultAsync();

            var totalCategories = _context.Categories.CountAsync();

            var eventCountsTask = _context.ScheduledEvents
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    Upcoming = g.Count(e => e.StartTime >= DateTime.UtcNow)
                })
                .FirstOrDefaultAsync();

            await Task.WhenAll(venueCountsTask, staffCountsTask, productCountsTask, totalCategories, eventCountsTask);

            var venueCounts = venueCountsTask.Result;
            var staffCounts = staffCountsTask.Result;
            var productCounts = productCountsTask.Result;
            var eventCounts = eventCountsTask.Result;

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
                TotalVenues = venueCounts?.Total ?? 0,
                ActiveVenues = venueCounts?.Active ?? 0,
                TotalStaff = staffCounts?.Total ?? 0,
                ActiveStaff = staffCounts?.Active ?? 0,
                TotalCategories = totalCategories.Result,
                TotalProducts = productCounts?.Total ?? 0,
                AvailableProducts = productCounts?.Available ?? 0,
                TotalEvents = eventCounts?.Total ?? 0,
                UpcomingEvents = eventCounts?.Upcoming ?? 0
            });
        }
    }
}
