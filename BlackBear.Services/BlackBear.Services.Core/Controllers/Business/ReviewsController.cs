using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/venues/{venueId}/reviews")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Roles = "BusinessOwner,Manager")]
    public class ReviewsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ReviewsController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/venues/5/reviews?minRating=1&maxRating=3&page=1&pageSize=20
        [HttpGet]
        public async Task<ActionResult<BizReviewListDto>> GetAllReviews(
            int venueId,
            [FromQuery] int? minRating = null,
            [FromQuery] int? maxRating = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Verify venue belongs to business
            var venue = await _context.Venues
                .FirstOrDefaultAsync(v => v.Id == venueId && v.BusinessId == businessId.Value);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var query = _context.Reviews
                .Where(r => r.VenueId == venueId)
                .AsQueryable();

            if (minRating.HasValue)
            {
                query = query.Where(r => r.Rating >= minRating.Value);
            }

            if (maxRating.HasValue)
            {
                query = query.Where(r => r.Rating <= maxRating.Value);
            }

            var totalCount = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new BizReviewListItemDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CustomerName = r.CustomerName,
                    CustomerEmail = r.CustomerEmail,
                    IsPublic = r.IsPublic,
                    AlertSent = r.AlertSent,
                    CreatedAt = r.CreatedAt,
                    OrderId = r.OrderId,
                    BookingId = r.BookingId
                })
                .ToListAsync();

            return Ok(new BizReviewListDto
            {
                Reviews = reviews,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // GET: api/business/venues/5/reviews/stats
        [HttpGet("stats")]
        public async Task<ActionResult<BizReviewStatsDto>> GetReviewStats(int venueId)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues
                .FirstOrDefaultAsync(v => v.Id == venueId && v.BusinessId == businessId.Value);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var baseQuery = _context.Reviews.Where(r => r.VenueId == venueId);

            // Single aggregation query instead of loading all reviews into memory
            var stats = await baseQuery
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    Total = g.Count(),
                    PublicCount = g.Count(r => r.IsPublic),
                    PrivateCount = g.Count(r => !r.IsPublic),
                    AverageRating = g.Average(r => (double)r.Rating),
                    PublicAverageRating = g.Where(r => r.IsPublic).Average(r => (double?)r.Rating),
                    Star5 = g.Count(r => r.Rating == 5),
                    Star4 = g.Count(r => r.Rating == 4),
                    Star3 = g.Count(r => r.Rating == 3),
                    Star2 = g.Count(r => r.Rating == 2),
                    Star1 = g.Count(r => r.Rating == 1)
                })
                .FirstOrDefaultAsync();

            var recentLowRatings = await baseQuery
                .Where(r => r.Rating < 4)
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new BizRecentLowRatingDto
                {
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return Ok(new BizReviewStatsDto
            {
                Total = stats?.Total ?? 0,
                PublicCount = stats?.PublicCount ?? 0,
                PrivateCount = stats?.PrivateCount ?? 0,
                AverageRating = stats != null && stats.Total > 0
                    ? Math.Round(stats.AverageRating, 1)
                    : 0,
                PublicAverageRating = stats?.PublicAverageRating.HasValue == true
                    ? Math.Round(stats.PublicAverageRating.Value, 1)
                    : 0,
                Distribution = new BizRatingDistributionDto
                {
                    Star5 = stats?.Star5 ?? 0,
                    Star4 = stats?.Star4 ?? 0,
                    Star3 = stats?.Star3 ?? 0,
                    Star2 = stats?.Star2 ?? 0,
                    Star1 = stats?.Star1 ?? 0
                },
                RecentLowRatings = recentLowRatings
            });
        }
    }
}
