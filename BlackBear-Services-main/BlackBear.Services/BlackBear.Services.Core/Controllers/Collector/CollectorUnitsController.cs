using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Collector;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Collector
{
    [Route("api/collector")]
    [ApiController]
    [Authorize(Policy = "Collector")]
    public class CollectorUnitsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public CollectorUnitsController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/collector/units
        [HttpGet("units")]
        public async Task<ActionResult<CollectorVenueUnitsDto>> GetUnits()
        {
            var collectorVenueId = await GetCollectorVenueIdAsync();
            if (collectorVenueId == null)
            {
                return StatusCode(403, new { error = "No venue assigned to this account" });
            }

            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == collectorVenueId.Value && !v.IsDeleted);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var zones = await _context.VenueZones
                .Where(z => z.VenueId == collectorVenueId.Value && z.IsActive)
                .OrderBy(z => z.Name)
                .ToListAsync();

            var units = await _context.ZoneUnits
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .Where(zu => zu.VenueId == collectorVenueId.Value)
                .OrderBy(zu => zu.UnitCode)
                .ToListAsync();

            var unitsByZone = units.GroupBy(zu => zu.VenueZoneId).ToDictionary(g => g.Key, g => g.ToList());

            var zoneDtos = zones.Select(z => new CollectorZoneDto
            {
                Id = z.Id,
                Name = z.Name,
                ZoneType = z.ZoneType,
                Units = unitsByZone.TryGetValue(z.Id, out var zoneUnits)
                    ? zoneUnits.Select(u =>
                    {
                        var activeBooking = u.Bookings
                            .OrderByDescending(b => b.StartTime)
                            .FirstOrDefault();

                        return new CollectorUnitDto
                        {
                            Id = u.Id,
                            UnitCode = u.UnitCode,
                            UnitType = u.UnitType,
                            Status = u.Status,
                            PositionX = u.PositionX,
                            PositionY = u.PositionY,
                            Notes = u.Notes,
                            CurrentBooking = activeBooking != null ? new CollectorCurrentBookingDto
                            {
                                Id = activeBooking.Id,
                                BookingCode = activeBooking.BookingCode,
                                GuestName = activeBooking.GuestName ?? string.Empty,
                                GuestCount = activeBooking.GuestCount,
                                Status = activeBooking.Status,
                                StartTime = activeBooking.StartTime,
                                EndTime = activeBooking.EndTime,
                                CheckedInAt = activeBooking.CheckedInAt
                            } : null,
                            AvailableTransitions = GetAvailableTransitions(u.Status)
                        };
                    }).ToList()
                    : new List<CollectorUnitDto>()
            }).ToList();

            return Ok(new CollectorVenueUnitsDto
            {
                VenueId = venue.Id,
                VenueName = venue.Name,
                Zones = zoneDtos
            });
        }

        // PUT: api/collector/units/{id}/status
        [HttpPut("units/{id}/status")]
        public async Task<ActionResult<CollectorUnitDto>> UpdateUnitStatus(int id, CollectorUpdateUnitStatusRequest request)
        {
            var collectorVenueId = await GetCollectorVenueIdAsync();
            if (collectorVenueId == null)
            {
                return StatusCode(403, new { error = "No venue assigned to this account" });
            }

            var unit = await _context.ZoneUnits
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .FirstOrDefaultAsync(zu => zu.Id == id);

            if (unit == null)
            {
                return NotFound();
            }

            if (unit.VenueId != collectorVenueId.Value)
            {
                return NotFound();
            }

            unit.Status = request.Status;

            if (request.Notes != null)
            {
                unit.Notes = request.Notes;
            }

            var activeBooking = unit.Bookings.FirstOrDefault(b => b.Status == "Active" || b.Status == "Reserved");

            if (request.Status == "Available" && activeBooking != null)
            {
                activeBooking.Status = "Completed";
                activeBooking.CheckedOutAt = DateTime.UtcNow;
            }
            else if (request.Status == "Occupied" && activeBooking != null && activeBooking.Status == "Reserved")
            {
                activeBooking.Status = "Active";
                activeBooking.CheckedInAt = DateTime.UtcNow;
                if (int.TryParse(_currentUserService.UserId, out var userId))
                {
                    activeBooking.HandledByUserId = userId;
                }
            }

            await _context.SaveChangesAsync();

            var currentBooking = unit.Bookings
                .Where(b => b.Status == "Active" || b.Status == "Reserved")
                .OrderByDescending(b => b.StartTime)
                .FirstOrDefault();

            return Ok(new CollectorUnitDto
            {
                Id = unit.Id,
                UnitCode = unit.UnitCode,
                UnitType = unit.UnitType,
                Status = unit.Status,
                PositionX = unit.PositionX,
                PositionY = unit.PositionY,
                Notes = unit.Notes,
                CurrentBooking = currentBooking != null ? new CollectorCurrentBookingDto
                {
                    Id = currentBooking.Id,
                    BookingCode = currentBooking.BookingCode,
                    GuestName = currentBooking.GuestName ?? string.Empty,
                    GuestCount = currentBooking.GuestCount,
                    Status = currentBooking.Status,
                    StartTime = currentBooking.StartTime,
                    EndTime = currentBooking.EndTime,
                    CheckedInAt = currentBooking.CheckedInAt
                } : null,
                AvailableTransitions = GetAvailableTransitions(unit.Status)
            });
        }

        private async Task<int?> GetCollectorVenueIdAsync()
        {
            if (!int.TryParse(_currentUserService.UserId, out var userId))
                return null;

            var user = await _context.Users
                .IgnoreQueryFilters()
                .Select(u => new { u.Id, u.VenueId })
                .FirstOrDefaultAsync(u => u.Id == userId);

            return user?.VenueId;
        }

        private static List<string> GetAvailableTransitions(string status) => status switch
        {
            "Available" => new List<string> { "Occupied", "Maintenance" },
            "Reserved" => new List<string> { "Available", "Occupied", "Maintenance" },
            "Occupied" => new List<string> { "Available", "Maintenance" },
            "Maintenance" => new List<string> { "Available" },
            _ => new List<string>()
        };
    }
}
