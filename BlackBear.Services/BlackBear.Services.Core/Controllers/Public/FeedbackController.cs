using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    [EnableRateLimiting("public")]
    public class FeedbackController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ILogger<FeedbackController> _logger;

        public FeedbackController(BlackBearDbContext context, ILogger<FeedbackController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // POST: api/public/feedback
        [HttpPost]
        public async Task<ActionResult<PublicFeedbackResponseDto>> SubmitFeedback(PublicSubmitFeedbackRequest request)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == request.VenueId && !v.IsDeleted && v.IsActive);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var feedback = new NegativeFeedback
            {
                VenueId = request.VenueId,
                BusinessId = venue.BusinessId,
                Rating = request.Rating,
                Comment = request.Comment,
                UnitCode = request.UnitCode,
                GuestName = request.GuestName,
                GuestPhone = request.GuestPhone,
                SubmittedAt = request.SubmittedAt ?? DateTime.UtcNow,
                Status = "Intercepted",
                CreatedAt = DateTime.UtcNow
            };

            _context.NegativeFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            _logger.LogWarning(
                "Negative feedback intercepted: Venue {VenueId} ({VenueName}) received {Rating} stars from {GuestName}. Comment: {Comment}",
                venue.Id, venue.Name, feedback.Rating, feedback.GuestName, feedback.Comment);

            return Ok(new PublicFeedbackResponseDto
            {
                Id = feedback.Id,
                VenueId = feedback.VenueId,
                Rating = feedback.Rating,
                Status = feedback.Status,
                Message = "Feedback recorded. WhatsApp support will contact you."
            });
        }
    }
}
