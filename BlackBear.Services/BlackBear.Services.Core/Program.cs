using System.Text;
using Azure.Storage.Blobs;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.Hubs;
using BlackBear.Services.Core.Interfaces;
using BlackBear.Services.Core.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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

// 6. Add SignalR
builder.Services.AddSignalR();

// 7. Add Background Services
builder.Services.AddHostedService<DailyUnitResetService>();

// 7. Add Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "database", tags: ["db", "sql"]);

var app = builder.Build();

// 4. Configure the HTTP request pipeline.
// Enable Swagger UI (available in all environments)
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");

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