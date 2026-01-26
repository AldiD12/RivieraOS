using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_venues")]
    public class Venue
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Type { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        // Spatial data (simple doubles for now, can migrate to NetTopologySuite later)
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // Foreign key
        public int BusinessId { get; set; }

        // Navigation properties
        [ForeignKey("BusinessId")]
        public Business Business { get; set; } = null!;

        public VenueConfig? VenueConfig { get; set; }
    }
}
