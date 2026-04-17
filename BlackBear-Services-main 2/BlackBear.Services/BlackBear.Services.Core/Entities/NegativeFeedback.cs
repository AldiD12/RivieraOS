using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("feedback_negative")]
    public class NegativeFeedback
    {
        [Key]
        [Column("feedback_id")]
        public int Id { get; set; }

        [Column("venue_id")]
        public int VenueId { get; set; }

        [Column("business_id")]
        public int BusinessId { get; set; }

        [Required]
        [Column("rating")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        [Column("comment")]
        public string? Comment { get; set; }

        [MaxLength(50)]
        [Column("unit_code")]
        public string? UnitCode { get; set; }

        [MaxLength(200)]
        [Column("guest_name")]
        public string? GuestName { get; set; }

        [MaxLength(50)]
        [Column("guest_phone")]
        public string? GuestPhone { get; set; }

        [Column("submitted_at")]
        public DateTime SubmittedAt { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "Intercepted";

        [Column("resolved_at")]
        public DateTime? ResolvedAt { get; set; }

        [Column("resolved_by")]
        public int? ResolvedBy { get; set; }

        [MaxLength(1000)]
        [Column("resolution_notes")]
        public string? ResolutionNotes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        [ForeignKey("ResolvedBy")]
        public User? ResolvedByUser { get; set; }
    }
}
