using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("content_items")]
    public class Content
    {
        [Key]
        [Column("content_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("title")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        [Column("description")]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("content_type")]
        public string ContentType { get; set; } = string.Empty;

        [MaxLength(500)]
        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [MaxLength(500)]
        [Column("content_url")]
        public string? ContentUrl { get; set; }

        [MaxLength(100)]
        [Column("author")]
        public string? Author { get; set; }

        [Column("venue_id")]
        public int? VenueId { get; set; }

        [Column("published_at")]
        public DateTime PublishedAt { get; set; }

        [Column("read_time_minutes")]
        public int? ReadTimeMinutes { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("sort_order")]
        public int SortOrder { get; set; } = 0;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }
    }
}
