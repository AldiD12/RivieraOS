namespace RivieraApi.Modules.Catalog.DTOs;

// Main venue layout response
public class VenueLayoutDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsOpen { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public List<VenueZoneDto> Zones { get; set; } = new();
    public List<CategoryDto> Categories { get; set; } = new();
}

// Zone with products (sunbeds)
public class VenueZoneDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public List<ProductDto> Products { get; set; } = new();
}

// Category with products (menu items)
public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CategoryType Type { get; set; }
    public List<MenuProductDto> Products { get; set; } = new();
}

// Product DTO for sunbeds
public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? UnitCode { get; set; }
    public decimal BasePrice { get; set; }
    public ProductStatus Status { get; set; }
    public bool IsAvailable { get; set; }
    public string? CurrentGuestName { get; set; }
}

// Product DTO for menu items (optimized - no status/guest info)
public class MenuProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public bool IsAvailable { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public int? UpsellProductId { get; set; } // For suggesting related products
}

// Discovery page DTO (minimal data)
public class VenueDiscoveryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsOpen { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public int TotalBeds { get; set; }
    public int OccupiedBeds { get; set; }
}
