using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Collector
{
    public class CollectorBookingDetailsDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? GuestName { get; set; }
        public int GuestCount { get; set; }
        public int UnitsNeeded { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public int? ZoneId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CollectorAvailableUnitDto
    {
        public int Id { get; set; }
        public string UnitCode { get; set; } = string.Empty;
        public string UnitType { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal? BasePrice { get; set; }
        public int? PositionX { get; set; }
        public int? PositionY { get; set; }
    }

    public class CollectorApproveBookingRequest
    {
        [Required]
        [MinLength(1, ErrorMessage = "At least one unit must be assigned")]
        public List<int> UnitIds { get; set; } = new();
    }
}
