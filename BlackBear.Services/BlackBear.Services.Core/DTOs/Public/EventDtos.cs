namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicEventListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? FlyerImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsTicketed { get; set; }
        public decimal TicketPrice { get; set; }
        public int MaxGuests { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public string? VenueAddress { get; set; }
        public string? BusinessName { get; set; }
        public int SpotsRemaining { get; set; }
    }

    public class PublicEventDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? FlyerImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsTicketed { get; set; }
        public decimal TicketPrice { get; set; }
        public int MaxGuests { get; set; }
        public int SpotsRemaining { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public string? VenueAddress { get; set; }
        public double? VenueLatitude { get; set; }
        public double? VenueLongitude { get; set; }
        public string? BusinessName { get; set; }
        public string? BusinessLogoUrl { get; set; }
    }
}
