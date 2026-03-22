using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("catalog_categories")]
    public class Category
    {
        [Key]
        [Column("category_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("sort_order")]
        public int SortOrder { get; set; } = 0;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign key - now at Business level
        [Column("business_id")]
        public int BusinessId { get; set; }

        // Navigation properties
        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
        public ICollection<CategoryVenueExclusion> VenueExclusions { get; set; } = new List<CategoryVenueExclusion>();
    }
}
