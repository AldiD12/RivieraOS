using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class ZoneUnitBookingListItemDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public int GuestCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public DateTime? CheckedOutAt { get; set; }
        public int ZoneUnitId { get; set; }
        public string UnitCode { get; set; } = string.Empty;
        public string UnitType { get; set; } = string.Empty;
        public string ZoneName { get; set; } = string.Empty;
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
    }

    public class ZoneUnitBookingDetailDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? GuestName { get; set; }
        public string? GuestPhone { get; set; }
        public string? GuestEmail { get; set; }
        public int GuestCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public DateTime? CheckedOutAt { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ZoneUnitId { get; set; }
        public string UnitCode { get; set; } = string.Empty;
        public string UnitType { get; set; } = string.Empty;
        public int VenueZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public int? HandledByUserId { get; set; }
        public string? HandledByUserName { get; set; }
    }

    public class CreateBookingRequest
    {
        [Required]
        public int ZoneUnitId { get; set; }

        [MaxLength(100)]
        public string? GuestName { get; set; }

        [MaxLength(50)]
        public string? GuestPhone { get; set; }

        [MaxLength(255)]
        public string? GuestEmail { get; set; }

        [Range(1, 20)]
        public int GuestCount { get; set; } = 1;

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        public bool CheckInImmediately { get; set; } = true;
    }

    public class CheckInRequest
    {
        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    public class CheckOutRequest
    {
        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
