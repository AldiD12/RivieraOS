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

            var allReviews = await _context.Reviews
                .Where(r => r.VenueId == venueId)
                .ToListAsync();

            var publicReviews = allReviews.Where(r => r.IsPublic).ToList();
            var privateReviews = allReviews.Where(r => !r.IsPublic).ToList();

            return Ok(new BizReviewStatsDto
            {
                Total = allReviews.Count,
                PublicCount = publicReviews.Count,
                PrivateCount = privateReviews.Count,
                AverageRating = allReviews.Any()
                    ? Math.Round(allReviews.Average(r => r.Rating), 1)
                    : 0,
                PublicAverageRating = publicReviews.Any()
                    ? Math.Round(publicReviews.Average(r => r.Rating), 1)
                    : 0,
                Distribution = new BizRatingDistributionDto
                {
                    Star5 = allReviews.Count(r => r.Rating == 5),
                    Star4 = allReviews.Count(r => r.Rating == 4),
                    Star3 = allReviews.Count(r => r.Rating == 3),
                    Star2 = allReviews.Count(r => r.Rating == 2),
                    Star1 = allReviews.Count(r => r.Rating == 1)
                },
                RecentLowRatings = allReviews
                    .Where(r => r.Rating < 4)
                    .OrderByDescending(r => r.CreatedAt)
                    .Take(5)
                    .Select(r => new BizRecentLowRatingDto
                    {
                        Rating = r.Rating,
                        Comment = r.Comment,
                        CreatedAt = r.CreatedAt
                    })
                    .ToList()
            });
        }
    }
}
