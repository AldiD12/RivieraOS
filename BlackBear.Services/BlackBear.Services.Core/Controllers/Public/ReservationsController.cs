using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public ReservationsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/public/reservations/availability?venueId=1&date=2024-01-15
        [HttpGet("availability")]
        public async Task<ActionResult<PublicVenueAvailabilityDto>> GetAvailability(
            [FromQuery] int venueId,
            [FromQuery] DateTime? date = null)
        {
            var targetDate = date?.Date ?? DateTime.UtcNow.Date;

            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted && v.IsActive);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            // Get zones with their units
            var zones = await _context.VenueZones
                .IgnoreQueryFilters()
                .Where(z => z.VenueId == venueId && !z.IsDeleted)
                .OrderBy(z => z.Name)
                .ToListAsync();

            var zoneIds = zones.Select(z => z.Id).ToList();

            // Get all units for these zones
            var units = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Where(zu => zoneIds.Contains(zu.VenueZoneId) && !zu.IsDeleted)
                .ToListAsync();

            var unitIds = units.Select(u => u.Id).ToList();

            // Get reservations for today (to determine availability)
            var reservedUnitIds = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Where(b => unitIds.Contains(b.ZoneUnitId) &&
                            !b.IsDeleted &&
                            (b.Status == "Active" || b.Status == "Reserved") &&
                            b.StartTime.Date == targetDate)
                .Select(b => b.ZoneUnitId)
                .Distinct()
                .ToListAsync();

            var zoneAvailability = zones.Select(zone =>
            {
                var zoneUnits = units.Where(u => u.VenueZoneId == zone.Id).ToList();
                return new PublicZoneAvailabilityDto
                {
                    ZoneId = zone.Id,
                    ZoneName = zone.Name,
                    ZoneType = zone.ZoneType,
                    BasePrice = zone.BasePrice,
                    TotalUnits = zoneUnits.Count,
                    AvailableUnits = zoneUnits.Count(u =>
                        u.Status == "Available" && !reservedUnitIds.Contains(u.Id)),
                    Units = zoneUnits
                        .Where(u => u.Status != "Maintenance")
                        .OrderBy(u => u.UnitCode)
                        .Select(u => new PublicZoneUnitDto
                        {
                            Id = u.Id,
                            UnitCode = u.UnitCode,
                            UnitType = u.UnitType,
                            IsAvailable = u.Status == "Available" && !reservedUnitIds.Contains(u.Id),
                            Price = u.BasePrice ?? zone.BasePrice,
                            PositionX = u.PositionX,
                            PositionY = u.PositionY
                        })
                        .ToList()
                };
            }).ToList();

            return Ok(new PublicVenueAvailabilityDto
            {
                VenueId = venueId,
                VenueName = venue.Name,
                Date = targetDate,
                TotalAvailableUnits = zoneAvailability.Sum(z => z.AvailableUnits),
                Zones = zoneAvailability
            });
        }

        // GET: api/public/reservations/zones?venueId=1
        [HttpGet("zones")]
        public async Task<ActionResult<List<PublicZoneAvailabilityDto>>> GetZones([FromQuery] int venueId)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted && v.IsActive);

            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var today = DateTime.UtcNow.Date;

            var zones = await _context.VenueZones
                .IgnoreQueryFilters()
                .Where(z => z.VenueId == venueId && !z.IsDeleted)
                .OrderBy(z => z.Name)
                .ToListAsync();

            var zoneIds = zones.Select(z => z.Id).ToList();

            var unitCounts = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Where(zu => zoneIds.Contains(zu.VenueZoneId) && !zu.IsDeleted)
                .GroupBy(zu => zu.VenueZoneId)
                .Select(g => new
                {
                    ZoneId = g.Key,
                    Total = g.Count(),
                    Available = g.Count(u => u.Status == "Available")
                })
                .ToListAsync();

            var reservedCounts = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Include(b => b.ZoneUnit)
                .Where(b => zoneIds.Contains(b.ZoneUnit!.VenueZoneId) &&
                            !b.IsDeleted &&
                            (b.Status == "Active" || b.Status == "Reserved") &&
                            b.StartTime.Date == today)
                .GroupBy(b => b.ZoneUnit!.VenueZoneId)
                .Select(g => new { ZoneId = g.Key, Reserved = g.Count() })
                .ToListAsync();

            var result = zones.Select(zone =>
            {
                var counts = unitCounts.FirstOrDefault(c => c.ZoneId == zone.Id);
                var reserved = reservedCounts.FirstOrDefault(r => r.ZoneId == zone.Id)?.Reserved ?? 0;

                return new PublicZoneAvailabilityDto
                {
                    ZoneId = zone.Id,
                    ZoneName = zone.Name,
                    ZoneType = zone.ZoneType,
                    BasePrice = zone.BasePrice,
                    TotalUnits = counts?.Total ?? 0,
                    AvailableUnits = Math.Max(0, (counts?.Available ?? 0) - reserved)
                };
            }).ToList();

            return Ok(result);
        }

        // POST: api/public/reservations
        [HttpPost]
        public async Task<ActionResult<PublicReservationConfirmationDto>> CreateReservation(PublicReservationRequest request)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == request.VenueId && !v.IsDeleted && v.IsActive);

            if (venue == null)
            {
                return BadRequest("Venue not found");
            }

            var unit = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Include(zu => zu.VenueZone)
                .FirstOrDefaultAsync(zu => zu.Id == request.ZoneUnitId &&
                                           zu.VenueId == request.VenueId &&
                                           !zu.IsDeleted);

            if (unit == null)
            {
                return BadRequest("Unit not found");
            }

            if (unit.Status != "Available")
            {
                return BadRequest($"Unit is currently {unit.Status} and cannot be reserved");
            }

            // Check if unit is already reserved for the requested time
            var startTime = request.StartTime ?? DateTime.UtcNow;
            var existingBooking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .AnyAsync(b => b.ZoneUnitId == request.ZoneUnitId &&
                               !b.IsDeleted &&
                               (b.Status == "Active" || b.Status == "Reserved") &&
                               b.StartTime.Date == startTime.Date);

            if (existingBooking)
            {
                return BadRequest("Unit is already booked for this date");
            }

            var bookingCode = GenerateBookingCode();

            var booking = new ZoneUnitBooking
            {
                BookingCode = bookingCode,
                Status = "Reserved",
                GuestName = request.GuestName,
                GuestPhone = request.GuestPhone,
                GuestEmail = request.GuestEmail,
                GuestCount = request.GuestCount,
                StartTime = startTime,
                EndTime = request.EndTime,
                Notes = request.Notes,
                ZoneUnitId = request.ZoneUnitId,
                VenueId = request.VenueId,
                BusinessId = venue.BusinessId,
                CreatedAt = DateTime.UtcNow
            };

            // Update unit status
            unit.Status = "Reserved";

            _context.ZoneUnitBookings.Add(booking);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetReservationStatus), new { bookingCode }, new PublicReservationConfirmationDto
            {
                BookingCode = booking.BookingCode,
                Status = booking.Status,
                UnitCode = unit.UnitCode,
                UnitType = unit.UnitType,
                ZoneName = unit.VenueZone?.Name ?? "",
                VenueName = venue.Name,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                GuestName = booking.GuestName,
                GuestCount = booking.GuestCount,
                Message = $"Your reservation for {unit.UnitType} {unit.UnitCode} is confirmed. Please show your booking code ({bookingCode}) upon arrival."
            });
        }

        // GET: api/public/reservations/{bookingCode}
        [HttpGet("{bookingCode}")]
        public async Task<ActionResult<PublicReservationStatusDto>> GetReservationStatus(string bookingCode)
        {
            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Include(b => b.ZoneUnit)
                    .ThenInclude(zu => zu!.VenueZone)
                .Include(b => b.Venue)
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode && !b.IsDeleted);

            if (booking == null)
            {
                return NotFound("Reservation not found");
            }

            return Ok(new PublicReservationStatusDto
            {
                BookingCode = booking.BookingCode,
                Status = booking.Status,
                UnitCode = booking.ZoneUnit?.UnitCode ?? "",
                UnitType = booking.ZoneUnit?.UnitType ?? "",
                ZoneName = booking.ZoneUnit?.VenueZone?.Name ?? "",
                VenueName = booking.Venue?.Name ?? "",
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                CheckedInAt = booking.CheckedInAt,
                CheckedOutAt = booking.CheckedOutAt,
                GuestName = booking.GuestName,
                GuestCount = booking.GuestCount
            });
        }

        // DELETE: api/public/reservations/{bookingCode}
        [HttpDelete("{bookingCode}")]
        public async Task<IActionResult> CancelReservation(string bookingCode)
        {
            var booking = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Include(b => b.ZoneUnit)
                .FirstOrDefaultAsync(b => b.BookingCode == bookingCode && !b.IsDeleted);

            if (booking == null)
            {
                return NotFound("Reservation not found");
            }

            if (booking.Status != "Reserved")
            {
                return BadRequest($"Cannot cancel a reservation with status '{booking.Status}'");
            }

            booking.Status = "Cancelled";

            // Update unit status if it was reserved
            if (booking.ZoneUnit != null && booking.ZoneUnit.Status == "Reserved")
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
