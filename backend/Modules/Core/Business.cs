namespace RivieraApi.Modules.Core;

public class Business
{
    public int Id { get; set; }
    public string RegisteredName { get; set; } = string.Empty;
    public string? TaxId { get; set; }
    public SubscriptionStatus SubscriptionStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Catalog.Venue> Venues { get; set; } = new List<Catalog.Venue>();
}

public enum SubscriptionStatus
{
    Trial,
    Active,
    Suspended,
    Cancelled
}
