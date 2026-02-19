using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    // List item DTO for zone units
    public class BizZoneUnitListItemDto
    {
        public int Id { get; set; }
        public string UnitCode { get; set; } = string.Empty;
        public string UnitType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal? BasePrice { get; set; }
        public int? PositionX { get; set; }
        public int? PositionY { get; set; }
        public string QrCode { get; set; } = string.Empty;
        public int VenueZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public BizCurrentBookingDto? CurrentBooking { get; set; }
    }

    // Detail DTO for a single zone unit
    public class BizZoneUnitDetailDto
    {
        public int Id { get; set; }
        public string UnitCode { get; set; } = string.Empty;
        public string UnitType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal? BasePrice { get; set; }
        public int? PositionX { get; set; }
        public int? PositionY { get; set; }
        public string QrCode { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public int VenueZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public BizCurrentBookingDto? CurrentBooking { get; set; }
    }

    // Current booking summary for unit display
    public class BizCurrentBookingDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? GuestName { get; set; }
        public int GuestCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? CheckedInAt { get; set; }
    }

    // Create zone unit request
    public class BizCreateZoneUnitRequest
    {
        [Required]
        [MaxLength(20)]
        public string UnitCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string UnitType { get; set; } = "Sunbed";

        public decimal? BasePrice { get; set; }

        public int? PositionX { get; set; }

        public int? PositionY { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required]
        public int VenueZoneId { get; set; }
    }

    // Update zone unit request
    public class BizUpdateZoneUnitRequest
    {
        [MaxLength(20)]
        public string? UnitCode { get; set; }

        [MaxLength(50)]
        public string? UnitType { get; set; }

        public decimal? BasePrice { get; set; }

        public int? PositionX { get; set; }

        public int? PositionY { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Update unit status request (for QR scan workflow)
    public class BizUpdateUnitStatusRequest
    {
        [Required]
        [RegularExpression("^(Available|Reserved|Occupied|Maintenance)$",
            ErrorMessage = "Status must be Available, Reserved, Occupied, or Maintenance")]
        public string Status { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Bulk create units request
    public class BizBulkCreateUnitsRequest
    {
        [Required]
        public int VenueZoneId { get; set; }

        [Required]
        [MaxLength(50)]
        public string UnitType { get; set; } = "Sunbed";

        [Required(AllowEmptyStrings = true)]
        [MaxLength(10)]
        public string Prefix { get; set; } = string.Empty;

        [Required]
        [Range(1, 100)]
        public int StartNumber { get; set; } = 1;

        [Required]
        [Range(1, 100)]
        public int Count { get; set; } = 1;

        public decimal? BasePrice { get; set; }
    }

    // Response for bulk create
    public class BizBulkCreateUnitsResponse
    {
        public int CreatedCount { get; set; }
        public List<BizZoneUnitListItemDto> Units { get; set; } = new();
    }
}
