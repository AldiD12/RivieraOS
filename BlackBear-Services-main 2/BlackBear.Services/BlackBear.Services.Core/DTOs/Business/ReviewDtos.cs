namespace BlackBear.Services.Core.DTOs.Business
{
    public class BizReviewListItemDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public bool IsPublic { get; set; }
        public bool AlertSent { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? OrderId { get; set; }
        public int? BookingId { get; set; }
    }

    public class BizReviewListDto
    {
        public List<BizReviewListItemDto> Reviews { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class BizReviewStatsDto
    {
        public int Total { get; set; }
        public int PublicCount { get; set; }
        public int PrivateCount { get; set; }
        public double AverageRating { get; set; }
        public double PublicAverageRating { get; set; }
        public BizRatingDistributionDto Distribution { get; set; } = new();
        public List<BizRecentLowRatingDto> RecentLowRatings { get; set; } = new();
    }

    public class BizRatingDistributionDto
    {
        public int Star5 { get; set; }
        public int Star4 { get; set; }
        public int Star3 { get; set; }
        public int Star2 { get; set; }
        public int Star1 { get; set; }
    }

    public class BizRecentLowRatingDto
    {
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
