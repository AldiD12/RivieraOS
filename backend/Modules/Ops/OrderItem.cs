namespace RivieraApi.Modules.Ops;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceAtTime { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public Order Order { get; set; } = null!;
    public Catalog.Product Product { get; set; } = null!;
}
