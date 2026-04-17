using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("feedback_reviews")]
    public class Review
    {
        [Key]
        [Column("review_id")]
        public int Id { get; set; }

        [Required]
        [Column("rating")]
        public int Rating { get; set; }

        [MaxLength(1000)]
        [Column("comment")]
        public string? Comment { get; set; }

        [MaxLength(100)]
        [Column("customer_name")]
        public string? CustomerName { get; set; }

        [MaxLength(255)]
        [Column("customer_email")]
        public string? CustomerEmail { get; set; }

        [Column("is_public")]
        public bool IsPublic { get; set; } = false;

        [Column("redirected_to_google")]
        public bool RedirectedToGoogle { get; set; } = false;

        [Column("alert_sent")]
        public bool AlertSent { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign keys
        [Column("venue_id")]
        public int VenueId { get; set; }

        [Column("business_id")]
        public int BusinessId { get; set; }

        [Column("user_id")]
        public int? UserId { get; set; }

        [Column("order_id")]
        public int? OrderId { get; set; }

        [Column("booking_id")]
        public int? BookingId { get; set; }

        // Navigation properties
        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        [ForeignKey("BookingId")]
        public ZoneUnitBooking? Booking { get; set; }
    }
}
