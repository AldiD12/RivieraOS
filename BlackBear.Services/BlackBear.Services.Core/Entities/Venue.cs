using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_venues")]
    public class Venue
    {
        [Key]
        [Column("venue_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        [Column("type")]
        public string? Type { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [MaxLength(500)]
        [Column("address")]
        public string? Address { get; set; }

        [MaxLength(500)]
        [Column("image_url")]
        public string? ImageUrl { get; set; }

        // Spatial data (simple doubles for now)
        [Column("latitude")]
        public double? Latitude { get; set; }

        [Column("longitude")]
        public double? Longitude { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign key
        [Column("business_id")]
        public int BusinessId { get; set; }

        // Navigation properties
        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        public VenueConfig? VenueConfig { get; set; }
        public ICollection<VenueZone> VenueZones { get; set; } = new List<VenueZone>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<ScheduledEvent> ScheduledEvents { get; set; } = new List<ScheduledEvent>();
    }
}
