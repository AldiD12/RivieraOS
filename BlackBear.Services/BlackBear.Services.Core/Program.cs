using System.Text;
using System.Threading.RateLimiting;
using Azure.Storage.Blobs;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.Hubs;
using BlackBear.Services.Core.Interfaces;
using BlackBear.Services.Core.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Validate required configuration
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(jwtKey))
    throw new InvalidOperationException("Missing configuration: Jwt:Key");
if (string.IsNullOrEmpty(jwtIssuer))
    throw new InvalidOperationException("Missing configuration: Jwt:Issuer");
if (string.IsNullOrEmpty(jwtAudience))
    throw new InvalidOperationException("Missing configuration: Jwt:Audience");
if (string.IsNullOrEmpty(connectionString))
    throw new InvalidOperationException("Missing configuration: ConnectionStrings:DefaultConnection");

Console.WriteLine($"[Startup] Environment: {builder.Environment.EnvironmentName}");
Console.WriteLine($"[Startup] JWT Issuer: {jwtIssuer}");
Console.WriteLine($"[Startup] Connection string found: {!string.IsNullOrEmpty(connectionString)}");
Console.WriteLine($"[Startup] Allowed CORS Origins: {string.Join(", ", builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>())}");

// 1. Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddSingleton(_ => new BlobServiceClient(builder.Configuration.GetConnectionString("AzureBlobStorage")));
builder.Services.AddScoped<IBlobService, BlobService>();

// 2. Add Swagger/OpenAPI with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token"
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 3. Add JWT Authentication

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };

    // Allow SignalR clients to send JWT via query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

// 4. Add Authorization Policies
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdmin", policy => policy.RequireRole("SuperAdmin"));
    options.AddPolicy("BusinessOwner", policy => policy.RequireRole("SuperAdmin", "BusinessOwner"));
    options.AddPolicy("Manager", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager"));
    options.AddPolicy("Staff", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Staff"));
    options.AddPolicy("Bartender", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Bartender"));
    options.AddPolicy("Collector", policy => policy.RequireRole("SuperAdmin", "BusinessOwner", "Manager", "Collector"));
});

// 4. Add Database Context (Azure SQL Server Connection)
builder.Services.AddDbContext<BlackBearDbContext>(options =>
    options.UseSqlServer(connectionString)
);

// 5. Add CORS Policy
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// 6. Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Global policy: 100 requests per minute per IP
    options.AddPolicy("fixed", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Auth policy: 10 requests per minute per IP (login/register brute-force protection)
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Public policy: 60 requests per minute per IP (menu, events, reservations)
    options.AddPolicy("public", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

// 7. Add SignalR
builder.Services.AddSignalR();

// 7. Add Background Services
builder.Services.AddHostedService<DailyUnitResetService>();
builder.Services.AddHostedService<BookingCleanupService>();

// 7. Add Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "database", tags: ["db", "sql"]);

var app = builder.Build();

// 4. Configure the HTTP request pipeline.
// Enable Swagger UI (available in all environments)
app.UseSwagger();
app.UseSwaggerUI();

// Security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    context.Response.Headers.Append("X-XSS-Protection", "0");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    await next();
});

app.UseCors("AllowFrontend");

// Global exception handler — placed AFTER UseCors so error responses still get CORS headers.
// Without this, unhandled exceptions produce bare 500 responses with no CORS headers,
// which browsers report as CORS errors instead of showing the real server error.
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var exceptionFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (exceptionFeature?.Error is not null)
        {
            logger.LogError(exceptionFeature.Error, "Unhandled exception on {Method} {Path}", context.Request.Method, context.Request.Path);
        }

        await context.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred." });
    });
});

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<BeachHub>("/hubs/beach");

// Health check endpoints
app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false // No checks, just returns healthy
});
app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("db") // Only database checks
});
app.MapHealthChecks("/health"); // All checks

app.Run();