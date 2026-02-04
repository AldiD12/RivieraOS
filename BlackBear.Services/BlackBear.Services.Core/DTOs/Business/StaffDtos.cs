using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    public class BizStaffListItemDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
        public bool HasPinSet { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BizStaffDetailDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
        public bool HasPinSet { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class BizCreateStaffRequest
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

    public class BizUpdateStaffRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? FullName { get; set; }

        [MaxLength(50)]
        public string? PhoneNumber { get; set; }

        [StringLength(4, MinimumLength = 4)]
        [RegularExpression(@"^\d{4}$", ErrorMessage = "PIN must be exactly 4 digits")]
        public string? Pin { get; set; }

        [Required]
        public string Role { get; set; } = "Staff";

        public bool IsActive { get; set; } = true;
    }

    public class BizResetStaffPasswordRequest
    {
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class BizSetStaffPinRequest
    {
        [Required]
        [StringLength(4, MinimumLength = 4)]
        [RegularExpression(@"^\d{4}$", ErrorMessage = "PIN must be exactly 4 digits")]
        public string Pin { get; set; } = string.Empty;
    }
}
