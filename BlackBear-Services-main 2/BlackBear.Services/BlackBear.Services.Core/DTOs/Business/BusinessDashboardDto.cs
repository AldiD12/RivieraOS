namespace BlackBear.Services.Core.DTOs.Business
{
    public class BusinessDashboardDto
    {
        public BusinessInfoDto Business { get; set; } = new();
        public int TotalVenues { get; set; }
        public int ActiveVenues { get; set; }
        public int TotalStaff { get; set; }
        public int ActiveStaff { get; set; }
        public int TotalCategories { get; set; }
        public int TotalProducts { get; set; }
        public int AvailableProducts { get; set; }
        public int TotalEvents { get; set; }
        public int UpcomingEvents { get; set; }
    }

    public class BusinessInfoDto
    {
        public int Id { get; set; }
        public string RegisteredName { get; set; } = string.Empty;
        public string? BrandName { get; set; }
        public string? LogoUrl { get; set; }
        public string SubscriptionStatus { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
