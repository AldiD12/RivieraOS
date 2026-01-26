using Microsoft.EntityFrameworkCore;
using RivieraApi.Data;

namespace RivieraApi.Modules.Feedback.Services;

public class ReviewService
{
    private readonly RivieraDbContext _context;

    public ReviewService(RivieraDbContext context)
    {
        _context = context;
    }

    public async Task<(Review review, bool shouldRedirect)> CreateReviewAsync(CreateReviewDto dto)
    {
        var review = new Review
        {
            VenueId = dto.VenueId,
            UserId = dto.UserId,
            CustomerName = dto.CustomerName,
            CustomerEmail = dto.CustomerEmail,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        // Smart routing: Low ratings stay internal
        if (dto.Rating < 4)
        {
            review.Status = ReviewStatus.Pending; // Internal review
            review.PublishedAt = null;
        }
        else
        {
            review.Status = ReviewStatus.Approved; // Good reviews get approved
            review.PublishedAt = DateTime.UtcNow;
        }

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Return flag to redirect to Google if rating >= 4
        bool shouldRedirect = dto.Rating >= 4;

        return (review, shouldRedirect);
    }

    public async Task<List<Review>> GetReviewsAsync(int venueId, ReviewStatus? status = null)
    {
        var query = _context.Reviews
            .Include(r => r.Venue)
            .Where(r => r.VenueId == venueId);

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        return await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
    }

    public async Task<Review?> UpdateReviewStatusAsync(int reviewId, ReviewStatus newStatus)
    {
        var review = await _context.Reviews.FindAsync(reviewId);
        if (review == null) return null;

        review.Status = newStatus;
        
        if (newStatus == ReviewStatus.Published && review.PublishedAt == null)
        {
            review.PublishedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return review;
    }
}

public class CreateReviewDto
{
    public int VenueId { get; set; }
    public int? UserId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
}
