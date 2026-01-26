using RivieraApi.Modules.Core;
using RivieraApi.Modules.Catalog;

namespace RivieraApi.Data;

public static class DbInitializer
{
    public static void Initialize(RivieraDbContext context)
    {
        // Check if already seeded
        if (context.Businesses.Any())
        {
            return;
        }

        // 1. Create Business
        var business = new Business
        {
            RegisteredName = "Hotel Coral & Resort",
            TaxId = "AL123456789",
            SubscriptionStatus = SubscriptionStatus.Active,
            CreatedAt = DateTime.UtcNow
        };
        context.Businesses.Add(business);
        context.SaveChanges();

        // 2. Create Users
        var users = new[]
        {
            new User
            {
                BusinessId = business.Id,
                FullName = "Admin User",
                Email = "admin@hotelcoral.al",
                Role = UserRole.Owner,
                PasswordHash = "admin123", // In production, use proper hashing
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                BusinessId = business.Id,
                FullName = "Beach Collector",
                Email = "collector@hotelcoral.al",
                Role = UserRole.Collector,
                PinCode = "1111",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.Users.AddRange(users);
        context.SaveChanges();

        // 3. Create Venues
        var venues = new[]
        {
            new Venue
            {
                BusinessId = business.Id,
                Name = "Hotel Coral Beach",
                Location = "Vlorë, Albania",
                Latitude = 40.4637,
                Longitude = 19.4914,
                IsOpen = true,
                ImageUrl = "/hotel coral.jpg",
                Description = "Luxury beachfront resort with infinity pool and private beach access",
                CreatedAt = DateTime.UtcNow
            },
            new Venue
            {
                BusinessId = business.Id,
                Name = "Folie Marine Resort",
                Location = "Dhërmi, Albania",
                Latitude = 40.1500,
                Longitude = 19.6333,
                IsOpen = true,
                ImageUrl = "/folie.webp",
                Description = "Exclusive clifftop resort overlooking the Ionian Sea",
                CreatedAt = DateTime.UtcNow
            },
            new Venue
            {
                BusinessId = business.Id,
                Name = "Riviera Sunset Club",
                Location = "Sarandë, Albania",
                Latitude = 39.8753,
                Longitude = 20.0094,
                IsOpen = true,
                ImageUrl = "/pexels-valter-zhara-164968736-13150437.jpg",
                Description = "Premium beach club with panoramic sunset views",
                CreatedAt = DateTime.UtcNow
            }
        };
        context.Venues.AddRange(venues);
        context.SaveChanges();

        var venue = venues[0]; // Hotel Coral Beach (main venue for detailed setup)

        // 4. Create Zones
        var zones = new[]
        {
            new VenueZone
            {
                VenueId = venue.Id,
                Name = "VIP Deck",
                OrderIndex = 1,
                CreatedAt = DateTime.UtcNow
            },
            new VenueZone
            {
                VenueId = venue.Id,
                Name = "Sand Area",
                OrderIndex = 2,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.VenueZones.AddRange(zones);
        context.SaveChanges();

        // 5. Create Categories
        var categories = new[]
        {
            new Category
            {
                VenueId = venue.Id,
                Name = "Sunbeds",
                Type = CategoryType.Sunbeds,
                OrderIndex = 1,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                VenueId = venue.Id,
                Name = "Cocktails",
                Type = CategoryType.Drinks,
                OrderIndex = 2,
                CreatedAt = DateTime.UtcNow
            },
            new Category
            {
                VenueId = venue.Id,
                Name = "Soft Drinks",
                Type = CategoryType.Drinks,
                OrderIndex = 3,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.Categories.AddRange(categories);
        context.SaveChanges();

        var sunbedCategory = categories[0];
        var cocktailCategory = categories[1];
        var softDrinkCategory = categories[2];

        // 6. Create Sunbeds (Products in VIP Deck)
        var vipZone = zones[0];
        var sunbeds = new List<Product>();
        for (int i = 1; i <= 10; i++)
        {
            sunbeds.Add(new Product
            {
                CategoryId = sunbedCategory.Id,
                VenueZoneId = vipZone.Id,
                Name = $"VIP Sunbed {i}",
                UnitCode = $"A{i}",
                BasePrice = 50.00m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Create Sunbeds in Sand Area
        var sandZone = zones[1];
        for (int i = 1; i <= 10; i++)
        {
            sunbeds.Add(new Product
            {
                CategoryId = sunbedCategory.Id,
                VenueZoneId = sandZone.Id,
                Name = $"Sand Sunbed {i}",
                UnitCode = $"B{i}",
                BasePrice = 30.00m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                CreatedAt = DateTime.UtcNow
            });
        }

        context.Products.AddRange(sunbeds);
        context.SaveChanges();

        // 7. Create Drink Menu Items
        var drinks = new[]
        {
            new Product
            {
                CategoryId = cocktailCategory.Id,
                Name = "Mojito",
                BasePrice = 8.00m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                Description = "Classic Cuban cocktail with mint and lime",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                CategoryId = cocktailCategory.Id,
                Name = "Piña Colada",
                BasePrice = 9.00m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                Description = "Tropical blend of rum, coconut, and pineapple",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                CategoryId = cocktailCategory.Id,
                Name = "Aperol Spritz",
                BasePrice = 7.50m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                Description = "Italian aperitif with prosecco and soda",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                CategoryId = softDrinkCategory.Id,
                Name = "Water",
                BasePrice = 2.00m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                CategoryId = softDrinkCategory.Id,
                Name = "Coca Cola",
                BasePrice = 3.00m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                CategoryId = softDrinkCategory.Id,
                Name = "Beer",
                BasePrice = 4.50m,
                IsAvailable = true,
                Status = ProductStatus.Available,
                CreatedAt = DateTime.UtcNow
            }
        };
        context.Products.AddRange(drinks);
        context.SaveChanges();

        // 8. Create simplified zones and sunbeds for other venues
        foreach (var otherVenue in venues.Skip(1))
        {
            // Create a single zone for each venue
            var zone = new VenueZone
            {
                VenueId = otherVenue.Id,
                Name = "Main Beach",
                OrderIndex = 1,
                CreatedAt = DateTime.UtcNow
            };
            context.VenueZones.Add(zone);
            context.SaveChanges();

            // Create sunbed category for this venue
            var venueSunbedCategory = new Category
            {
                VenueId = otherVenue.Id,
                Name = "Sunbeds",
                Type = CategoryType.Sunbeds,
                OrderIndex = 1,
                CreatedAt = DateTime.UtcNow
            };
            context.Categories.Add(venueSunbedCategory);
            context.SaveChanges();

            // Create 15 sunbeds with varied availability
            var venueSunbeds = new List<Product>();
            for (int i = 1; i <= 15; i++)
            {
                // Simulate different occupancy levels
                var status = i <= 5 ? ProductStatus.Occupied : 
                            i <= 8 ? ProductStatus.BookedOnline : 
                            ProductStatus.Available;
                
                venueSunbeds.Add(new Product
                {
                    CategoryId = venueSunbedCategory.Id,
                    VenueZoneId = zone.Id,
                    Name = $"Sunbed {i}",
                    UnitCode = $"M{i}",
                    BasePrice = 40.00m,
                    IsAvailable = status == ProductStatus.Available,
                    Status = status,
                    CurrentGuestName = status != ProductStatus.Available ? $"Guest {i}" : null,
                    CreatedAt = DateTime.UtcNow
                });
            }
            context.Products.AddRange(venueSunbeds);
            context.SaveChanges();
        }
    }
}
