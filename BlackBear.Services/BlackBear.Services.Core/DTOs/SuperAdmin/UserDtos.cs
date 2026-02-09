using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class UserListItemDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
        public bool HasPinSet { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? BusinessId { get; set; }
        public string? BusinessName { get; set; }
    }

    public class UserDetailDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? UserType { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
        public bool HasPinSet { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? BusinessId { get; set; }
        public string? BusinessName { get; set; }
    }

    public class CreateUserRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? FullName { get; set; }

        [MaxLength(50)]
        public string? PhoneNumber { get; set; }

        [StringLength(4, MinimumLength = 4)]
        [RegularExpression(@"^\d{4}$", ErrorMessage = "PIN must be exactly 4 digits")]
        public string? Pin { get; set; }

        [Required]
        public string Role { get; set; } = "Staff";
    }

    public class UpdateUserRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? FullName { get; set; }

        [MaxLength(50)]
        public string? PhoneNumber { get; set; }

        [Required]
        public string Role { get; set; } = "Staff";

        [StringLength(4, MinimumLength = 4)]
        [RegularExpression(@"^\d{4}$", ErrorMessage = "PIN must be exactly 4 digits")]
        public string? Pin { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class ResetPasswordRequest
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class CreateSuperAdminRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? FullName { get; set; }

        [MaxLength(50)]
        public string? PhoneNumber { get; set; }
    }
}
