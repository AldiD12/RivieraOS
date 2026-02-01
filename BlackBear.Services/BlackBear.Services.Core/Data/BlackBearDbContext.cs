using Microsoft.EntityFrameworkCore;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Interfaces;

namespace BlackBear.Services.Core.Data
{
    public class BlackBearDbContext : DbContext
    {
        private readonly ICurrentUserService? _currentUserService;

        public BlackBearDbContext(DbContextOptions<BlackBearDbContext> options)
            : base(options)
        {
        }

        public BlackBearDbContext(
            DbContextOptions<BlackBearDbContext> options,
            ICurrentUserService currentUserService)
            : base(options)
        {
            _currentUserService = currentUserService;
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

            // === GLOBAL QUERY FILTERS ===
            // Combines soft delete + multi-tenancy filters
            // SuperAdmin (no BusinessId) bypasses tenant filter but still respects soft delete

            // Business: only soft delete filter (SuperAdmin manages all businesses)
            modelBuilder.Entity<Business>().HasQueryFilter(b => !b.IsDeleted);

            // Venue: soft delete + multi-tenancy (SuperAdmin bypasses tenant filter)
            modelBuilder.Entity<Venue>().HasQueryFilter(v =>
                !v.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 v.BusinessId == _currentUserService.BusinessId));

            // VenueZone: soft delete only (filtered through Venue relationship)
            modelBuilder.Entity<VenueZone>().HasQueryFilter(vz => !vz.IsDeleted);

            // Category: soft delete only (filtered through Venue relationship)
            modelBuilder.Entity<Category>().HasQueryFilter(c => !c.IsDeleted);

            // Product: soft delete only (filtered through Venue relationship)
            modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);

            // User: multi-tenancy only (no soft delete for users, uses IsActive)
            modelBuilder.Entity<User>().HasQueryFilter(u =>
                _currentUserService == null ||
                _currentUserService.BusinessId == null ||
                u.BusinessId == _currentUserService.BusinessId);


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
