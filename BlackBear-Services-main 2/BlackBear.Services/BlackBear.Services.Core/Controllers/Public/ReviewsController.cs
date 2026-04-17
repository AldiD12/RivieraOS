using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/venues/{venueId}/reviews")]
    [ApiController]
    [EnableRateLimiting("public")]
    public class ReviewsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(BlackBearDbContext context, ILogger<ReviewsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/public/venues/5/reviews
        [HttpPost]
        public async Task<ActionResult<PublicReviewResponseDto>> SubmitReview(int venueId, PublicSubmitReviewRequest request)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted && v.IsActive);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var review = new Review
            {
                VenueId = venueId,
                BusinessId = venue.BusinessId,
                Rating = request.Rating,
                Comment = request.Comment,
                CustomerName = request.CustomerName,
                CustomerEmail = request.CustomerEmail,
                OrderId = request.OrderId,
                BookingId = request.BookingId,
                IsPublic = request.Rating >= 4,
                RedirectedToGoogle = request.Rating >= 4,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Log alert for low ratings (1-3 stars)
            if (request.Rating < 4)
            {
                _logger.LogWarning(
                    "Low rating alert: Venue {VenueId} ({VenueName}) received {Rating} stars. Comment: {Comment}",
                    venue.Id, venue.Name, review.Rating, review.Comment);

                review.AlertSent = true;
                await _context.SaveChangesAsync();
            }

            string? googleMapsUrl = null;
            if (review.RedirectedToGoogle)
            {
                googleMapsUrl = !string.IsNullOrEmpty(venue.GooglePlaceId)
                    ? $"https://search.google.com/local/writereview?placeid={venue.GooglePlaceId}"
                    : $"https://www.google.com/search?q={Uri.EscapeDataString($"{venue.Name} {venue.Address}")}";
            }

            return Ok(new PublicReviewResponseDto
            {
                ReviewId = review.Id,
                ShouldRedirectToGoogle = review.RedirectedToGoogle,
                GoogleMapsUrl = googleMapsUrl,
                Message = review.RedirectedToGoogle
                    ? "Thank you! Please share your experience on Google."
                    : "Thank you for your feedback. We'll work to improve."
            });
        }

        // GET: api/public/venues/5/reviews?page=1&pageSize=10
        [HttpGet]
        public async Task<ActionResult<PublicReviewListDto>> GetReviews(
            int venueId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 100);

            var query = _context.Reviews
                .IgnoreQueryFilters()
                .Where(r => r.VenueId == venueId && r.IsPublic && !r.IsDeleted);

            var totalCount = await query.CountAsync();

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new PublicReviewListItemDto
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CustomerName = r.CustomerName ?? "Anonymous",
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            var averageRating = totalCount > 0
                ? await query.AverageAsync(r => (double)r.Rating)
                : 0;

            return Ok(new PublicReviewListDto
            {
                Reviews = reviews,
                TotalCount = totalCount,
                AverageRating = Math.Round(averageRating, 1),
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        // GET: api/public/venues/5/reviews/rating
        [HttpGet("rating")]
        public async Task<ActionResult<PublicRatingSummaryDto>> GetRatingSummary(int venueId)
        {
            var stats = await _context.Reviews
                .IgnoreQueryFilters()
                .Where(r => r.VenueId == venueId && r.IsPublic && !r.IsDeleted)
                .GroupBy(_ => 1)
                .Select(g => new
                {
                    AverageRating = g.Average(r => (double)r.Rating),
                    TotalReviews = g.Count(),
                    Star5 = g.Count(r => r.Rating == 5),
                    Star4 = g.Count(r => r.Rating == 4),
                    Star3 = g.Count(r => r.Rating == 3),
                    Star2 = g.Count(r => r.Rating == 2),
                    Star1 = g.Count(r => r.Rating == 1)
                })
                .FirstOrDefaultAsync();

            if (stats == null)
            {
                return Ok(new PublicRatingSummaryDto());
            }

            return Ok(new PublicRatingSummaryDto
            {
                AverageRating = Math.Round(stats.AverageRating, 1),
                TotalReviews = stats.TotalReviews,
                Distribution = new PublicRatingDistributionDto
                {
                    Star5 = stats.Star5,
                    Star4 = stats.Star4,
                    Star3 = stats.Star3,
                    Star2 = stats.Star2,
                    Star1 = stats.Star1
                }
            });
        }
    }
}
