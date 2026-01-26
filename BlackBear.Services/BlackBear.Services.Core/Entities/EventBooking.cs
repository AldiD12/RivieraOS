using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("events_bookings")]
    public class EventBooking
    {
        [Key]
        [Column("booking_id")]
        public int Id { get; set; }

        [MaxLength(50)]
        [Column("status")]
        public string Status { get; set; } = "Pending";

        [Column("guest_count")]
        public int GuestCount { get; set; } = 1;

        [Column("total_paid", TypeName = "decimal(10,2)")]
        public decimal TotalPaid { get; set; } = 0;

        [Column("booking_date")]
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        // Foreign keys
        [Column("event_id")]
        public int EventId { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        // Navigation properties
        [ForeignKey("EventId")]
        public ScheduledEvent? ScheduledEvent { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
