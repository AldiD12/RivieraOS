using Microsoft.EntityFrameworkCore;
using BlackBear.Services.Core.Entities;

namespace BlackBear.Services.Core.Data
{
    public class BlackBearDbContext : DbContext
    {
        public BlackBearDbContext(DbContextOptions<BlackBearDbContext> options)
            : base(options)
        {
        }

        // Core schema entities
        public DbSet<Business> Businesses { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }

        // Catalog schema entities
        public DbSet<Venue> Venues { get; set; }
        public DbSet<VenueConfig> VenueConfigs { get; set; }
        public DbSet<VenueZone> VenueZones { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }

        // Events schema entities
        public DbSet<ScheduledEvent> ScheduledEvents { get; set; }
        public DbSet<EventBooking> EventBookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // === CORE MODULE ===

            // Business configuration
            modelBuilder.Entity<Business>(entity =>
            {
                entity.HasMany(b => b.Users)
                    .WithOne(u => u.Business)
                    .HasForeignKey(u => u.BusinessId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(b => b.Venues)
                    .WithOne(v => v.Business)
                    .HasForeignKey(v => v.BusinessId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();

                entity.HasMany(u => u.UserRoles)
                    .WithOne(ur => ur.User)
                    .HasForeignKey(ur => ur.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(u => u.EventBookings)
                    .WithOne(eb => eb.User)
                    .HasForeignKey(eb => eb.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // UserRole (join table) configuration - composite primary key
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(ur => new { ur.UserId, ur.RoleId });

                entity.HasOne(ur => ur.Role)
                    .WithMany(r => r.UserRoles)
                    .HasForeignKey(ur => ur.RoleId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // === CATALOG MODULE ===

            // Venue configuration
            modelBuilder.Entity<Venue>(entity =>
            {
                entity.HasOne(v => v.VenueConfig)
                    .WithOne(vc => vc.Venue)
                    .HasForeignKey<VenueConfig>(vc => vc.VenueId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(v => v.VenueZones)
                    .WithOne(vz => vz.Venue)
                    .HasForeignKey(vz => vz.VenueId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(v => v.Categories)
                    .WithOne(c => c.Venue)
                    .HasForeignKey(c => c.VenueId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(v => v.Products)
                    .WithOne(p => p.Venue)
                    .HasForeignKey(p => p.VenueId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(v => v.ScheduledEvents)
                    .WithOne(se => se.Venue)
                    .HasForeignKey(se => se.VenueId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasMany(c => c.Products)
                    .WithOne(p => p.Category)
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // === EVENTS MODULE ===

            // ScheduledEvent configuration
            modelBuilder.Entity<ScheduledEvent>(entity =>
            {
                entity.HasMany(se => se.EventBookings)
                    .WithOne(eb => eb.ScheduledEvent)
                    .HasForeignKey(eb => eb.EventId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
