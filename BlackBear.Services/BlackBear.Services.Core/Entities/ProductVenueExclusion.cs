using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_product_venue_exclusions")]
    [PrimaryKey(nameof(ProductId), nameof(VenueId))]
    public class ProductVenueExclusion
    {
        [Column("product_id")]
        public int ProductId { get; set; }

        [Column("venue_id")]
        public int VenueId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("ProductId")]
        public Product? Product { get; set; }

        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }
    }
}
