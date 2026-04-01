using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Public
{
    // Public unit info for availability display
    public class PublicZoneUnitDto
    {
        public int Id { get; set; }
        public string UnitCode { get; set; } = string.Empty;
        public string UnitType { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public decimal Price { get; set; }
        public int? PositionX { get; set; }
        public int? PositionY { get; set; }
    }

    // Compact venue info included in zone responses
    public class PublicVenueInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
    }

    // Zone with available units count
    public class PublicZoneAvailabilityDto
    {
        public int ZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public decimal BasePrice { get; set; }
        public int TotalUnits { get; set; }
        public int AvailableUnits { get; set; }
        public PublicVenueInfoDto? Venue { get; set; }
        public List<PublicZoneUnitDto> Units { get; set; } = new();
    }

    // Venue availability summary
    public class PublicVenueAvailabilityDto
    {
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int TotalAvailableUnits { get; set; }
        public List<PublicZoneAvailabilityDto> Zones { get; set; } = new();
    }

    // Guest reservation request
    public class PublicReservationRequest
    {
        public int? ZoneUnitId { get; set; }

        public int? ZoneId { get; set; }

        [Required]
        public int VenueId { get; set; }

        [MaxLength(100)]
        public string? GuestName { get; set; }

        [MaxLength(50)]
        [Phone]
        public string? GuestPhone { get; set; }

        [MaxLength(255)]
        [EmailAddress]
        public string? GuestEmail { get; set; }

        [Range(1, 20)]
        public int GuestCount { get; set; } = 1;

        [Range(1, 20)]
        public int? SunbedCount { get; set; }

        public string? ArrivalTime { get; set; }

        public DateTime? ReservationDate { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Reservation confirmation response
    public class PublicReservationConfirmationDto
    {
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? UnitCode { get; set; }
        public string? UnitType { get; set; }
        public List<string> UnitCodes { get; set; } = new();
        public bool AreAdjacent { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? ArrivalTime { get; set; }
        public string? ExpirationTime { get; set; }
        public decimal TotalPrice { get; set; }
        public string? GuestName { get; set; }
        public int GuestCount { get; set; }
        public int UnitsNeeded { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    // Full venue detail for public endpoint
    public class PublicVenueDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? ImageUrl { get; set; }
        public bool OrderingEnabled { get; set; }
        public bool AllowsDigitalOrdering { get; set; }
    }

    // Check reservation status response
    public class PublicReservationStatusDto
    {
        public string BookingCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? UnitCode { get; set; }
        public string? UnitType { get; set; }
        public List<string> UnitCodes { get; set; } = new();
        public string ZoneName { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public DateTime? ExpirationTime { get; set; }
        public DateTime? CheckedInAt { get; set; }
        public DateTime? CheckedOutAt { get; set; }
        public string? GuestName { get; set; }
        public int GuestCount { get; set; }
    }
}
