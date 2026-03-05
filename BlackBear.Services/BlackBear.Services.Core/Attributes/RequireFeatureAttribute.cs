using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Interfaces;

namespace BlackBear.Services.Core.Attributes
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class RequireFeatureAttribute : ActionFilterAttribute
    {
        private readonly string _featureName;

        public RequireFeatureAttribute(string featureName)
        {
            _featureName = featureName;
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var dbContext = context.HttpContext.RequestServices.GetRequiredService<BlackBearDbContext>();
            var currentUserService = context.HttpContext.RequestServices.GetRequiredService<ICurrentUserService>();

            var businessId = currentUserService.BusinessId;

            if (businessId == null)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var features = await dbContext.BusinessFeatures
                .FirstOrDefaultAsync(f => f.BusinessId == businessId);

            if (features == null || !HasFeature(features, _featureName))
            {
                context.Result = new ObjectResult(new { message = $"Your plan does not include access to: {_featureName}" })
                {
                    StatusCode = StatusCodes.Status403Forbidden
                };
                return;
            }

            await next();
        }

        private static bool HasFeature(BusinessFeature features, string featureName)
        {
            return featureName switch
            {
                nameof(BusinessFeature.HasEvents) => features.HasEvents,
                nameof(BusinessFeature.HasBookings) => features.HasBookings,
                nameof(BusinessFeature.HasTableOrdering) => features.HasTableOrdering,
                nameof(BusinessFeature.HasDigitalMenu) => features.HasDigitalMenu,
                nameof(BusinessFeature.HasPulse) => features.HasPulse,
                _ => false
            };
        }
    }
}
