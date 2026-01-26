using Microsoft.AspNetCore.Mvc;
using RivieraApi.Modules.Feedback.Services;

namespace RivieraApi.Modules.Feedback.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;

    public ReviewController(ReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    // POST /api/review
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
        {
            return BadRequest(new { message = "Rating must be between 1 and 5" });
        }

        try
        {
            var (review, shouldRedirect) = await _reviewService.CreateReviewAsync(dto);

            return Ok(new
            {
                message = "Review submitted successfully",
                reviewId = review.Id,
                redirect = shouldRedirect,
                redirectMessage = shouldRedirect 
                    ? "Thank you! Please share your experience on Google." 
                    : "Thank you for your feedback. We'll work on improving."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Failed to submit review", error = ex.Message });
        }
    }

    // GET /api/review/venue/{venueId}
    [HttpGet("venue/{venueId}")]
    public async Task<IActionResult> GetVenueReviews(int venueId, [FromQuery] ReviewStatus? status)
    {
        var reviews = await _reviewService.GetReviewsAsync(venueId, status);

        return Ok(reviews.Select(r => new
        {
            r.Id,
            r.VenueId,
            venueName = r.Venue.Name,
            r.CustomerName,
            r.Rating,
            r.Comment,
            r.Status,
            r.CreatedAt,
            r.PublishedAt
        }));
    }

    // PATCH /api/review/{id}/status
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateReviewStatus(int id, [FromBody] UpdateReviewStatusRequest request)
    {
        var review = await _reviewService.UpdateReviewStatusAsync(id, request.Status);
        
        if (review == null)
        {
            return NotFound(new { message = "Review not found" });
        }

        return Ok(new
        {
            message = "Review status updated",
            reviewId = id,
            status = request.Status
        });
    }
}

public class UpdateReviewStatusRequest
{
    public ReviewStatus Status { get; set; }
}
