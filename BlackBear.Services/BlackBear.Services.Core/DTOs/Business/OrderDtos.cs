using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.Business
{
    // Order list item for barman/staff view
    public class BizOrderListItemDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string? UnitCode { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? CustomerName { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int ZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
        public List<BizOrderItemDto> Items { get; set; } = new();
    }

    // Order detail for barman/staff view
    public class BizOrderDetailDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? CustomerName { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int VenueId { get; set; }
        public string VenueName { get; set; } = string.Empty;
        public int ZoneId { get; set; }
        public string ZoneName { get; set; } = string.Empty;
        public string? ZoneType { get; set; }
        public int? HandledByUserId { get; set; }
        public string? HandledByUserName { get; set; }
        public List<BizOrderItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }

    public class BizOrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Notes { get; set; }
        public decimal Subtotal => Quantity * UnitPrice;
    }

    // Update order status request
    public class BizUpdateOrderStatusRequest
    {
        [Required]
        [RegularExpression("^(Pending|Preparing|Ready|Delivered|Cancelled)$",
            ErrorMessage = "Status must be Pending, Preparing, Ready, Delivered, or Cancelled")]
        public string Status { get; set; } = string.Empty;
    }
}
