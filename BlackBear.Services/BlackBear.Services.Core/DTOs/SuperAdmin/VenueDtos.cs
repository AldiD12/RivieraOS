using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    // List item DTO
    public class VenueListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool OrderingEnabled { get; set; }
        public bool? IsDigitalOrderingEnabled { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
        public int ZoneCount { get; set; }
        public bool HasConfig { get; set; }
    }

    // Detail DTO
    public class VenueDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public bool OrderingEnabled { get; set; }
        public bool? IsDigitalOrderingEnabled { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public VenueConfigDto? Config { get; set; }
        public List<ZoneSummaryDto> Zones { get; set; } = new();
    }

    // Config DTO
    public class VenueConfigDto
    {
        public int Id { get; set; }
        public bool IsBookingEnabled { get; set; }
        public bool IsSelfServiceEnabled { get; set; }
        public bool IsEventModeEnabled { get; set; }
        public int MaxCapacity { get; set; }
        public decimal BookingDepositAmount { get; set; }
    }

    // Zone summary for venue detail
    public class ZoneSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int CapacityPerUnit { get; set; }
        public decimal BasePrice { get; set; }
    }

    // Create venue request
    public class CreateVenueRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Type { get; set; }

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public bool OrderingEnabled { get; set; } = false;

        public bool? IsDigitalOrderingEnabled { get; set; }
    }

    // Update venue request
    public class UpdateVenueRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Type { get; set; }

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public bool OrderingEnabled { get; set; }

        public bool? IsDigitalOrderingEnabled { get; set; }
    }

    // Update config request
    public class UpdateVenueConfigRequest
    {
        public bool IsBookingEnabled { get; set; }
        public bool IsSelfServiceEnabled { get; set; }
        public bool IsEventModeEnabled { get; set; }
        public int MaxCapacity { get; set; }
        public decimal BookingDepositAmount { get; set; }
    }
}
