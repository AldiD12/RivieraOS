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
// Try multiple ways to get connection string (Render compatibility)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

Console.WriteLine($"🔍 Checking connection string...");
Console.WriteLine($"   - From Configuration: {(builder.Configuration.GetConnectionString("DefaultConnection") != null ? "Found" : "Not found")}");
Console.WriteLine($"   - From DATABASE_URL: {(Environment.GetEnvironmentVariable("DATABASE_URL") != null ? "Found" : "Not found")}");
Console.WriteLine($"   - From ConnectionStrings__DefaultConnection: {(Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection") != null ? "Found" : "Not found")}");

if (string.IsNullOrEmpty(connectionString))
{
    // Development: Use In-Memory Database
    builder.Services.AddDbContext<RivieraDbContext>(options =>
        options.UseInMemoryDatabase("RivieraDb"));
    
    Console.WriteLine("🔧 Using In-Memory Database (Development Mode)");
}
else
{
    // Production: Use PostgreSQL
    Console.WriteLine($"🔗 Connection string length: {connectionString.Length}");
    Console.WriteLine($"🔗 Connection string preview: {connectionString.Substring(0, Math.Min(30, connectionString.Length))}...");
    
    // Validate connection string format
    if (!connectionString.StartsWith("postgresql://") && !connectionString.StartsWith("postgres://"))
    {
        Console.WriteLine($"❌ ERROR: Invalid connection string format. Must start with postgresql:// or postgres://");
        Console.WriteLine($"   Actual value: {connectionString}");
        throw new Exception("Invalid PostgreSQL connection string format");
    }
    
    builder.Services.AddDbContext<RivieraDbContext>(options =>
        options.UseNpgsql(connectionString));
    
    Console.WriteLine("🚀 Using PostgreSQL Database (Production Mode)");
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
            "https://riviera-os-app.onrender.com"
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
        
        // For PostgreSQL in production, assume migrations are run separately
        // For in-memory dev database, create it
        if (string.IsNullOrEmpty(connectionString))
        {
            Console.WriteLine("📊 Creating in-memory database...");
            context.Database.EnsureCreated();
            
            Console.WriteLine("📊 Seeding data...");
            DbInitializer.Initialize(context);
            Console.WriteLine("✅ Database initialized successfully!");
        }
        else
        {
            Console.WriteLine("📊 Production mode - skipping auto-migration");
            Console.WriteLine("📊 Run migrations manually: dotnet ef database update");
            Console.WriteLine("📊 Seeding data...");
            DbInitializer.Initialize(context);
            Console.WriteLine("✅ Database ready!");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database initialization failed: {ex.Message}");
        Console.WriteLine($"   Stack trace: {ex.StackTrace}");
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
