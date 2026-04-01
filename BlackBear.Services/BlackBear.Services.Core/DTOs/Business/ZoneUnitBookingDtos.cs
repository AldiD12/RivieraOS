using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    // List item DTO for bookings
    public class BizBookingListItemDto
    {
        public int Id { get; set; }
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? GuestName { get; set; }
        public int GuestCount { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public DateTime? CheckedOutAt { get; set; }
        public int? ZoneUnitId { get; set; }
        public string? UnitCode { get; set; }
        public string? UnitType { get; set; }
        public string ZoneName { get; set; } = string.Empty;
    }

    // Detail DTO for a single booking
    public class BizBookingDetailDto
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
        public int? ZoneUnitId { get; set; }
        public string? UnitCode { get; set; }
        public string? UnitType { get; set; }
        public int VenueZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int? HandledByUserId { get; set; }
        public string? HandledByUserName { get; set; }
    }

    // Create walk-in booking request (Caderman creates)
    public class BizCreateBookingRequest
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

    // Check-in request
    public class BizCheckInRequest
    {
        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Check-out request
    public class BizCheckOutRequest
    {
        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Booking stats for dashboard
    public class BizBookingStatsDto
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
