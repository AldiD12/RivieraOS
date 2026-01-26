namespace RivieraApi.Modules.Ops.DTOs;

// Request DTO for creating an order
public class CreateOrderDto
{
    public int VenueId { get; set; }
    public int? UserId { get; set; } // Staff member creating the order
    public int? ProductId { get; set; } // Sunbed ID (optional)
    public string? GuestName { get; set; } // For sunbed orders
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public List<OrderItemDto> Items { get; set; } = new();
}

// Order item within the order
public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; } // This is UnitPrice
}

// Response DTO after order creation
public class OrderResponseDto
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public string? SunbedCode { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemResponseDto> Items { get; set; } = new();
}

public class OrderItemResponseDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
