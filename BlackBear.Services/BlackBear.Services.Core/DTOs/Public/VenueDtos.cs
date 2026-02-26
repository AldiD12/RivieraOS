namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicVenueListItemDto
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
        public bool AllowsDigitalOrdering { get; set; }
        public bool HasAvailability { get; set; }
        public int AvailableUnitsCount { get; set; }
    }

    public class PublicVenueAvailabilityDetailDto
    {
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int TotalUnits { get; set; }
        public int AvailableUnits { get; set; }
        public int ReservedUnits { get; set; }
        public int OccupiedUnits { get; set; }
        public List<PublicZoneAvailabilityInfoDto> Zones { get; set; } = new();
    }

    public class PublicZoneAvailabilityInfoDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int TotalUnits { get; set; }
        public int AvailableUnits { get; set; }
        public decimal BasePrice { get; set; }
        public bool IsManualOverride { get; set; }
    }
}
