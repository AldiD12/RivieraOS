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
        public DbSet<User> Users { get; set; }

        // Catalog schema entities
        public DbSet<Venue> Venues { get; set; }
        public DbSet<VenueConfig> VenueConfigs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

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

            // Venue configuration
            modelBuilder.Entity<Venue>(entity =>
            {
                entity.HasOne(v => v.VenueConfig)
                    .WithOne(vc => vc.Venue)
                    .HasForeignKey<VenueConfig>(vc => vc.VenueId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // User configuration - ensure unique email
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
            });
        }
    }
}
