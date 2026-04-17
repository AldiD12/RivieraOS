using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/[controller]")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Policy = "SuperAdmin")]
    public class DashboardController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public DashboardController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/dashboard
        [HttpGet]
        public async Task<ActionResult<DashboardDto>> GetDashboard()
        {
            // Get business statistics
            var businesses = await _context.Businesses.ToListAsync();
            var businessStats = new BusinessStats
            {
                Total = businesses.Count,
                Active = businesses.Count(b => b.IsActive),
                Inactive = businesses.Count(b => !b.IsActive),
                Trial = businesses.Count(b => b.SubscriptionStatus == "Trial"),
                Subscribed = businesses.Count(b => b.SubscriptionStatus == "Subscribed")
            };

            // Get total venues
            var totalVenues = await _context.Venues.CountAsync();

            // Get total users
            var totalUsers = await _context.Users.CountAsync();

            // Get recent businesses (last 10, ordered by creation date)
            var recentBusinesses = await _context.Businesses
                .OrderByDescending(b => b.CreatedAt)
                .Take(10)
                .Select(b => new RecentBusinessDto
                {
                    Id = b.Id,
                    RegisteredName = b.RegisteredName,
                    BrandName = b.BrandName,
                    SubscriptionStatus = b.SubscriptionStatus,
                    IsActive = b.IsActive,
                    CreatedAt = b.CreatedAt,
                    VenueCount = b.Venues.Count
                })
                .ToListAsync();

            var dashboard = new DashboardDto
            {
                Businesses = businessStats,
                TotalVenues = totalVenues,
                TotalUsers = totalUsers,
                RecentBusinesses = recentBusinesses
            };

            return Ok(dashboard);
        }
    }
}
