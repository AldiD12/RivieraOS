namespace RivieraApi.Modules.Ops;

public class Device
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public string DeviceName { get; set; } = string.Empty;
    public DeviceType Type { get; set; }
    public string? DeviceToken { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastSeenAt { get; set; }
    
    // Navigation
    public Catalog.Venue Venue { get; set; } = null!;
}

public enum DeviceType
{
    BarTablet,
    KitchenDisplay,
    CollectorPhone,
    ManagerDesktop
}
