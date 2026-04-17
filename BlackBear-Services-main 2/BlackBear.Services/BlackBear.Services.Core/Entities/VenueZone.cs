using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_venue_zones")]
    public class VenueZone
    {
        [Key]
        [Column("zone_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("zone_type")]
        public string? ZoneType { get; set; }

        [Column("capacity_per_unit")]
        public int CapacityPerUnit { get; set; } = 0;

        [Column("base_price", TypeName = "decimal(10,2)")]
        public decimal BasePrice { get; set; } = 0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        // Manual availability override fields
        [Column("is_manual_override")]
        public bool IsManualOverride { get; set; } = false;

        [MaxLength(500)]
        [Column("override_reason")]
        public string? OverrideReason { get; set; }

        [Column("override_until")]
        public DateTime? OverrideUntil { get; set; }

        [Column("override_by")]
        public int? OverrideBy { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign key
        [Column("venue_id")]
        public int VenueId { get; set; }

        // Navigation property
        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }
    }
}
