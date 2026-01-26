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

        // Foreign key
        [Column("venue_id")]
        public int VenueId { get; set; }

        // Navigation properties
        [ForeignKey("VenueId")]
        public Venue Venue { get; set; } = null!;

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
