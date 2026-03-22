using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_venue_configs")]
    public class VenueConfig
    {
        [Key]
        [Column("config_id")]
        public int Id { get; set; }

        [Column("is_booking_enabled")]
        public bool IsBookingEnabled { get; set; } = false;

        [Column("is_self_service_enabled")]
        public bool IsSelfServiceEnabled { get; set; } = false;

        [Column("is_event_mode_enabled")]
        public bool IsEventModeEnabled { get; set; } = false;

        [Column("max_capacity")]
        public int MaxCapacity { get; set; } = 0;

        [Column("booking_deposit_amount", TypeName = "decimal(10,2)")]
        public decimal BookingDepositAmount { get; set; } = 0;

        // Foreign key
        [Column("venue_id")]
        public int VenueId { get; set; }

        // Navigation property
        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }
    }
}
