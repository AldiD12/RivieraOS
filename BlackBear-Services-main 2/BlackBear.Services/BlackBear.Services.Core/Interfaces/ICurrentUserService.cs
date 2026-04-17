namespace BlackBear.Services.Core.Interfaces
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        int? BusinessId { get; }
        string? Role { get; }
        bool IsAuthenticated { get; }
    }
}
