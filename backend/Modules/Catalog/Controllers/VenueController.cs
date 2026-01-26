using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RivieraApi.Hubs;
using RivieraApi.Modules.Catalog.Services;

namespace RivieraApi.Modules.Catalog.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VenueController : ControllerBase
{
    private readonly VenueService _venueService;
    private readonly IHubContext<BeachHub> _hubContext;

    public VenueController(VenueService venueService, IHubContext<BeachHub> hubContext)
    {
        _venueService = venueService;
        _hubContext = hubContext;
    }

    // GET /api/venue - Get all venues with occupancy data (Discovery Page)
    [HttpGet]
    public async Task<IActionResult> GetAllVenues()
    {
        var venues = await _venueService.GetAllVenuesAsync();
        return Ok(venues);
    }

    // GET /api/venue/{id}/layout - Get full venue layout (Menu Page + Admin)
    [HttpGet("{id}/layout")]
    public async Task<IActionResult> GetVenueLayout(int id)
    {
        var venue = await _venueService.GetVenueLayoutAsync(id);
        
        if (venue == null)
        {
            return NotFound(new { message = "Venue not found" });
        }

        return Ok(venue);
    }

    // PATCH /api/venue/products/{id}/status - Update sunbed status
    [HttpPatch("products/{id}/status")]
    public async Task<IActionResult> UpdateProductStatus(int id, [FromBody] UpdateProductStatusRequest request)
    {
        var product = await _venueService.UpdateProductStatusAsync(id, request.Status, request.GuestName);
        
        if (product == null)
        {
            return NotFound(new { message = "Product not found" });
        }

        // Broadcast layout update via SignalR
        await _hubContext.Clients.All.SendAsync("LayoutUpdate", new
        {
            productId = id,
            status = request.Status,
            guestName = request.GuestName,
            isAvailable = product.IsAvailable
        });

        return Ok(new
        {
            message = "Product status updated",
            product = new
            {
                product.Id,
                product.Name,
                product.UnitCode,
                product.Status,
                product.CurrentGuestName,
                product.IsAvailable
            }
        });
    }
}

public class UpdateProductStatusRequest
{
    public ProductStatus Status { get; set; }
    public string? GuestName { get; set; }
}
