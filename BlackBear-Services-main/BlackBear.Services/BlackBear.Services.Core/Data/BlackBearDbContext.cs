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
        public DbSet<CategoryVenueExclusion> CategoryVenueExclusions { get; set; }
        public DbSet<ProductVenueExclusion> ProductVenueExclusions { get; set; }

        // Events schema entities
        public DbSet<ScheduledEvent> ScheduledEvents { get; set; }
        public DbSet<EventBooking> EventBookings { get; set; }

        // Orders schema entities
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

        // Zone Units schema entities
        public DbSet<ZoneUnit> ZoneUnits { get; set; }
        public DbSet<ZoneUnitBooking> ZoneUnitBookings { get; set; }

        // Feedback schema entities
        public DbSet<Review> Reviews { get; set; }
        public DbSet<NegativeFeedback> NegativeFeedbacks { get; set; }

        // Content schema entities
        public DbSet<Content> Contents { get; set; }

        // Feature toggles
        public DbSet<BusinessFeature> BusinessFeatures { get; set; }

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

            // Category: soft delete + multi-tenancy (now at Business level)
            modelBuilder.Entity<Category>().HasQueryFilter(c =>
                !c.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 c.BusinessId == _currentUserService.BusinessId));

            // Product: soft delete + multi-tenancy (now at Business level)
            modelBuilder.Entity<Product>().HasQueryFilter(p =>
                !p.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 p.BusinessId == _currentUserService.BusinessId));

            // User: multi-tenancy only (no soft delete for users, uses IsActive)
            modelBuilder.Entity<User>().HasQueryFilter(u =>
                _currentUserService == null ||
                _currentUserService.BusinessId == null ||
                u.BusinessId == _currentUserService.BusinessId);

            // ScheduledEvent: soft delete only (filtered through Venue for multi-tenancy)
            modelBuilder.Entity<ScheduledEvent>().HasQueryFilter(e => !e.IsDeleted);

            // Order: soft delete + multi-tenancy
            modelBuilder.Entity<Order>().HasQueryFilter(o =>
                !o.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 o.BusinessId == _currentUserService.BusinessId));

            // ZoneUnit: soft delete + multi-tenancy
            modelBuilder.Entity<ZoneUnit>().HasQueryFilter(zu =>
                !zu.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 zu.BusinessId == _currentUserService.BusinessId));

            // ZoneUnitBooking: soft delete + multi-tenancy
            modelBuilder.Entity<ZoneUnitBooking>().HasQueryFilter(zub =>
                !zub.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 zub.BusinessId == _currentUserService.BusinessId));

            // Review: soft delete + multi-tenancy
            modelBuilder.Entity<Review>().HasQueryFilter(r =>
                !r.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 r.BusinessId == _currentUserService.BusinessId));

            // NegativeFeedback: soft delete + multi-tenancy
            modelBuilder.Entity<NegativeFeedback>().HasQueryFilter(nf =>
                !nf.IsDeleted &&
                (_currentUserService == null ||
                 _currentUserService.BusinessId == null ||
                 nf.BusinessId == _currentUserService.BusinessId));

            // Content: no multi-tenancy (global content)
            modelBuilder.Entity<Content>().HasQueryFilter(c => c.IsActive);

            // BusinessFeature: soft delete only
            modelBuilder.Entity<BusinessFeature>().HasQueryFilter(bf => !bf.IsDeleted);


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

                entity.HasMany(b => b.Categories)
                    .WithOne(c => c.Business)
                    .HasForeignKey(c => c.BusinessId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(b => b.Products)
                    .WithOne(p => p.Business)
                    .HasForeignKey(p => p.BusinessId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(b => b.Feature)
                    .WithOne(bf => bf.Business)
                    .HasForeignKey<BusinessFeature>(bf => bf.BusinessId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();

                entity.HasOne(u => u.Venue)
                    .WithMany()
                    .HasForeignKey(u => u.VenueId)
                    .OnDelete(DeleteBehavior.NoAction);

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

                entity.HasMany(v => v.ScheduledEvents)
                    .WithOne(se => se.Venue)
                    .HasForeignKey(se => se.VenueId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(v => v.CategoryExclusions)
                    .WithOne(ce => ce.Venue)
                    .HasForeignKey(ce => ce.VenueId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(v => v.ProductExclusions)
                    .WithOne(pe => pe.Venue)
                    .HasForeignKey(pe => pe.VenueId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasMany(c => c.Products)
                    .WithOne(p => p.Category)
                    .HasForeignKey(p => p.CategoryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(c => c.VenueExclusions)
                    .WithOne(ce => ce.Category)
                    .HasForeignKey(ce => ce.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasMany(p => p.VenueExclusions)
                    .WithOne(pe => pe.Product)
                    .HasForeignKey(pe => pe.ProductId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Exclusion indexes — enable fast lookups by VenueId
            modelBuilder.Entity<CategoryVenueExclusion>()
                .HasIndex(e => e.VenueId);

            modelBuilder.Entity<ProductVenueExclusion>()
                .HasIndex(e => e.VenueId);

            // === EVENTS MODULE ===

            // ScheduledEvent configuration
            modelBuilder.Entity<ScheduledEvent>(entity =>
            {
                entity.HasMany(se => se.EventBookings)
                    .WithOne(eb => eb.ScheduledEvent)
                    .HasForeignKey(eb => eb.EventId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // === ORDERS MODULE ===

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasOne(o => o.Venue)
                    .WithMany()
                    .HasForeignKey(o => o.VenueId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.VenueZone)
                    .WithMany()
                    .HasForeignKey(o => o.VenueZoneId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.Business)
                    .WithMany()
                    .HasForeignKey(o => o.BusinessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(o => o.HandledByUser)
                    .WithMany()
                    .HasForeignKey(o => o.HandledByUserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(o => o.OrderItems)
                    .WithOne(oi => oi.Order)
                    .HasForeignKey(oi => oi.OrderId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.HasOne(oi => oi.Product)
                    .WithMany()
                    .HasForeignKey(oi => oi.ProductId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // === ZONE UNITS MODULE ===

            // ZoneUnit configuration
            modelBuilder.Entity<ZoneUnit>(entity =>
            {
                entity.HasIndex(zu => zu.QrCode).IsUnique();
                entity.HasIndex(zu => zu.CurrentBookingId);

                entity.HasOne(zu => zu.VenueZone)
                    .WithMany()
                    .HasForeignKey(zu => zu.VenueZoneId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(zu => zu.Venue)
                    .WithMany()
                    .HasForeignKey(zu => zu.VenueId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(zu => zu.Business)
                    .WithMany()
                    .HasForeignKey(zu => zu.BusinessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(zu => zu.CurrentBooking)
                    .WithMany(zub => zub.AssignedUnits)
                    .HasForeignKey(zu => zu.CurrentBookingId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(zu => zu.Bookings)
                    .WithOne(zub => zub.ZoneUnit)
                    .HasForeignKey(zub => zub.ZoneUnitId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // === FEEDBACK MODULE ===

            // Review configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasOne(r => r.Venue)
                    .WithMany()
                    .HasForeignKey(r => r.VenueId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.Business)
                    .WithMany()
                    .HasForeignKey(r => r.BusinessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(r => r.User)
                    .WithMany()
                    .HasForeignKey(r => r.UserId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(r => r.Order)
                    .WithMany()
                    .HasForeignKey(r => r.OrderId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(r => r.Booking)
                    .WithMany()
                    .HasForeignKey(r => r.BookingId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(r => r.VenueId);
                entity.HasIndex(r => r.Rating);
                entity.HasIndex(r => r.CreatedAt);
            });

            // ZoneUnitBooking configuration
            modelBuilder.Entity<ZoneUnitBooking>(entity =>
            {
                entity.HasIndex(zub => zub.BookingCode).IsUnique();
                entity.HasIndex(zub => zub.ZoneId);

                entity.HasOne(zub => zub.VenueZone)
                    .WithMany()
                    .HasForeignKey(zub => zub.ZoneId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(zub => zub.Venue)
                    .WithMany()
                    .HasForeignKey(zub => zub.VenueId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(zub => zub.Business)
                    .WithMany()
                    .HasForeignKey(zub => zub.BusinessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(zub => zub.HandledByUser)
                    .WithMany()
                    .HasForeignKey(zub => zub.HandledByUserId)
                    .OnDelete(DeleteBehavior.SetNull);
            });

            // === NEGATIVE FEEDBACK MODULE ===

            modelBuilder.Entity<NegativeFeedback>(entity =>
            {
                entity.HasOne(nf => nf.Venue)
                    .WithMany()
                    .HasForeignKey(nf => nf.VenueId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(nf => nf.Business)
                    .WithMany()
                    .HasForeignKey(nf => nf.BusinessId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(nf => nf.ResolvedByUser)
                    .WithMany()
                    .HasForeignKey(nf => nf.ResolvedBy)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(nf => nf.VenueId);
                entity.HasIndex(nf => nf.Status);
                entity.HasIndex(nf => nf.SubmittedAt);
            });

            // === CONTENT MODULE ===

            modelBuilder.Entity<Content>(entity =>
            {
                entity.HasOne(c => c.Venue)
                    .WithMany()
                    .HasForeignKey(c => c.VenueId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(c => c.ContentType);
                entity.HasIndex(c => c.VenueId);
            });
        }
    }
}
