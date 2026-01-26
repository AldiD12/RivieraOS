using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("core_users")]
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? FullName { get; set; }

        [MaxLength(50)]
        public string? UserType { get; set; }

        public bool IsActive { get; set; } = true;

        // Foreign key (nullable)
        public int? BusinessId { get; set; }

        // Navigation property
        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }
    }
}
