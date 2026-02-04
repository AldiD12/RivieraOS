using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs
{
    public class PinLoginRequest
    {
        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(4, MinimumLength = 4)]
        [RegularExpression(@"^\d{4}$", ErrorMessage = "PIN must be exactly 4 digits")]
        public string Pin { get; set; } = string.Empty;
    }
}
