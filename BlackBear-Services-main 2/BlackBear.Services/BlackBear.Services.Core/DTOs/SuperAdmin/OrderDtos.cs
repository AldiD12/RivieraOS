namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    // Order list item for SuperAdmin view
    public class OrderListItemDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? CustomerName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public int ZoneId { get; set; }
        public string? ZoneName { get; set; }
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public int ItemCount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    // Order detail for SuperAdmin view
    public class OrderDetailDto
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
        public string? VenueName { get; set; }
        public int ZoneId { get; set; }
        public string? ZoneName { get; set; }
        public string? ZoneType { get; set; }
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public int? HandledByUserId { get; set; }
        public string? HandledByUserName { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public string? Notes { get; set; }
        public decimal Subtotal => Quantity * UnitPrice;
    }
}
