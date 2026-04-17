using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("venue_zone_units")]
    public class ZoneUnit
    {
        [Key]
        [Column("unit_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("unit_code")]
        public string UnitCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("unit_type")]
        public string UnitType { get; set; } = "Sunbed";

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Available";

        [Column("base_price", TypeName = "decimal(10,2)")]
        public decimal? BasePrice { get; set; }

        [Column("position_x")]
        public int? PositionX { get; set; }

        [Column("position_y")]
        public int? PositionY { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("qr_code")]
        public string QrCode { get; set; } = string.Empty;

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
        [Column("zone_id")]
        public int VenueZoneId { get; set; }

        [Column("venue_id")]
        public int VenueId { get; set; }

        [Column("business_id")]
        public int BusinessId { get; set; }

        [Column("current_booking_id")]
        public int? CurrentBookingId { get; set; }

        // Navigation properties
        [ForeignKey("VenueZoneId")]
        public VenueZone? VenueZone { get; set; }

        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        [ForeignKey("CurrentBookingId")]
        public ZoneUnitBooking? CurrentBooking { get; set; }

        public ICollection<ZoneUnitBooking> Bookings { get; set; } = new List<ZoneUnitBooking>();
    }
}
