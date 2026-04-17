using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    public class BizVenueListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public bool OrderingEnabled { get; set; }
        public bool? IsDigitalOrderingEnabled { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
        public int ZoneCount { get; set; }
        public bool HasConfig { get; set; }
    }

    public class BizVenueDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool IsActive { get; set; }
        public bool OrderingEnabled { get; set; }
        public bool? IsDigitalOrderingEnabled { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
        public DateTime CreatedAt { get; set; }
        public BizVenueConfigDto? Config { get; set; }
        public List<BizZoneSummaryDto> Zones { get; set; } = new();
    }

    public class BizVenueConfigDto
    {
        public int Id { get; set; }
        public bool IsBookingEnabled { get; set; }
        public bool IsSelfServiceEnabled { get; set; }
        public bool IsEventModeEnabled { get; set; }
        public int MaxCapacity { get; set; }
        public decimal BookingDepositAmount { get; set; }
    }

    public class BizZoneSummaryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int CapacityPerUnit { get; set; }
        public decimal BasePrice { get; set; }
    }

    public class BizCreateVenueRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Type { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public bool OrderingEnabled { get; set; } = false;

        public bool? IsDigitalOrderingEnabled { get; set; }
    }

    public class BizUpdateVenueRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? Type { get; set; }

        [MaxLength(500)]
        public string? Address { get; set; }

        [MaxLength(500)]
        [Url]
        public string? ImageUrl { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public bool OrderingEnabled { get; set; }

        public bool? IsDigitalOrderingEnabled { get; set; }
    }

    public class BizUpdateVenueConfigRequest
    {
        public bool IsBookingEnabled { get; set; }
        public bool IsSelfServiceEnabled { get; set; }
        public bool IsEventModeEnabled { get; set; }
        [Range(0, 10000)]
        public int MaxCapacity { get; set; }
        [Range(0, 99999)]
        public decimal BookingDepositAmount { get; set; }
    }
}
