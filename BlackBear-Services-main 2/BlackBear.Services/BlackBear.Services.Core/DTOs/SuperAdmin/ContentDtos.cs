using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class ContentListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? ContentUrl { get; set; }
        public string? Author { get; set; }
        public int? VenueId { get; set; }
        public string? VenueName { get; set; }
        public DateTime PublishedAt { get; set; }
        public int? ReadTimeMinutes { get; set; }
        public bool IsActive { get; set; }
        public int SortOrder { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateContentRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string ContentType { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [MaxLength(500)]
        public string? ContentUrl { get; set; }

        [MaxLength(100)]
        public string? Author { get; set; }

        public int? VenueId { get; set; }

        public DateTime? PublishedAt { get; set; }

        public int? ReadTimeMinutes { get; set; }

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;
    }

    public class UpdateContentRequest
    {
        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string ContentType { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [MaxLength(500)]
        public string? ContentUrl { get; set; }

        [MaxLength(100)]
        public string? Author { get; set; }

        public int? VenueId { get; set; }

        public DateTime? PublishedAt { get; set; }

        public int? ReadTimeMinutes { get; set; }

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;
    }
}
