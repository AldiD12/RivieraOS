using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("events_scheduled")]
    public class ScheduledEvent
    {
        [Key]
        [Column("event_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [MaxLength(500)]
        [Column("flyer_image_url")]
        public string? FlyerImageUrl { get; set; }

        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime EndTime { get; set; }

        [Column("is_ticketed")]
        public bool IsTicketed { get; set; } = false;

        [Column("ticket_price", TypeName = "decimal(10,2)")]
        public decimal TicketPrice { get; set; } = 0;

        [Column("max_guests")]
        public int MaxGuests { get; set; } = 0;

        [Column("is_published")]
        public bool IsPublished { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Soft delete
        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign key
        [Column("venue_id")]
        public int VenueId { get; set; }

        // Navigation properties
        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        public ICollection<EventBooking> EventBookings { get; set; } = new List<EventBooking>();
    }
}
