using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicSubmitFeedbackRequest
    {
        [Required]
        public int VenueId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        [MaxLength(50)]
        public string? UnitCode { get; set; }

        [MaxLength(200)]
        public string? GuestName { get; set; }

        [MaxLength(50)]
        public string? GuestPhone { get; set; }

        public DateTime? SubmittedAt { get; set; }
    }

    public class PublicFeedbackResponseDto
    {
        public int Id { get; set; }
        public int VenueId { get; set; }
        public int Rating { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}
