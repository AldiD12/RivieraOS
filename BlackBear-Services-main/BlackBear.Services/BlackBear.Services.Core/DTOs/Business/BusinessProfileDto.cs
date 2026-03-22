using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    public class BusinessProfileDto
    {
        public int Id { get; set; }
        public string RegisteredName { get; set; } = string.Empty;
        public string? BrandName { get; set; }
        public string? TaxId { get; set; }
        public string? ContactEmail { get; set; }
        public string? LogoUrl { get; set; }
        public string SubscriptionStatus { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateBusinessProfileRequest
    {
        [MaxLength(255)]
        public string? BrandName { get; set; }

        [MaxLength(255)]
        [EmailAddress]
        public string? ContactEmail { get; set; }

        [MaxLength(500)]
        public string? LogoUrl { get; set; }
    }
}
