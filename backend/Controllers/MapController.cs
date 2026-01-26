using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RivieraApi.Data;
using RivieraApi.Modules.Catalog;

namespace RivieraApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MapController : ControllerBase
{
    private readonly RivieraDbContext _context;

    public MapController(RivieraDbContext context)
    {
        _context = context;
    }

    // GET /api/map/venues - Public endpoint for the discovery map
    [HttpGet("venues")]
    public async Task<IActionResult> GetVenues()
    {
        var venues = await _context.Venues
            .Include(v => v.Zones)
                .ThenInclude(z => z.Products)
            .Select(v => new
            {
                v.Id,
                v.Name,
                v.Location,
                v.Latitude,
                v.Longitude,
                v.ImageUrl,
                v.Description,
                // Get the minimum sunbed price for display
                PricePerBed = v.Zones.SelectMany(z => z.Products)
                    .Where(p => p.UnitCode != null)
                    .Min(p => (decimal?)p.BasePrice) ?? 0,
                // Count only sunbeds (products with UnitCode)
                TotalBeds = v.Zones.SelectMany(z => z.Products).Count(p => p.UnitCode != null),
                // Count unavailable sunbeds (IsAvailable == false)
                OccupiedBeds = v.Zones.SelectMany(z => z.Products)
                    .Count(p => p.UnitCode != null && !p.IsAvailable),
                // Calculate occupancy percentage
                OccupancyPercentage = v.Zones.SelectMany(z => z.Products).Any(p => p.UnitCode != null)
                    ? (int)Math.Round((double)v.Zones.SelectMany(z => z.Products)
                        .Count(p => p.UnitCode != null && !p.IsAvailable) 
                        / v.Zones.SelectMany(z => z.Products).Count(p => p.UnitCode != null) * 100)
                    : 0,
                // Traffic light status
                Status = GetVenueStatus(
                    v.Zones.SelectMany(z => z.Products).Count(p => p.UnitCode != null),
                    v.Zones.SelectMany(z => z.Products).Count(p => p.UnitCode != null && !p.IsAvailable)
                )
            })
            .ToListAsync();

        return Ok(venues);
    }

    private static string GetVenueStatus(int totalBeds, int occupiedBeds)
    {
        if (totalBeds == 0) return "Unknown";

        var occupancyPercentage = (double)occupiedBeds / totalBeds * 100;

        if (occupancyPercentage <= 50)
            return "Green"; // 🟢 Plenty of space
        else if (occupancyPercentage <= 90)
            return "Yellow"; // 🟡 Filling up fast
        else
            return "Red"; // 🔴 Sold out
    }
}
