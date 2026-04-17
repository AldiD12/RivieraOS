Here is a complete Markdown file you can copy and paste directly into your project (for example, save it as feature-toggles-implementation.md). You can feed this straight to Claude Code, and it will understand the exact files to create, update, and modify within your .NET 10 architecture.
Markdown

# Feature Toggles Implementation Guide

**Project Context:** BlackBear Services (.NET 10 / ASP.NET Core)
**Goal:** Implement a multi-tenant feature toggle system linked to the `Business` entity.

## Step 1: Create the Feature Entity
**File:** `BlackBear.Services.Core/Entities/BusinessFeature.cs`

Create a new entity to store the feature flags. This keeps the main `Business` table clean.

```csharp
namespace BlackBear.Services.Core.Entities
{
    public class BusinessFeature
    {
        public int Id { get; set; }
        public int BusinessId { get; set; }
        public Business Business { get; set; }

        // Feature Flags
        public bool HasDigitalMenu { get; set; } = true;
        public bool HasTableOrdering { get; set; } = false;
        public bool HasBookings { get; set; } = false;
        public bool HasEvents { get; set; } = false;
        public bool HasShieldReview { get; set; } = false;
        
        // Soft Delete support (to match existing architecture)
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
    }
}

Step 2: Update the Database Context

File: BlackBear.Services.Core/Data/BlackBearDbContext.cs

Add the DbSet and configure the one-to-one relationship.
C#

// 1. Add the DbSet
public DbSet<BusinessFeature> BusinessFeatures { get; set; }

// 2. Add inside OnModelCreating(ModelBuilder builder)
builder.Entity<BusinessFeature>()
    .HasOne(bf => bf.Business)
    .WithOne() // Assuming you add 'public BusinessFeature Feature { get; set; }' to Business.cs
    .HasForeignKey<BusinessFeature>(bf => bf.BusinessId)
    .OnDelete(DeleteBehavior.Restrict);

// 3. Add global query filter for soft delete
builder.Entity<BusinessFeature>().HasQueryFilter(x => !x.IsDeleted);

(Note for Claude: Do not forget to add public BusinessFeature Feature { get; set; } to the Business.cs entity).
Step 3: Create the Feature Gatekeeper Attribute

File: BlackBear.Services.Core/Attributes/RequireFeatureAttribute.cs

Create a custom action filter to intercept requests. If a business does not have the required feature, return a 403 Forbidden.
C#

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using BlackBear.Services.Core.Data;
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

            var businessId = currentUserService.GetBusinessId();

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

        private bool HasFeature(BusinessFeature features, string featureName)
        {
            return featureName switch
            {
                nameof(BusinessFeature.HasEvents) => features.HasEvents,
                nameof(BusinessFeature.HasBookings) => features.HasBookings,
                nameof(BusinessFeature.HasTableOrdering) => features.HasTableOrdering,
                nameof(BusinessFeature.HasDigitalMenu) => features.HasDigitalMenu,
                nameof(BusinessFeature.HasShieldReview) => features.HasShieldReview,
                _ => false
            };
        }
    }
}

Step 4: Apply the Attribute to Controllers

File Example: BlackBear.Services.Core/Controllers/Business/EventsController.cs

Protect the entire controller (or specific endpoints) by adding the attribute.
C#

using BlackBear.Services.Core.Attributes;
using BlackBear.Services.Core.Entities;

namespace BlackBear.Services.Core.Controllers.Business
{
    [ApiController]
    [Route("api/business/[controller]")]
    [Authorize(Roles = "BusinessOwner,Manager")]
    [RequireFeature(nameof(BusinessFeature.HasEvents))] // <--- The Toggle
    public class EventsController : ControllerBase
    {
        // Existing endpoints...
    }
}

Step 5: Expose Features to the Frontend

File: BlackBear.Services.Core/Controllers/Business/BusinessesController.cs (or a dedicated Settings Controller)

Create an endpoint so the frontend knows which tabs to render in the UI.
C#

[HttpGet("my-features")]
[Authorize(Roles = "BusinessOwner,Manager")]
public async Task<ActionResult<BusinessFeatureDto>> GetMyFeatures()
{
    var businessId = _currentUserService.GetBusinessId();
    
    var features = await _context.BusinessFeatures
        .FirstOrDefaultAsync(f => f.BusinessId == businessId);

    if (features == null) return NotFound();

    return Ok(new BusinessFeatureDto 
    {
        HasDigitalMenu = features.HasDigitalMenu,
        HasTableOrdering = features.HasTableOrdering,
        HasBookings = features.HasBookings,
        HasEvents = features.HasEvents,
        HasShieldReview = features.HasShieldReview
    });
}

Step 6: CLI Commands (To run after applying the above)
Bash

# Generate the migration for the new table
dotnet ef migrations add AddBusinessFeaturesTable

# Apply it to the local/dev database
dotnet ef database update


Would you like me to map out the Super Admin API endpoints you will need next so you can easily toggle these settings for your clients from your own dashboard?