using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("core_businesses")]
    public class Business
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string RegisteredName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? BrandName { get; set; }

        [MaxLength(50)]
        public string? TaxId { get; set; }

        [MaxLength(255)]
        public string? ContactEmail { get; set; }

        [MaxLength(50)]
        public string SubscriptionStatus { get; set; } = "Trial";

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public ICollection<User> Users { get; set; } = new List<User>();
        public ICollection<Venue> Venues { get; set; } = new List<Venue>();
    }
}
