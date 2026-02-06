using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    public class BizEventListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? FlyerImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsTicketed { get; set; }
        public decimal TicketPrice { get; set; }
        public int MaxGuests { get; set; }
        public bool IsPublished { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public int BookingCount { get; set; }
    }

    public class BizEventDetailDto
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
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public int BookingCount { get; set; }
        public int TotalGuests { get; set; }
    }

    public class BizCreateEventRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? FlyerImageUrl { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public bool IsTicketed { get; set; } = false;

        public decimal TicketPrice { get; set; } = 0;

        public int MaxGuests { get; set; } = 0;

        public bool IsPublished { get; set; } = false;

        [Required]
        public int VenueId { get; set; }
    }

    public class BizUpdateEventRequest
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(500)]
        public string? FlyerImageUrl { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public bool IsTicketed { get; set; } = false;

        public decimal TicketPrice { get; set; } = 0;

        public int MaxGuests { get; set; } = 0;

        public bool IsPublished { get; set; } = false;

        [Required]
        public int VenueId { get; set; }
    }
}
