namespace RivieraApi.Modules.Catalog;

public class Product
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public int? VenueZoneId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public bool IsAvailable { get; set; }
    public string? UnitCode { get; set; } // For sunbeds: A1, B12, etc.
    public ProductStatus Status { get; set; }
    public string? CurrentGuestName { get; set; } // For sunbeds
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public int? UpsellProductId { get; set; } // For suggesting related products (e.g., Coffee -> Water)
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public Category Category { get; set; } = null!;
    public VenueZone? VenueZone { get; set; }
    public Product? UpsellProduct { get; set; } // The product to suggest
    public ICollection<Ops.OrderItem> OrderItems { get; set; } = new List<Ops.OrderItem>();
}

public enum ProductStatus
{
    Available,
    BookedOnline,
    Occupied,
    HotelBlocked,
    Maintenance
}
