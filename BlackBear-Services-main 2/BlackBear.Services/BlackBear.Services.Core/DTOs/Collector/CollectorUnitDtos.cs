using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Collector
{
    public class CollectorVenueUnitsDto
    {
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public List<CollectorZoneDto> Zones { get; set; } = new();
    }

    public class CollectorZoneDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public List<CollectorUnitDto> Units { get; set; } = new();
    }

    public class CollectorUnitDto
    {
        public int Id { get; set; }
        public string UnitCode { get; set; } = string.Empty;
        public string? UnitType { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? PositionX { get; set; }
        public int? PositionY { get; set; }
        public string? Notes { get; set; }
        public CollectorCurrentBookingDto? CurrentBooking { get; set; }
        public List<string> AvailableTransitions { get; set; } = new();
    }

    public class CollectorCurrentBookingDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public int GuestCount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? CheckedInAt { get; set; }
    }

    public class CollectorUpdateUnitStatusRequest
    {
        [Required]
        [RegularExpression("^(Available|Reserved|Occupied|Maintenance)$",
            ErrorMessage = "Status must be Available, Reserved, Occupied, or Maintenance")]
        public string Status { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
