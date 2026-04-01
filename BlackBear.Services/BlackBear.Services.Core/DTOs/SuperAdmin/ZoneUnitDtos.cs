using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class ZoneUnitListItemDto
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
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public CurrentBookingDto? CurrentBooking { get; set; }
    }

    public class ZoneUnitDetailDto
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
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public DateTime CreatedAt { get; set; }
        public CurrentBookingDto? CurrentBooking { get; set; }
    }

    public class CurrentBookingDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? GuestName { get; set; }
        public int GuestCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? CheckedInAt { get; set; }
    }

    public class CreateZoneUnitRequest
    {
        [Required]
        [MaxLength(20)]
        public string UnitCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string UnitType { get; set; } = "Sunbed";

        [Range(0, 99999)]
        public decimal? BasePrice { get; set; }

        public int? PositionX { get; set; }

        public int? PositionY { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required]
        public int VenueZoneId { get; set; }
    }

    public class UpdateZoneUnitRequest
    {
        [MaxLength(20)]
        public string? UnitCode { get; set; }

        [MaxLength(50)]
        public string? UnitType { get; set; }

        [Range(0, 99999)]
        public decimal? BasePrice { get; set; }

        public int? PositionX { get; set; }

        public int? PositionY { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public class UpdateUnitStatusRequest
    {
        [Required]
        [RegularExpression("^(Available|Reserved|Occupied|Maintenance)$",
            ErrorMessage = "Status must be Available, Reserved, Occupied, or Maintenance")]
        public string Status { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public class BulkCreateUnitsRequest
    {
        [Required]
        public int VenueZoneId { get; set; }

        [Required]
        [MaxLength(50)]
        public string UnitType { get; set; } = "Sunbed";

        [Required]
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

    public class BulkCreateUnitsResponse
    {
        public int CreatedCount { get; set; }
        public List<ZoneUnitListItemDto> Units { get; set; } = new();
    }

    public class ZoneUnitStatsDto
    {
        public int TotalUnits { get; set; }
        public int AvailableUnits { get; set; }
        public int ReservedUnits { get; set; }
        public int OccupiedUnits { get; set; }
        public int MaintenanceUnits { get; set; }
        public int ActiveBookingsToday { get; set; }
        public int CompletedBookingsToday { get; set; }
    }
}
