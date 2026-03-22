namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class DashboardDto
    {
        public BusinessStats Businesses { get; set; } = new();
        public int TotalVenues { get; set; }
        public int TotalUsers { get; set; }
        public List<RecentBusinessDto> RecentBusinesses { get; set; } = new();
    }

    public class BusinessStats
    {
        public int Total { get; set; }
        public int Active { get; set; }
        public int Inactive { get; set; }
        public int Trial { get; set; }
        public int Subscribed { get; set; }
    }

    public class RecentBusinessDto
    {
        public int Id { get; set; }
        public string RegisteredName { get; set; } = string.Empty;
        public string? BrandName { get; set; }
        public string SubscriptionStatus { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public int VenueCount { get; set; }
    }
}
