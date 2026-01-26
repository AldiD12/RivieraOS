namespace RivieraApi.Modules.Catalog;

public class VenueZone
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public Venue Venue { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
