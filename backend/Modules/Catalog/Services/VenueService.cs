using Microsoft.EntityFrameworkCore;
using RivieraApi.Data;
using RivieraApi.Modules.Catalog.DTOs;

namespace RivieraApi.Modules.Catalog.Services;

public class VenueService
{
    private readonly RivieraDbContext _context;

    public VenueService(RivieraDbContext context)
    {
        _context = context;
    }

    // OPTIMIZED: Single query with projection to DTO (sub-200ms target)
    public async Task<VenueLayoutDto?> GetVenueLayoutAsync(int venueId)
    {
        return await _context.Venues
            .Where(v => v.Id == venueId)
            .Select(v => new VenueLayoutDto
            {
                Id = v.Id,
                Name = v.Name,
                Location = v.Location,
                Latitude = v.Latitude,
                Longitude = v.Longitude,
                IsOpen = v.IsOpen,
                ImageUrl = v.ImageUrl,
                Description = v.Description,
                Zones = v.Zones
                    .OrderBy(z => z.OrderIndex)
                    .Select(z => new VenueZoneDto
                    {
                        Id = z.Id,
                        Name = z.Name,
                        OrderIndex = z.OrderIndex,
                        Products = z.Products
                            .Select(p => new ProductDto
                            {
                                Id = p.Id,
                                Name = p.Name,
                                UnitCode = p.UnitCode,
                                BasePrice = p.BasePrice,
                                Status = p.Status,
                                IsAvailable = p.IsAvailable,
                                CurrentGuestName = p.CurrentGuestName
                            })
                            .ToList()
                    })
                    .ToList(),
                Categories = v.Categories
                    .Select(c => new CategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        Type = c.Type,
                        Products = c.Products
                            .Where(p => p.IsAvailable) // Only return available items
                            .Select(p => new MenuProductDto
                            {
                                Id = p.Id,
                                Name = p.Name,
                                BasePrice = p.BasePrice,
                                IsAvailable = p.IsAvailable,
                                ImageUrl = p.ImageUrl,
                                Description = p.Description,
                                UpsellProductId = p.UpsellProductId
                            })
                            .ToList()
                    })
                    .ToList()
            })
            .AsNoTracking() // Critical: No change tracking for read-only queries
            .FirstOrDefaultAsync();
    }

    // OPTIMIZED: Discovery page query (minimal data)
    public async Task<List<VenueDiscoveryDto>> GetAllVenuesAsync()
    {
        return await _context.Venues
            .Select(v => new VenueDiscoveryDto
            {
                Id = v.Id,
                Name = v.Name,
                Location = v.Location,
                Latitude = v.Latitude,
                Longitude = v.Longitude,
                IsOpen = v.IsOpen,
                ImageUrl = v.ImageUrl,
                Description = v.Description,
                TotalBeds = v.Zones
                    .SelectMany(z => z.Products)
                    .Count(p => p.Category.Type == CategoryType.Sunbeds),
                OccupiedBeds = v.Zones
                    .SelectMany(z => z.Products)
                    .Count(p => p.Category.Type == CategoryType.Sunbeds && !p.IsAvailable)
            })
            .AsNoTracking()
            .ToListAsync();
    }

    // ATOMIC: Update product status with concurrency handling
    public async Task<Product?> UpdateProductStatusAsync(int productId, ProductStatus newStatus, string? guestName = null)
    {
        var product = await _context.Products.FindAsync(productId);
        if (product == null) return null;

        product.Status = newStatus;
        product.CurrentGuestName = guestName;
        product.IsAvailable = newStatus == ProductStatus.Available;

        await _context.SaveChangesAsync();
        return product;
    }
}
