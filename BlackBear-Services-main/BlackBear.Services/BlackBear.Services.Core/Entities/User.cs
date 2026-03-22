using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("core_users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password_hash")]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(150)]
        [Column("full_name")]
        public string? FullName { get; set; }

        [MaxLength(50)]
        [Column("phone_number")]
        public string? PhoneNumber { get; set; }

        [MaxLength(100)]
        [Column("pin_hash")]
        public string? PinHash { get; set; }

        [MaxLength(50)]
        [Column("user_type")]
        public string? UserType { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys (nullable)
        [Column("business_id")]
        public int? BusinessId { get; set; }

        [Column("venue_id")]
        public int? VenueId { get; set; }

        // Navigation properties
        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
        public ICollection<EventBooking> EventBookings { get; set; } = new List<EventBooking>();
    }
}
