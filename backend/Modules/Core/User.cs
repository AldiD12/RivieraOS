namespace RivieraApi.Modules.Core;

public class User
{
    public int Id { get; set; }
    public int BusinessId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? PasswordHash { get; set; }
    public string? PinCode { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation
    public Business Business { get; set; } = null!;
    public ICollection<Ops.Order> Orders { get; set; } = new List<Ops.Order>();
}

public enum UserRole
{
    Owner,
    Manager,
    Collector,
    Bartender
}
