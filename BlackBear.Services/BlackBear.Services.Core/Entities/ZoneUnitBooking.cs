using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("venue_zone_unit_bookings")]
    public class ZoneUnitBooking
    {
        [Key]
        [Column("booking_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("booking_code")]
        public string BookingCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Active";

        [MaxLength(100)]
        [Column("guest_name")]
        public string? GuestName { get; set; }

        [MaxLength(50)]
        [Column("guest_phone")]
        public string? GuestPhone { get; set; }

        [MaxLength(255)]
        [Column("guest_email")]
        public string? GuestEmail { get; set; }

        [Column("guest_count")]
        public int GuestCount { get; set; } = 1;

        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime? EndTime { get; set; }

        [Column("checked_in_at")]
        public DateTime? CheckedInAt { get; set; }

        [Column("checked_out_at")]
        public DateTime? CheckedOutAt { get; set; }

        [MaxLength(500)]
        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign keys
        [Column("zone_unit_id")]
        public int ZoneUnitId { get; set; }

        [Column("venue_id")]
        public int VenueId { get; set; }

        [Column("business_id")]
        public int BusinessId { get; set; }

        [Column("handled_by_user_id")]
        public int? HandledByUserId { get; set; }

        // Navigation properties
        [ForeignKey("ZoneUnitId")]
        public ZoneUnit? ZoneUnit { get; set; }

        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        [ForeignKey("HandledByUserId")]
        public User? HandledByUser { get; set; }
    }
}
