using Microsoft.EntityFrameworkCore;
using RivieraApi.Modules.Core;
using RivieraApi.Modules.Catalog;
using RivieraApi.Modules.Ops;
using RivieraApi.Modules.Feedback;

namespace RivieraApi.Data;

public class RivieraDbContext : DbContext
{
    public RivieraDbContext(DbContextOptions<RivieraDbContext> options) : base(options)
    {
    }

    // Core Module
    public DbSet<Business> Businesses { get; set; }
    public DbSet<User> Users { get; set; }

    // Catalog Module
    public DbSet<Venue> Venues { get; set; }
    public DbSet<VenueZone> VenueZones { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }

    // Ops Module
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Device> Devices { get; set; }

    // Feedback Module
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ===== CORE MODULE =====
        
        // Business
        modelBuilder.Entity<Business>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.RegisteredName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TaxId).HasMaxLength(50);
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PinCode).HasMaxLength(10);

            entity.HasOne(e => e.Business)
                .WithMany(b => b.Users)
                .HasForeignKey(e => e.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== CATALOG MODULE =====
        
        // Venue
        modelBuilder.Entity<Venue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Location).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.Business)
                .WithMany(b => b.Venues)
                .HasForeignKey(e => e.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // VenueZone
        modelBuilder.Entity<VenueZone>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.Zones)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.Categories)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);

            // Index for menu queries
            entity.HasIndex(e => e.VenueId);
            entity.HasIndex(e => new { e.VenueId, e.Type }); // Fast category filtering
        });

        // Product (Sunbeds + Menu Items)
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UnitCode).HasMaxLength(50);
            entity.Property(e => e.CurrentGuestName).HasMaxLength(200);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.VenueZone)
                .WithMany(z => z.Products)
                .HasForeignKey(e => e.VenueZoneId)
                .OnDelete(DeleteBehavior.SetNull);

            // Self-referencing relationship for upsells
            entity.HasOne(e => e.UpsellProduct)
                .WithMany()
                .HasForeignKey(e => e.UpsellProductId)
                .OnDelete(DeleteBehavior.SetNull);

            // Performance indexes
            entity.HasIndex(e => e.CategoryId);
            entity.HasIndex(e => e.VenueZoneId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.IsAvailable);
        });

        // ===== OPS MODULE =====
        
        // Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.Orders)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.AssignedUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.SetNull);

            // Critical performance indexes for high-volume queries
            entity.HasIndex(e => e.VenueId);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => new { e.VenueId, e.Status }); // Composite for "pending orders at venue"
            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.AssignedUserId);
        });

        // OrderItem
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(e => e.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Device
        modelBuilder.Entity<Device>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.DeviceName).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.Devices)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== FEEDBACK MODULE =====
        
        // Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CustomerName).HasMaxLength(200);
            entity.Property(e => e.CustomerEmail).HasMaxLength(200);

            entity.HasOne(e => e.Venue)
                .WithMany(v => v.Reviews)
                .HasForeignKey(e => e.VenueId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
