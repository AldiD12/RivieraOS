using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    // List item DTO
    public class BusinessListItemDto
    {
        public int Id { get; set; }
        public string RegisteredName { get; set; } = string.Empty;
        public string? BrandName { get; set; }
        public string? ContactEmail { get; set; }
        public string SubscriptionStatus { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int VenueCount { get; set; }
        public int UserCount { get; set; }
    }

    // Detail DTO (includes more info)
    public class BusinessDetailDto
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
        public List<VenueSummaryDto> Venues { get; set; } = new();
        public List<UserSummaryDto> Users { get; set; } = new();
    }

    public class VenueSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Address { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserSummaryDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
    }

    // Create request
    public class CreateBusinessRequest
    {
        [Required]
        [MaxLength(255)]
        public string RegisteredName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? BrandName { get; set; }

        [MaxLength(50)]
        public string? TaxId { get; set; }

        [MaxLength(255)]
        [EmailAddress]
        public string? ContactEmail { get; set; }

        [MaxLength(500)]
        [Url]
        public string? LogoUrl { get; set; }

        [MaxLength(50)]
        public string SubscriptionStatus { get; set; } = "Trial";
    }

    // Update request
    public class UpdateBusinessRequest
    {
        [Required]
        [MaxLength(255)]
        public string RegisteredName { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? BrandName { get; set; }

        [MaxLength(50)]
        public string? TaxId { get; set; }

        [MaxLength(255)]
        [EmailAddress]
        public string? ContactEmail { get; set; }

        [MaxLength(500)]
        [Url]
        public string? LogoUrl { get; set; }

        [MaxLength(50)]
        public string SubscriptionStatus { get; set; } = "Trial";

        public bool IsActive { get; set; } = true;
    }

    // Paginated response wrapper
    public class PaginatedResponse<T>
    {
        public List<T> Items { get; set; } = new();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPrevious => Page > 1;
        public bool HasNext => Page < TotalPages;
    }
}
