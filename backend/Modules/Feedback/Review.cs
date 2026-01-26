namespace RivieraApi.Modules.Feedback;

public class Review
{
    public int Id { get; set; }
    public int VenueId { get; set; }
    public int? UserId { get; set; } // Optional: if user is logged in
    public string? CustomerName { get; set; }
    public string? CustomerEmail { get; set; }
    public int Rating { get; set; } // 1-5
    public string? Comment { get; set; }
    public ReviewStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    
    // Navigation
    public Catalog.Venue Venue { get; set; } = null!;
    public Core.User? User { get; set; }
}

public enum ReviewStatus
{
    Pending,
    Approved,
    Rejected,
    Published
}
