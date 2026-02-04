using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    public class BizZoneListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int CapacityPerUnit { get; set; }
        public decimal BasePrice { get; set; }
    }

    public class BizZoneDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int CapacityPerUnit { get; set; }
        public decimal BasePrice { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
    }

    public class BizCreateZoneRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ZoneType { get; set; }

        public int CapacityPerUnit { get; set; } = 1;

        public decimal BasePrice { get; set; } = 0;
    }

    public class BizUpdateZoneRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ZoneType { get; set; }

        public int CapacityPerUnit { get; set; } = 1;

        public decimal BasePrice { get; set; } = 0;
    }
}
