using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Collector;
using BlackBear.Services.Core.Hubs;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Collector
{
    [Route("api/collector/bookings")]
    [ApiController]
    [Authorize(Policy = "Collector")]
    public class CollectorBookingsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHubContext<BeachHub> _hubContext;

        public CollectorBookingsController(
            BlackBearDbContext context,
            ICurrentUserService currentUserService,
            IHubContext<BeachHub> hubContext)
        {
            _context = context;
            _currentUserService = currentUserService;
            _hubContext = hubContext;
        }

        // GET: api/collector/bookings/{bookingCode}
        [HttpGet("{bookingCode}")]
        public async Task<ActionResult<CollectorBookingDetailsDto>> GetBooking(string bookingCode)
        {
            var collectorVenueId = await GetCollectorVenueIdAsync();
            if (collectorVenueId == null)
                return StatusCode(403, new { error = "No venue assigned to this account" });

            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Include(b => b.VenueZone)
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode &&
                                          b.VenueId == collectorVenueId.Value &&
                                          !b.IsDeleted);

            if (booking == null)
                return NotFound("Booking not found");

            return Ok(new CollectorBookingDetailsDto
            {
                Id = booking.Id,
                BookingCode = booking.BookingCode,
                Status = booking.Status,
                GuestName = booking.GuestName,
                GuestCount = booking.GuestCount,
                UnitsNeeded = booking.UnitsNeeded,
                ZoneName = booking.VenueZone?.Name ?? "",
                ZoneId = booking.ZoneId,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt
            });
        }

        // GET: api/collector/bookings/{bookingCode}/available-units
        [HttpGet("{bookingCode}/available-units")]
        public async Task<ActionResult<List<CollectorAvailableUnitDto>>> GetAvailableUnits(string bookingCode)
        {
            var collectorVenueId = await GetCollectorVenueIdAsync();
            if (collectorVenueId == null)
                return StatusCode(403, new { error = "No venue assigned to this account" });

            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode &&
                                          b.VenueId == collectorVenueId.Value &&
                                          !b.IsDeleted);

            if (booking == null)
                return NotFound("Booking not found");

            if (!booking.ZoneId.HasValue)
                return BadRequest("Booking has no zone assigned");

            var today = booking.StartTime.Date;

            // Get all available units in the booking's zone
            var units = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Where(u => u.VenueZoneId == booking.ZoneId.Value &&
                            u.VenueId == collectorVenueId.Value &&
                            !u.IsDeleted &&
                            u.Status == "Available")
                .ToListAsync();

            var unitIds = units.Select(u => u.Id).ToList();

            // Exclude units already booked for this date
            var bookedUnitIds = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Where(b => b.ZoneUnitId.HasValue &&
                            unitIds.Contains(b.ZoneUnitId.Value) &&
                            !b.IsDeleted &&
                            (b.Status == "Active" || b.Status == "Reserved") &&
                            b.StartTime.Date == today)
                .Select(b => b.ZoneUnitId!.Value)
                .Distinct()
                .ToListAsync();

            var availableUnits = units
                .Where(u => !bookedUnitIds.Contains(u.Id))
                .OrderBy(u => u.UnitCode)
                .Select(u => new CollectorAvailableUnitDto
                {
                    Id = u.Id,
                    UnitCode = u.UnitCode,
                    UnitType = u.UnitType,
                    Status = u.Status,
                    BasePrice = u.BasePrice,
                    PositionX = u.PositionX,
                    PositionY = u.PositionY
                })
                .ToList();

            return Ok(availableUnits);
        }

        // PUT: api/collector/bookings/{bookingCode}/approve
        [HttpPut("{bookingCode}/approve")]
        public async Task<ActionResult<CollectorBookingDetailsDto>> ApproveBooking(
            string bookingCode, CollectorApproveBookingRequest request)
        {
            var collectorVenueId = await GetCollectorVenueIdAsync();
            if (collectorVenueId == null)
                return StatusCode(403, new { error = "No venue assigned to this account" });

            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Include(b => b.VenueZone)
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode &&
                                          b.VenueId == collectorVenueId.Value &&
                                          !b.IsDeleted);

            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status != "Pending")
                return BadRequest($"Only Pending bookings can be approved. Current status: {booking.Status}");

            if (request.UnitIds.Count < booking.UnitsNeeded)
                return BadRequest($"Must assign at least {booking.UnitsNeeded} unit(s). Provided: {request.UnitIds.Count}");

            // Validate all units exist, belong to the venue, and are available
            var units = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Where(u => request.UnitIds.Contains(u.Id) &&
                            u.VenueId == collectorVenueId.Value &&
                            !u.IsDeleted)
                .ToListAsync();

            if (units.Count != request.UnitIds.Count)
                return BadRequest("One or more units not found");

            var unavailableUnits = units.Where(u => u.Status != "Available").ToList();
            if (unavailableUnits.Count > 0)
            {
                var codes = string.Join(", ", unavailableUnits.Select(u => u.UnitCode));
                return BadRequest($"Units not available: {codes}");
            }

            // Assign the first unit as the primary ZoneUnitId
            booking.ZoneUnitId = units[0].Id;
            booking.Status = "Reserved";

            if (int.TryParse(_currentUserService.UserId, out var userId))
                booking.HandledByUserId = userId;

            // Mark all assigned units as Reserved and link to booking
            foreach (var unit in units)
            {
                unit.Status = "Reserved";
                unit.CurrentBookingId = booking.Id;
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingApproved", new
            {
                booking.BookingCode,
                booking.Status,
                AssignedUnits = units.Select(u => u.UnitCode).ToList()
            });

            return Ok(new CollectorBookingDetailsDto
            {
                Id = booking.Id,
                BookingCode = booking.BookingCode,
                Status = booking.Status,
                GuestName = booking.GuestName,
                GuestCount = booking.GuestCount,
                UnitsNeeded = booking.UnitsNeeded,
                ZoneName = booking.VenueZone?.Name ?? "",
                ZoneId = booking.ZoneId,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt
            });
        }

        // PUT: api/collector/bookings/{bookingCode}/reject
        [HttpPut("{bookingCode}/reject")]
        public async Task<ActionResult<CollectorBookingDetailsDto>> RejectBooking(string bookingCode)
        {
            var collectorVenueId = await GetCollectorVenueIdAsync();
            if (collectorVenueId == null)
                return StatusCode(403, new { error = "No venue assigned to this account" });

            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Include(b => b.VenueZone)
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode &&
                                          b.VenueId == collectorVenueId.Value &&
                                          !b.IsDeleted);

            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status != "Pending")
                return BadRequest($"Only Pending bookings can be rejected. Current status: {booking.Status}");

            booking.Status = "Cancelled";
            booking.Notes = string.IsNullOrEmpty(booking.Notes)
                ? "Rejected by collector"
                : $"{booking.Notes} | Rejected by collector";

            if (int.TryParse(_currentUserService.UserId, out var userId))
                booking.HandledByUserId = userId;

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingRejected", new
            {
                booking.BookingCode,
                booking.Status
            });

            return Ok(new CollectorBookingDetailsDto
            {
                Id = booking.Id,
                BookingCode = booking.BookingCode,
                Status = booking.Status,
                GuestName = booking.GuestName,
                GuestCount = booking.GuestCount,
                UnitsNeeded = booking.UnitsNeeded,
                ZoneName = booking.VenueZone?.Name ?? "",
                ZoneId = booking.ZoneId,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt
            });
        }

        // POST: api/collector/bookings/{bookingCode}/checkin
        [HttpPost("{bookingCode}/checkin")]
        public async Task<IActionResult> CheckInBooking(string bookingCode)
        {
            var collectorVenueId = await GetCollectorVenueIdAsync();
            if (collectorVenueId == null)
                return StatusCode(403, new { error = "No venue assigned to this account" });

            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Include(b => b.AssignedUnits)
                .Include(b => b.ZoneUnit)
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode &&
                                          b.VenueId == collectorVenueId.Value &&
                                          !b.IsDeleted);

            if (booking == null)
                return NotFound("Booking not found");

            if (booking.Status != "Reserved")
                return BadRequest($"Cannot check in a booking with status '{booking.Status}'");

            // Check if expired
            if (booking.ExpirationTime.HasValue && DateTime.UtcNow > booking.ExpirationTime.Value)
            {
                booking.Status = "Expired";

                foreach (var unit in booking.AssignedUnits)
                {
                    unit.Status = "Available";
                    unit.CurrentBookingId = null;
                }
                if (booking.ZoneUnit != null && booking.ZoneUnit.Status == "Reserved")
                    booking.ZoneUnit.Status = "Available";

                await _context.SaveChangesAsync();

                return BadRequest(new
                {
                    error = "BOOKING_EXPIRED",
                    message = "Reservation has expired",
                    expirationTime = booking.ExpirationTime
                });
            }

            booking.Status = "Active";
            booking.CheckedInAt = DateTime.UtcNow;

            if (int.TryParse(_currentUserService.UserId, out var userId))
                booking.HandledByUserId = userId;

            // Update all assigned units to Occupied
            foreach (var unit in booking.AssignedUnits)
            {
                unit.Status = "Occupied";
            }
            if (booking.ZoneUnit != null)
                booking.ZoneUnit.Status = "Occupied";

            await _context.SaveChangesAsync();

            var unitCodes = booking.AssignedUnits.Select(u => u.UnitCode).ToList();

            await _hubContext.Clients.All.SendAsync("BookingCheckedIn", new
            {
                booking.BookingCode,
                booking.Status,
                unitCodes
            });

            return Ok(new
            {
                message = "Check-in successful",
                unitCodes
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
    }
}
