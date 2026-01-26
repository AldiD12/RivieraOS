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

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Venue> Venues { get; set; } = new List<Venue>();
    }
}
