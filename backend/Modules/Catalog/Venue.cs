namespace RivieraApi.Modules.Catalog;

public class Venue
{
    public int Id { get; set; }
    public int BusinessId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsOpen { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public Core.Business Business { get; set; } = null!;
    public ICollection<VenueZone> Zones { get; set; } = new List<VenueZone>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Ops.Order> Orders { get; set; } = new List<Ops.Order>();
    public ICollection<Ops.Device> Devices { get; set; } = new List<Ops.Device>();
    public ICollection<Feedback.Review> Reviews { get; set; } = new List<Feedback.Review>();
}
