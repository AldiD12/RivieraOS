using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using FluentValidation;
using FluentValidation.AspNetCore;
using RivieraApi.Data;
using RivieraApi.Hubs;
using RivieraApi.Modules.Catalog.Services;
using RivieraApi.Modules.Ops.Services;
using RivieraApi.Modules.Feedback.Services;
using RivieraApi.Modules.Ops.Validators;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// Add FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddFluentValidationClientsideAdapters();
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderValidator>();

// Add JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyForRiviera2024!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RivieraApi";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Add DbContext - Support both InMemory (dev) and PostgreSQL (production)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrEmpty(connectionString))
{
    // Development: Use In-Memory Database
    Console.WriteLine("🔧 Using In-Memory Database (Development Mode)");
    builder.Services.AddDbContext<RivieraDbContext>(options =>
        options.UseInMemoryDatabase("RivieraDb"));
}
else
{
    // Production: Use PostgreSQL
    Console.WriteLine($"🚀 Using PostgreSQL Database (Production Mode)");
    Console.WriteLine($"🔗 Connection string length: {connectionString.Length} characters");
    
    builder.Services.AddDbContext<RivieraDbContext>(options =>
        options.UseNpgsql(connectionString));
}

// Register Services (Modular Monolith)
builder.Services.AddScoped<VenueService>();
builder.Services.AddScoped<OrderService>();
builder.Services.AddScoped<ReviewService>();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS (with Credentials for SignalR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173", 
            "http://localhost:5174", 
            "http://localhost:3000",
            "https://rivieraos.onrender.com"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<RivieraDbContext>();
    
    try
    {
        Console.WriteLine("📊 Initializing database...");
        context.Database.EnsureCreated(); // Creates all tables
        
        Console.WriteLine("📊 Seeding initial data...");
        DbInitializer.Initialize(context);
        
        Console.WriteLine("✅ Database ready!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database error: {ex.Message}");
        throw;
    }
}

// Configure middleware
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<BeachHub>("/hubs/beach");

app.Run();
