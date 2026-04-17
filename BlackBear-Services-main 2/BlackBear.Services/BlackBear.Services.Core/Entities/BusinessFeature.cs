using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("core_business_features")]
    public class BusinessFeature
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("business_id")]
        public int BusinessId { get; set; }

        [Column("has_digital_menu")]
        public bool HasDigitalMenu { get; set; } = true;

        [Column("has_table_ordering")]
        public bool HasTableOrdering { get; set; } = false;

        [Column("has_bookings")]
        public bool HasBookings { get; set; } = false;

        [Column("has_events")]
        public bool HasEvents { get; set; } = false;

        [Column("has_pulse")]
        public bool HasPulse { get; set; } = false;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public Business Business { get; set; } = null!;
    }
}
