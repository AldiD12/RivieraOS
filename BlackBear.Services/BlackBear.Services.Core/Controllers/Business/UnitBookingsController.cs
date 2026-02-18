using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Hubs;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/venues/{venueId}/bookings")]
    [ApiController]
    [Authorize(Policy = "Collector")]
    public class UnitBookingsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHubContext<BeachHub> _hubContext;

        public UnitBookingsController(BlackBearDbContext context, ICurrentUserService currentUserService, IHubContext<BeachHub> hubContext)
        {
            _context = context;
            _currentUserService = currentUserService;
            _hubContext = hubContext;
        }

        // GET: api/business/venues/5/bookings
        [HttpGet]
        public async Task<ActionResult<List<BizBookingListItemDto>>> GetBookings(
            int venueId,
            [FromQuery] int? zoneId = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? date = null)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venueExists = await _context.Venues.AnyAsync(v => v.Id == venueId);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var query = _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                    .ThenInclude(zu => zu!.VenueZone)
                .Where(b => b.VenueId == venueId);

            if (zoneId.HasValue)
            {
                query = query.Where(b => b.ZoneUnit!.VenueZoneId == zoneId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b => b.Status == status);
            }

            if (date.HasValue)
            {
                var startOfDay = date.Value.Date;
                var endOfDay = startOfDay.AddDays(1);
                query = query.Where(b => b.StartTime >= startOfDay && b.StartTime < endOfDay);
            }

            var bookings = await query
                .OrderByDescending(b => b.StartTime)
                .Select(b => new BizBookingListItemDto
                {
                    Id = b.Id,
                    BookingCode = b.BookingCode,
                    Status = b.Status,
                    GuestName = b.GuestName,
                    GuestPhone = b.GuestPhone,
                    GuestCount = b.GuestCount,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    CheckedInAt = b.CheckedInAt,
                    CheckedOutAt = b.CheckedOutAt,
                    ZoneUnitId = b.ZoneUnitId,
                    UnitCode = b.ZoneUnit!.UnitCode,
                    UnitType = b.ZoneUnit.UnitType,
                    ZoneName = b.ZoneUnit.VenueZone!.Name
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/business/venues/5/bookings/active
        [HttpGet("active")]
        public async Task<ActionResult<List<BizBookingListItemDto>>> GetActiveBookings(int venueId)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venueExists = await _context.Venues.AnyAsync(v => v.Id == venueId);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var bookings = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                    .ThenInclude(zu => zu!.VenueZone)
                .Where(b => b.VenueId == venueId && (b.Status == "Active" || b.Status == "Reserved"))
                .OrderBy(b => b.StartTime)
                .Select(b => new BizBookingListItemDto
                {
                    Id = b.Id,
                    BookingCode = b.BookingCode,
                    Status = b.Status,
                    GuestName = b.GuestName,
                    GuestPhone = b.GuestPhone,
                    GuestCount = b.GuestCount,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    CheckedInAt = b.CheckedInAt,
                    CheckedOutAt = b.CheckedOutAt,
                    ZoneUnitId = b.ZoneUnitId,
                    UnitCode = b.ZoneUnit!.UnitCode,
                    UnitType = b.ZoneUnit.UnitType,
                    ZoneName = b.ZoneUnit.VenueZone!.Name
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/business/venues/5/bookings/10
        [HttpGet("{id}")]
        public async Task<ActionResult<BizBookingDetailDto>> GetBooking(int venueId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                    .ThenInclude(zu => zu!.VenueZone)
                .Include(b => b.Venue)
                .Include(b => b.HandledByUser)
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            return Ok(new BizBookingDetailDto
            {
                Id = booking.Id,
                BookingCode = booking.BookingCode,
                Status = booking.Status,
                GuestName = booking.GuestName,
                GuestPhone = booking.GuestPhone,
                GuestEmail = booking.GuestEmail,
                GuestCount = booking.GuestCount,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                CheckedInAt = booking.CheckedInAt,
                CheckedOutAt = booking.CheckedOutAt,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt,
                ZoneUnitId = booking.ZoneUnitId,
                UnitCode = booking.ZoneUnit?.UnitCode ?? "",
                UnitType = booking.ZoneUnit?.UnitType ?? "",
                VenueZoneId = booking.ZoneUnit?.VenueZoneId ?? 0,
                ZoneName = booking.ZoneUnit?.VenueZone?.Name ?? "",
                VenueId = booking.VenueId,
                VenueName = booking.Venue?.Name ?? "",
                HandledByUserId = booking.HandledByUserId,
                HandledByUserName = booking.HandledByUser?.FullName
            });
        }

        // POST: api/business/venues/5/bookings (walk-in booking)
        [HttpPost]
        public async Task<ActionResult<BizBookingDetailDto>> CreateBooking(int venueId, BizCreateBookingRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var unit = await _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Venue)
                .FirstOrDefaultAsync(zu => zu.Id == request.ZoneUnitId && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound("Unit not found");
            }

            if (unit.Status != "Available")
            {
                return BadRequest($"Unit is currently {unit.Status} and cannot be booked");
            }

            var bookingCode = GenerateBookingCode();
            var now = DateTime.UtcNow;

            var booking = new ZoneUnitBooking
            {
                BookingCode = bookingCode,
                Status = request.CheckInImmediately ? "Active" : "Reserved",
                GuestName = request.GuestName,
                GuestPhone = request.GuestPhone,
                GuestEmail = request.GuestEmail,
                GuestCount = request.GuestCount,
                StartTime = request.StartTime ?? now,
                EndTime = request.EndTime,
                CheckedInAt = request.CheckInImmediately ? now : null,
                Notes = request.Notes,
                ZoneUnitId = request.ZoneUnitId,
                VenueId = venueId,
                BusinessId = businessId.Value,
                HandledByUserId = int.TryParse(_currentUserService.UserId, out var userId) ? userId : null
            };

            // Update unit status
            unit.Status = request.CheckInImmediately ? "Occupied" : "Reserved";

            _context.ZoneUnitBookings.Add(booking);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingCreated", new
            {
                bookingId = booking.Id,
                venueId = booking.VenueId,
                zoneUnitId = booking.ZoneUnitId,
                status = booking.Status,
                guestName = booking.GuestName,
                guestCount = booking.GuestCount
            });

            return CreatedAtAction(nameof(GetBooking), new { venueId, id = booking.Id }, new BizBookingDetailDto
            {
                Id = booking.Id,
                BookingCode = booking.BookingCode,
                Status = booking.Status,
                GuestName = booking.GuestName,
                GuestPhone = booking.GuestPhone,
                GuestEmail = booking.GuestEmail,
                GuestCount = booking.GuestCount,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                CheckedInAt = booking.CheckedInAt,
                CheckedOutAt = booking.CheckedOutAt,
                Notes = booking.Notes,
                CreatedAt = booking.CreatedAt,
                ZoneUnitId = booking.ZoneUnitId,
                UnitCode = unit.UnitCode,
                UnitType = unit.UnitType,
                VenueZoneId = unit.VenueZoneId,
                ZoneName = unit.VenueZone?.Name ?? "",
                VenueId = booking.VenueId,
                VenueName = unit.Venue?.Name ?? "",
                HandledByUserId = booking.HandledByUserId
            });
        }

        // POST: api/business/venues/5/bookings/10/check-in
        [HttpPost("{id}/check-in")]
        public async Task<IActionResult> CheckIn(int venueId, int id, BizCheckInRequest? request = null)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status != "Reserved")
            {
                return BadRequest($"Cannot check in a booking with status '{booking.Status}'");
            }

            booking.Status = "Active";
            booking.CheckedInAt = DateTime.UtcNow;
            if (int.TryParse(_currentUserService.UserId, out var userId))
            {
                booking.HandledByUserId = userId;
            }

            if (request?.Notes != null)
            {
                booking.Notes = string.IsNullOrEmpty(booking.Notes)
                    ? request.Notes
                    : $"{booking.Notes}\n{request.Notes}";
            }

            // Update unit status
            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Occupied";
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
            {
                bookingId = booking.Id,
                zoneUnitId = booking.ZoneUnitId,
                status = booking.Status,
                venueId = booking.VenueId
            });

            return NoContent();
        }

        // POST: api/business/venues/5/bookings/10/check-out
        [HttpPost("{id}/check-out")]
        public async Task<IActionResult> CheckOut(int venueId, int id, BizCheckOutRequest? request = null)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status != "Active")
            {
                return BadRequest($"Cannot check out a booking with status '{booking.Status}'");
            }

            booking.Status = "Completed";
            booking.CheckedOutAt = DateTime.UtcNow;
            if (int.TryParse(_currentUserService.UserId, out var userId))
            {
                booking.HandledByUserId = userId;
            }

            if (request?.Notes != null)
            {
                booking.Notes = string.IsNullOrEmpty(booking.Notes)
                    ? request.Notes
                    : $"{booking.Notes}\n{request.Notes}";
            }

            // Update unit status
            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Available";
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
            {
                bookingId = booking.Id,
                zoneUnitId = booking.ZoneUnitId,
                status = booking.Status,
                venueId = booking.VenueId
            });

            return NoContent();
        }

        // POST: api/business/venues/5/bookings/10/cancel
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int venueId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status == "Completed" || booking.Status == "Cancelled")
            {
                return BadRequest($"Cannot cancel a booking with status '{booking.Status}'");
            }

            booking.Status = "Cancelled";

            // Update unit status
            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Available";
            }

            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("BookingStatusChanged", new
            {
                bookingId = booking.Id,
                zoneUnitId = booking.ZoneUnitId,
                status = booking.Status,
                venueId = booking.VenueId
            });

            return NoContent();
        }

        // POST: api/business/venues/5/bookings/10/no-show
        [HttpPost("{id}/no-show")]
        public async Task<IActionResult> MarkNoShow(int venueId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status != "Reserved")
            {
                return BadRequest($"Cannot mark as no-show a booking with status '{booking.Status}'");
            }

            booking.Status = "NoShow";
            if (int.TryParse(_currentUserService.UserId, out var userId))
            {
                booking.HandledByUserId = userId;
            }

            // Update unit status
            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string GenerateBookingCode()
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            var random = new Random();
            var code = new char[8];
            for (int i = 0; i < code.Length; i++)
            {
                code[i] = chars[random.Next(chars.Length)];
            }
            return new string(code);
        }
    }
}
