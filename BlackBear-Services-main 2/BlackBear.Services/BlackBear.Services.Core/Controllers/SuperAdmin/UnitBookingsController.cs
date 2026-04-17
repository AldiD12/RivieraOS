using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/venues/{venueId}/bookings")]
    [ApiController]
    [EnableRateLimiting("fixed")]
    [Authorize(Policy = "SuperAdmin")]
    public class UnitBookingsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public UnitBookingsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/venues/5/bookings
        [HttpGet]
        public async Task<ActionResult<List<ZoneUnitBookingListItemDto>>> GetBookings(
            int venueId,
            [FromQuery] int? zoneId = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? date = null)
        {
            var venueExists = await _context.Venues
                .IgnoreQueryFilters()
                .AnyAsync(v => v.Id == venueId && !v.IsDeleted);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var query = _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                    .ThenInclude(zu => zu!.VenueZone)
                .Include(b => b.Venue)
                    .ThenInclude(v => v!.Business)
                .IgnoreQueryFilters()
                .Where(b => !b.IsDeleted && b.VenueId == venueId);

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
                .Select(b => new ZoneUnitBookingListItemDto
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
                    ZoneName = b.ZoneUnit.VenueZone!.Name,
                    VenueId = b.VenueId,
                    VenueName = b.Venue != null ? b.Venue.Name : "",
                    BusinessId = b.BusinessId,
                    BusinessName = b.Venue != null && b.Venue.Business != null
                        ? b.Venue.Business.BrandName ?? b.Venue.Business.RegisteredName
                        : null
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/superadmin/venues/5/bookings/active
        [HttpGet("active")]
        public async Task<ActionResult<List<ZoneUnitBookingListItemDto>>> GetActiveBookings(int venueId)
        {
            var venueExists = await _context.Venues
                .IgnoreQueryFilters()
                .AnyAsync(v => v.Id == venueId && !v.IsDeleted);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var bookings = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                    .ThenInclude(zu => zu!.VenueZone)
                .Include(b => b.Venue)
                    .ThenInclude(v => v!.Business)
                .IgnoreQueryFilters()
                .Where(b => !b.IsDeleted && b.VenueId == venueId && (b.Status == "Active" || b.Status == "Reserved"))
                .OrderBy(b => b.StartTime)
                .Select(b => new ZoneUnitBookingListItemDto
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
                    ZoneName = b.ZoneUnit.VenueZone!.Name,
                    VenueId = b.VenueId,
                    VenueName = b.Venue != null ? b.Venue.Name : "",
                    BusinessId = b.BusinessId,
                    BusinessName = b.Venue != null && b.Venue.Business != null
                        ? b.Venue.Business.BrandName ?? b.Venue.Business.RegisteredName
                        : null
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/superadmin/venues/5/bookings/10
        [HttpGet("{id}")]
        public async Task<ActionResult<ZoneUnitBookingDetailDto>> GetBooking(int venueId, int id)
        {
            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                    .ThenInclude(zu => zu!.VenueZone)
                .Include(b => b.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(b => b.HandledByUser)
                .IgnoreQueryFilters()
                .Where(b => !b.IsDeleted)
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            return Ok(new ZoneUnitBookingDetailDto
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
                BusinessId = booking.BusinessId,
                BusinessName = booking.Venue?.Business?.BrandName ?? booking.Venue?.Business?.RegisteredName,
                HandledByUserId = booking.HandledByUserId,
                HandledByUserName = booking.HandledByUser?.FullName
            });
        }

        // POST: api/superadmin/venues/5/bookings (walk-in booking)
        [HttpPost]
        public async Task<ActionResult<ZoneUnitBookingDetailDto>> CreateBooking(int venueId, CreateBookingRequest request)
        {
            var unit = await _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Venue)
                    .ThenInclude(v => v!.Business)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(zu => !zu.IsDeleted && zu.Id == request.ZoneUnitId && zu.VenueId == venueId);

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
                BusinessId = unit.BusinessId
            };

            unit.Status = request.CheckInImmediately ? "Occupied" : "Reserved";

            _context.ZoneUnitBookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBooking), new { venueId, id = booking.Id }, new ZoneUnitBookingDetailDto
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
                BusinessId = booking.BusinessId,
                BusinessName = unit.Venue?.Business?.BrandName ?? unit.Venue?.Business?.RegisteredName
            });
        }

        // POST: api/superadmin/venues/5/bookings/10/check-in
        [HttpPost("{id}/check-in")]
        public async Task<IActionResult> CheckIn(int venueId, int id, CheckInRequest? request = null)
        {
            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => !b.IsDeleted && b.Id == id && b.VenueId == venueId);

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

            if (request?.Notes != null)
            {
                booking.Notes = string.IsNullOrEmpty(booking.Notes)
                    ? request.Notes
                    : $"{booking.Notes}\n{request.Notes}";
            }

            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Occupied";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/venues/5/bookings/10/check-out
        [HttpPost("{id}/check-out")]
        public async Task<IActionResult> CheckOut(int venueId, int id, CheckOutRequest? request = null)
        {
            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => !b.IsDeleted && b.Id == id && b.VenueId == venueId);

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

            if (request?.Notes != null)
            {
                booking.Notes = string.IsNullOrEmpty(booking.Notes)
                    ? request.Notes
                    : $"{booking.Notes}\n{request.Notes}";
            }

            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/venues/5/bookings/10/cancel
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int venueId, int id)
        {
            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => !b.IsDeleted && b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status == "Completed" || booking.Status == "Cancelled")
            {
                return BadRequest($"Cannot cancel a booking with status '{booking.Status}'");
            }

            booking.Status = "Cancelled";

            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/venues/5/bookings/10/no-show
        [HttpPost("{id}/no-show")]
        public async Task<IActionResult> MarkNoShow(int venueId, int id)
        {
            var booking = await _context.ZoneUnitBookings
                .Include(b => b.ZoneUnit)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => !b.IsDeleted && b.Id == id && b.VenueId == venueId);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status != "Reserved")
            {
                return BadRequest($"Cannot mark as no-show a booking with status '{booking.Status}'");
            }

            booking.Status = "NoShow";

            if (booking.ZoneUnit != null)
            {
                booking.ZoneUnit.Status = "Available";
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/superadmin/venues/5/bookings/10 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int venueId, int id)
        {
            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId && !b.IsDeleted);

            if (booking == null)
            {
                return NotFound();
            }

            booking.IsDeleted = true;
            booking.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/venues/5/bookings/10/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreBooking(int venueId, int id)
        {
            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.Id == id && b.VenueId == venueId && b.IsDeleted);

            if (booking == null)
            {
                return NotFound();
            }

            booking.IsDeleted = false;
            booking.DeletedAt = null;

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
