using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicSubmitReviewRequest
    {
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [MaxLength(100)]
        public string? CustomerName { get; set; }

        [EmailAddress]
        [MaxLength(255)]
        public string? CustomerEmail { get; set; }

        public int? OrderId { get; set; }
        public int? BookingId { get; set; }
    }

    public class PublicReviewResponseDto
    {
        public int ReviewId { get; set; }
        public bool ShouldRedirectToGoogle { get; set; }
        public string? GoogleMapsUrl { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class PublicReviewListItemDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string CustomerName { get; set; } = "Anonymous";
        public DateTime CreatedAt { get; set; }
    }

    public class PublicReviewListDto
    {
        public List<PublicReviewListItemDto> Reviews { get; set; } = new();
        public int TotalCount { get; set; }
        public double AverageRating { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class PublicRatingSummaryDto
    {
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public PublicRatingDistributionDto Distribution { get; set; } = new();
    }

    public class PublicRatingDistributionDto
    {
        public int Star5 { get; set; }
        public int Star4 { get; set; }
        public int Star3 { get; set; }
        public int Star2 { get; set; }
        public int Star1 { get; set; }
    }
}
