using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/[controller]")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Policy = "Manager")]
    public class FeedbackController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public FeedbackController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/feedback
        [HttpGet]
        public async Task<ActionResult<BizFeedbackStatsDto>> GetFeedback(
            [FromQuery] int? venueId = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Get venue IDs belonging to this business
            var businessVenueIds = await _context.Venues
                .Where(v => v.BusinessId == businessId.Value)
                .Select(v => v.Id)
                .ToListAsync();

            var query = _context.NegativeFeedbacks
                .Include(nf => nf.Venue)
                .Include(nf => nf.ResolvedByUser)
                .Where(nf => businessVenueIds.Contains(nf.VenueId))
                .AsQueryable();

            if (venueId.HasValue)
                query = query.Where(nf => nf.VenueId == venueId.Value);
            if (!string.IsNullOrEmpty(status))
                query = query.Where(nf => nf.Status == status);
            if (fromDate.HasValue)
                query = query.Where(nf => nf.SubmittedAt >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(nf => nf.SubmittedAt <= toDate.Value);

            var feedbacks = await query
                .OrderByDescending(nf => nf.SubmittedAt)
                .Select(nf => new BizFeedbackListItemDto
                {
                    Id = nf.Id,
                    VenueId = nf.VenueId,
                    VenueName = nf.Venue != null ? nf.Venue.Name : string.Empty,
                    Rating = nf.Rating,
                    Comment = nf.Comment,
                    UnitCode = nf.UnitCode,
                    GuestName = nf.GuestName,
                    SubmittedAt = nf.SubmittedAt,
                    Status = nf.Status,
                    ResolvedAt = nf.ResolvedAt,
                    ResolvedByName = nf.ResolvedByUser != null
                        ? nf.ResolvedByUser.FullName
                        : null,
                    ResolutionNotes = nf.ResolutionNotes
                })
                .ToListAsync();

            // Compute stats
            var now = DateTime.UtcNow;
            var weekAgo = now.AddDays(-7);
            var monthAgo = now.AddDays(-30);

            var allFeedbacks = await _context.NegativeFeedbacks
                .Where(nf => businessVenueIds.Contains(nf.VenueId))
                .ToListAsync();

            return Ok(new BizFeedbackStatsDto
            {
                TotalCount = allFeedbacks.Count,
                ThisWeek = allFeedbacks.Count(f => f.SubmittedAt >= weekAgo),
                ThisMonth = allFeedbacks.Count(f => f.SubmittedAt >= monthAgo),
                AverageRating = allFeedbacks.Any()
                    ? Math.Round(allFeedbacks.Average(f => f.Rating), 1)
                    : 0,
                Feedbacks = feedbacks
            });
        }

        // PUT: api/business/feedback/5/status
        [HttpPut("{id}/status")]
        public async Task<ActionResult<BizFeedbackStatusResponseDto>> UpdateFeedbackStatus(
            int id, BizUpdateFeedbackStatusRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var validStatuses = new[] { "Intercepted", "Resolved", "Escalated" };
            if (!validStatuses.Contains(request.Status))
            {
                return BadRequest($"Invalid status. Must be one of: {string.Join(", ", validStatuses)}");
            }

            var feedback = await _context.NegativeFeedbacks
                .Include(nf => nf.Venue)
                .FirstOrDefaultAsync(nf => nf.Id == id);

            if (feedback == null)
            {
                return NotFound();
            }

            // Verify feedback belongs to a venue in this business
            if (feedback.Venue?.BusinessId != businessId.Value)
            {
                return NotFound();
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int? userId = int.TryParse(userIdClaim, out var parsedId) ? parsedId : null;

            feedback.Status = request.Status;
            feedback.ResolutionNotes = request.ResolutionNotes;

            if (request.Status == "Resolved" || request.Status == "Escalated")
            {
                feedback.ResolvedAt = DateTime.UtcNow;
                feedback.ResolvedBy = userId;
            }

            await _context.SaveChangesAsync();

            // Load resolver name
            string? resolvedByName = null;
            if (feedback.ResolvedBy.HasValue)
            {
                var resolver = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == feedback.ResolvedBy.Value);
                resolvedByName = resolver?.FullName;
            }

            return Ok(new BizFeedbackStatusResponseDto
            {
                Id = feedback.Id,
                Status = feedback.Status,
                ResolvedAt = feedback.ResolvedAt,
                ResolvedBy = feedback.ResolvedBy,
                ResolvedByName = resolvedByName,
                ResolutionNotes = feedback.ResolutionNotes
            });
        }
    }
}
