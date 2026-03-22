using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    public class BizFeedbackListItemDto
    {
        public int Id { get; set; }
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string? UnitCode { get; set; }
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? ResolvedAt { get; set; }
        public string? ResolvedByName { get; set; }
        public string? ResolutionNotes { get; set; }
    }

    public class BizFeedbackStatsDto
    {
        public int TotalCount { get; set; }
        public int ThisWeek { get; set; }
        public int ThisMonth { get; set; }
        public double AverageRating { get; set; }
        public List<BizFeedbackListItemDto> Feedbacks { get; set; } = new();
    }

    public class BizUpdateFeedbackStatusRequest
    {
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ResolutionNotes { get; set; }
    }

    public class BizFeedbackStatusResponseDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? ResolvedAt { get; set; }
        public int? ResolvedBy { get; set; }
        public string? ResolvedByName { get; set; }
        public string? ResolutionNotes { get; set; }
    }

    public class BizZoneAvailabilityOverrideRequest
    {
        [Required]
        public bool IsAvailable { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }

        public DateTime? OverrideUntil { get; set; }
    }

    public class BizZoneAvailabilityResponseDto
    {
        public int ZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public int AvailableUnits { get; set; }
        public int TotalUnits { get; set; }
        public bool IsManualOverride { get; set; }
        public string? OverrideReason { get; set; }
        public DateTime? OverrideUntil { get; set; }
    }
}
