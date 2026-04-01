using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class ZoneListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int CapacityPerUnit { get; set; }
        public decimal BasePrice { get; set; }
        public bool IsActive { get; set; }
    }

    public class ZoneDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int CapacityPerUnit { get; set; }
        public decimal BasePrice { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateZoneRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ZoneType { get; set; }

        public int CapacityPerUnit { get; set; } = 0;

        [Range(0, 99999)]
        public decimal BasePrice { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }

    public class UpdateZoneRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ZoneType { get; set; }

        public int CapacityPerUnit { get; set; } = 0;

        [Range(0, 99999)]
        public decimal BasePrice { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }
}
