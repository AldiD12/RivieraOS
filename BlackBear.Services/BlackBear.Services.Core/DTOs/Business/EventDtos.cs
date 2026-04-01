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
        public decimal MinimumSpend { get; set; }
        public int MaxGuests { get; set; }
        public string? Vibe { get; set; }
        public string? EntryType { get; set; }
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
        public decimal MinimumSpend { get; set; }
        public int MaxGuests { get; set; }
        public string? Vibe { get; set; }
        public string? EntryType { get; set; }
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
        [Url]
        public string? FlyerImageUrl { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public bool IsTicketed { get; set; } = false;

        [Range(0, 99999)]
        public decimal TicketPrice { get; set; } = 0;

        [Range(0, 99999)]
        public decimal MinimumSpend { get; set; } = 0;

        [Range(0, 10000)]
        public int MaxGuests { get; set; } = 0;

        [MaxLength(50)]
        public string? Vibe { get; set; }

        [MaxLength(20)]
        public string? EntryType { get; set; }

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
        [Url]
        public string? FlyerImageUrl { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        public bool IsTicketed { get; set; } = false;

        [Range(0, 99999)]
        public decimal TicketPrice { get; set; } = 0;

        [Range(0, 99999)]
        public decimal MinimumSpend { get; set; } = 0;

        [Range(0, 10000)]
        public int MaxGuests { get; set; } = 0;

        [MaxLength(50)]
        public string? Vibe { get; set; }

        [MaxLength(20)]
        public string? EntryType { get; set; }

        public bool IsPublished { get; set; } = false;

        [Required]
        public int VenueId { get; set; }
    }
}
