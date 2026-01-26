using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_venue_configs")]
    public class VenueConfig
    {
        [Key]
        public int Id { get; set; }

        public bool IsBookingEnabled { get; set; } = false;

        public bool IsSelfServiceEnabled { get; set; } = false;

        public bool IsEventModeEnabled { get; set; } = false;

        public int MaxCapacity { get; set; } = 0;

        // Foreign key
        public int VenueId { get; set; }

        // Navigation property
        [ForeignKey("VenueId")]
        public Venue Venue { get; set; } = null!;
    }
}
