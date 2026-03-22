using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_products")]
    public class Product
    {
        [Key]
        [Column("product_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        [Column("description")]
        public string? Description { get; set; }

        [MaxLength(500)]
        [Column("image_url")]
        public string? ImageUrl { get; set; }

        [Column("price", TypeName = "decimal(10,2)")]
        public decimal Price { get; set; } = 0;

        [Column("old_price", TypeName = "decimal(10,2)")]
        public decimal? OldPrice { get; set; }

        [Column("is_available")]
        public bool IsAvailable { get; set; } = true;

        [Column("is_alcohol")]
        public bool IsAlcohol { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign keys
        [Column("category_id")]
        public int CategoryId { get; set; }

        [Column("business_id")]
        public int BusinessId { get; set; }

        // Navigation properties
        [ForeignKey("CategoryId")]
        public Category? Category { get; set; }

        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        public ICollection<ProductVenueExclusion> VenueExclusions { get; set; } = new List<ProductVenueExclusion>();
    }
}
