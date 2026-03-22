using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Public
{
    // Menu item for guests to browse
    public class PublicMenuItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? OldPrice { get; set; }
        public bool IsAlcohol { get; set; }
        public string? CategoryName { get; set; }
    }

    public class PublicMenuCategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? IconName { get; set; }
        public List<PublicMenuItemDto> Products { get; set; } = new();
        public string? BusinessName { get; set; }
    }

    // Order creation request from guest
    public class PublicCreateOrderRequest
    {
        [Required]
        public int VenueId { get; set; }

        [Required]
        public int ZoneId { get; set; }

        public int? ZoneUnitId { get; set; }

        [MaxLength(100)]
        public string? CustomerName { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [Required]
        [MinLength(1)]
        public List<PublicOrderItemRequest> Items { get; set; } = new();
    }

    public class PublicOrderItemRequest
    {
        [Required]
        public int ProductId { get; set; }

        [Range(1, 99)]
        public int Quantity { get; set; } = 1;

        [MaxLength(500)]
        public string? Notes { get; set; }
    }

    // Order confirmation returned to guest
    public class PublicOrderConfirmationDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? CustomerName { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string VenueName { get; set; } = string.Empty;
        public List<PublicOrderItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }

    public class PublicOrderItemDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Notes { get; set; }
        public decimal Subtotal => Quantity * UnitPrice;
    }

    // Order status check response
    public class PublicOrderStatusDto
    {
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string ZoneName { get; set; } = string.Empty;
    }
}
