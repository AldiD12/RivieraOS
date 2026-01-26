namespace RivieraApi.Modules.Ops;

public class Order
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public int? UserId { get; set; } // Staff member who created the order
    public int? AssignedUserId { get; set; } // Staff member assigned to deliver this order
    public int? ProductId { get; set; } // For sunbed orders (which sunbed)
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? AssignedAt { get; set; }
    
    // Navigation
    public Catalog.Venue Venue { get; set; } = null!;
    public Core.User? User { get; set; }
    public Core.User? AssignedUser { get; set; }
    public Catalog.Product? Product { get; set; } // The sunbed if applicable
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public enum OrderStatus
{
    Pending,
    Preparing,
    Ready,
    Delivered,
    Paid,
    Cancelled
}

public enum PaymentMethod
{
    Cash,
    Card,
    RoomCharge,
    Online
}
