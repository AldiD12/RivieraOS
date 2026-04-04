using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("core_businesses")]
    public class Business
    {
        [Key]
        [Column("business_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("registered_name")]
        public string RegisteredName { get; set; } = string.Empty;

        [MaxLength(255)]
        [Column("brand_name")]
        public string? BrandName { get; set; }

        [MaxLength(50)]
        [Column("tax_id")]
        public string? TaxId { get; set; }

        [MaxLength(255)]
        [Column("contact_email")]
        public string? ContactEmail { get; set; }

        [MaxLength(500)]
        [Column("logo_url")]
        public string? LogoUrl { get; set; }

        [MaxLength(50)]
        [Column("subscription_status")]
        public string SubscriptionStatus { get; set; } = "Trial";

        [MaxLength(500)]
        [Column("google_maps_address")]
        public string? GoogleMapsAddress { get; set; }

        [MaxLength(500)]
        [Column("review_link")]
        public string? ReviewLink { get; set; }

        [MaxLength(50)]
        [Column("phone_number")]
        public string? PhoneNumber { get; set; }

        [MaxLength(255)]
        [Column("operation_zone")]
        public string? OperationZone { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Navigation properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Venue> Venues { get; set; } = new List<Venue>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<Product> Products { get; set; } = new List<Product>();
        public BusinessFeature? Feature { get; set; }
    }
}
