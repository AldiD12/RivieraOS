using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_category_venue_exclusions")]
    [PrimaryKey(nameof(CategoryId), nameof(VenueId))]
    public class CategoryVenueExclusion
    {
        [Column("category_id")]
        public int CategoryId { get; set; }

        [Column("venue_id")]
        public int VenueId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }
    }
}
