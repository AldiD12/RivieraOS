namespace BlackBear.Services.Core.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Role { get; set; }
        public int? BusinessId { get; set; }
    }
}
