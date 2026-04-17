using System.Security.Claims;
using BlackBear.Services.Core.Interfaces;

namespace BlackBear.Services.Core.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? UserId =>
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

        public int? BusinessId
        {
            get
            {
                var businessIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue("businessId");
                if (string.IsNullOrEmpty(businessIdClaim))
                    return null;

                return int.TryParse(businessIdClaim, out var businessId) ? businessId : null;
            }
        }

        public string? Role =>
            _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);

        public bool IsAuthenticated =>
            _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
    }
}
