namespace BlackBear.Services.Core.DTOs
{
    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Role { get; set; }
        public int? BusinessId { get; set; }
    }
}
