using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/venues/{venueId}/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class UnitsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public UnitsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/venues/5/units
        [HttpGet]
        public async Task<ActionResult<List<ZoneUnitListItemDto>>> GetUnits(
            int venueId,
            [FromQuery] int? zoneId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? unitType = null)
        {
            var venueExists = await _context.Venues
                .IgnoreQueryFilters()
                .AnyAsync(v => v.Id == venueId && !v.IsDeleted);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var query = _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .IgnoreQueryFilters()
                .Where(zu => !zu.IsDeleted && zu.VenueId == venueId);

            if (zoneId.HasValue)
            {
                query = query.Where(zu => zu.VenueZoneId == zoneId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(zu => zu.Status == status);
            }

            if (!string.IsNullOrEmpty(unitType))
            {
                query = query.Where(zu => zu.UnitType == unitType);
            }

            var units = await query
                .OrderBy(zu => zu.VenueZone!.Name)
                .ThenBy(zu => zu.UnitCode)
                .Select(zu => new ZoneUnitListItemDto
                {
                    Id = zu.Id,
                    UnitCode = zu.UnitCode,
                    UnitType = zu.UnitType,
                    Status = zu.Status,
                    BasePrice = zu.BasePrice,
                    PositionX = zu.PositionX,
                    PositionY = zu.PositionY,
                    QrCode = zu.QrCode,
                    VenueZoneId = zu.VenueZoneId,
                    ZoneName = zu.VenueZone!.Name,
                    VenueId = zu.VenueId,
                    VenueName = zu.Venue != null ? zu.Venue.Name : "",
                    BusinessId = zu.BusinessId,
                    BusinessName = zu.Venue != null && zu.Venue.Business != null
                        ? zu.Venue.Business.BrandName ?? zu.Venue.Business.RegisteredName
                        : null,
                    CurrentBooking = zu.Bookings
                        .Where(b => !b.IsDeleted)
                        .OrderByDescending(b => b.StartTime)
                        .Select(b => new CurrentBookingDto
                        {
                            Id = b.Id,
                            BookingCode = b.BookingCode,
                            Status = b.Status,
                            GuestName = b.GuestName,
                            GuestCount = b.GuestCount,
                            StartTime = b.StartTime,
                            CheckedInAt = b.CheckedInAt
                        })
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(units);
        }

        // GET: api/superadmin/venues/5/units/10
        [HttpGet("{id}")]
        public async Task<ActionResult<ZoneUnitDetailDto>> GetUnit(int venueId, int id)
        {
            var unit = await _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .IgnoreQueryFilters()
                .Where(zu => !zu.IsDeleted)
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound();
            }

            var currentBooking = unit.Bookings
                .OrderByDescending(b => b.StartTime)
                .FirstOrDefault();

            return Ok(new ZoneUnitDetailDto
            {
                Id = unit.Id,
                UnitCode = unit.UnitCode,
                UnitType = unit.UnitType,
                Status = unit.Status,
                BasePrice = unit.BasePrice,
                PositionX = unit.PositionX,
                PositionY = unit.PositionY,
                QrCode = unit.QrCode,
                Notes = unit.Notes,
                VenueZoneId = unit.VenueZoneId,
                ZoneName = unit.VenueZone?.Name ?? "",
                VenueId = unit.VenueId,
                VenueName = unit.Venue?.Name ?? "",
                BusinessId = unit.BusinessId,
                BusinessName = unit.Venue?.Business?.BrandName ?? unit.Venue?.Business?.RegisteredName,
                CreatedAt = unit.CreatedAt,
                CurrentBooking = currentBooking != null ? new CurrentBookingDto
                {
                    Id = currentBooking.Id,
                    BookingCode = currentBooking.BookingCode,
                    Status = currentBooking.Status,
                    GuestName = currentBooking.GuestName,
                    GuestCount = currentBooking.GuestCount,
                    StartTime = currentBooking.StartTime,
                    CheckedInAt = currentBooking.CheckedInAt
                } : null
            });
        }

        // GET: api/superadmin/venues/5/units/by-qr/{qrCode}
        [HttpGet("by-qr/{qrCode}")]
        public async Task<ActionResult<ZoneUnitDetailDto>> GetUnitByQrCode(int venueId, string qrCode)
        {
            var unit = await _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Venue)
                    .ThenInclude(v => v!.Business)
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .IgnoreQueryFilters()
                .Where(zu => !zu.IsDeleted)
                .FirstOrDefaultAsync(zu => zu.QrCode == qrCode && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound("Unit not found with the given QR code");
            }

            var currentBooking = unit.Bookings
                .OrderByDescending(b => b.StartTime)
                .FirstOrDefault();

            return Ok(new ZoneUnitDetailDto
            {
                Id = unit.Id,
                UnitCode = unit.UnitCode,
                UnitType = unit.UnitType,
                Status = unit.Status,
                BasePrice = unit.BasePrice,
                PositionX = unit.PositionX,
                PositionY = unit.PositionY,
                QrCode = unit.QrCode,
                Notes = unit.Notes,
                VenueZoneId = unit.VenueZoneId,
                ZoneName = unit.VenueZone?.Name ?? "",
                VenueId = unit.VenueId,
                VenueName = unit.Venue?.Name ?? "",
                BusinessId = unit.BusinessId,
                BusinessName = unit.Venue?.Business?.BrandName ?? unit.Venue?.Business?.RegisteredName,
                CreatedAt = unit.CreatedAt,
                CurrentBooking = currentBooking != null ? new CurrentBookingDto
                {
                    Id = currentBooking.Id,
                    BookingCode = currentBooking.BookingCode,
                    Status = currentBooking.Status,
                    GuestName = currentBooking.GuestName,
                    GuestCount = currentBooking.GuestCount,
                    StartTime = currentBooking.StartTime,
                    CheckedInAt = currentBooking.CheckedInAt
                } : null
            });
        }

        // GET: api/superadmin/venues/5/units/stats
        [HttpGet("stats")]
        public async Task<ActionResult<ZoneUnitStatsDto>> GetStats(int venueId)
        {
            var venueExists = await _context.Venues
                .IgnoreQueryFilters()
                .AnyAsync(v => v.Id == venueId && !v.IsDeleted);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var units = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .Where(zu => !zu.IsDeleted && zu.VenueId == venueId)
                .GroupBy(zu => zu.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var bookingsToday = await _context.ZoneUnitBookings
                .IgnoreQueryFilters()
                .Where(b => !b.IsDeleted && b.VenueId == venueId && b.StartTime >= today && b.StartTime < tomorrow)
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new ZoneUnitStatsDto
            {
                TotalUnits = units.Sum(u => u.Count),
                AvailableUnits = units.FirstOrDefault(u => u.Status == "Available")?.Count ?? 0,
                ReservedUnits = units.FirstOrDefault(u => u.Status == "Reserved")?.Count ?? 0,
                OccupiedUnits = units.FirstOrDefault(u => u.Status == "Occupied")?.Count ?? 0,
                MaintenanceUnits = units.FirstOrDefault(u => u.Status == "Maintenance")?.Count ?? 0,
                ActiveBookingsToday = bookingsToday.FirstOrDefault(b => b.Status == "Active")?.Count ?? 0,
                CompletedBookingsToday = bookingsToday.FirstOrDefault(b => b.Status == "Completed")?.Count ?? 0
            });
        }

        // POST: api/superadmin/venues/5/units
        [HttpPost]
        public async Task<ActionResult<ZoneUnitDetailDto>> CreateUnit(int venueId, CreateZoneUnitRequest request)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .Include(v => v.Business)
                .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted);
            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var zone = await _context.VenueZones
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(z => z.Id == request.VenueZoneId && z.VenueId == venueId && !z.IsDeleted);
            if (zone == null)
            {
                return BadRequest("Zone not found in this venue");
            }

            var existingUnit = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .AnyAsync(zu => !zu.IsDeleted && zu.UnitCode == request.UnitCode && zu.VenueZoneId == request.VenueZoneId);
            if (existingUnit)
            {
                return BadRequest($"Unit code '{request.UnitCode}' already exists in this zone");
            }

            var qrCode = GenerateQrCode(venueId, request.VenueZoneId, request.UnitCode);

            var unit = new ZoneUnit
            {
                UnitCode = request.UnitCode,
                UnitType = request.UnitType,
                Status = "Available",
                BasePrice = request.BasePrice,
                PositionX = request.PositionX,
                PositionY = request.PositionY,
                QrCode = qrCode,
                Notes = request.Notes,
                VenueZoneId = request.VenueZoneId,
                VenueId = venueId,
                BusinessId = venue.BusinessId
            };

            _context.ZoneUnits.Add(unit);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUnit), new { venueId, id = unit.Id }, new ZoneUnitDetailDto
            {
                Id = unit.Id,
                UnitCode = unit.UnitCode,
                UnitType = unit.UnitType,
                Status = unit.Status,
                BasePrice = unit.BasePrice,
                PositionX = unit.PositionX,
                PositionY = unit.PositionY,
                QrCode = unit.QrCode,
                Notes = unit.Notes,
                VenueZoneId = unit.VenueZoneId,
                ZoneName = zone.Name,
                VenueId = unit.VenueId,
                VenueName = venue.Name,
                BusinessId = unit.BusinessId,
                BusinessName = venue.Business?.BrandName ?? venue.Business?.RegisteredName,
                CreatedAt = unit.CreatedAt
            });
        }

        // POST: api/superadmin/venues/5/units/bulk
        [HttpPost("bulk")]
        public async Task<ActionResult<BulkCreateUnitsResponse>> BulkCreateUnits(int venueId, BulkCreateUnitsRequest request)
        {
            var venue = await _context.Venues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(v => v.Id == venueId && !v.IsDeleted);
            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var zone = await _context.VenueZones
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(z => z.Id == request.VenueZoneId && z.VenueId == venueId && !z.IsDeleted);
            if (zone == null)
            {
                return BadRequest("Zone not found in this venue");
            }

            var units = new List<ZoneUnit>();
            var createdUnits = new List<ZoneUnitListItemDto>();

            for (int i = 0; i < request.Count; i++)
            {
                var number = request.StartNumber + i;
                var unitCode = $"{request.Prefix}{number}";

                var exists = await _context.ZoneUnits
                    .IgnoreQueryFilters()
                    .AnyAsync(zu => !zu.IsDeleted && zu.UnitCode == unitCode && zu.VenueZoneId == request.VenueZoneId);
                if (exists)
                {
                    continue;
                }

                var qrCode = GenerateQrCode(venueId, request.VenueZoneId, unitCode);

                var unit = new ZoneUnit
                {
                    UnitCode = unitCode,
                    UnitType = request.UnitType,
                    Status = "Available",
                    BasePrice = request.BasePrice,
                    QrCode = qrCode,
                    VenueZoneId = request.VenueZoneId,
                    VenueId = venueId,
                    BusinessId = venue.BusinessId
                };

                units.Add(unit);
            }

            if (units.Count > 0)
            {
                _context.ZoneUnits.AddRange(units);
                await _context.SaveChangesAsync();

                createdUnits = units.Select(u => new ZoneUnitListItemDto
                {
                    Id = u.Id,
                    UnitCode = u.UnitCode,
                    UnitType = u.UnitType,
                    Status = u.Status,
                    BasePrice = u.BasePrice,
                    QrCode = u.QrCode,
                    VenueZoneId = u.VenueZoneId,
                    ZoneName = zone.Name,
                    VenueId = u.VenueId,
                    VenueName = venue.Name,
                    BusinessId = u.BusinessId
                }).ToList();
            }

            return Ok(new BulkCreateUnitsResponse
            {
                CreatedCount = units.Count,
                Units = createdUnits
            });
        }

        // PUT: api/superadmin/venues/5/units/10
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUnit(int venueId, int id, UpdateZoneUnitRequest request)
        {
            var unit = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId && !zu.IsDeleted);

            if (unit == null)
            {
                return NotFound();
            }

            if (request.UnitCode != null)
            {
                var existingUnit = await _context.ZoneUnits
                    .IgnoreQueryFilters()
                    .AnyAsync(zu => !zu.IsDeleted && zu.UnitCode == request.UnitCode && zu.VenueZoneId == unit.VenueZoneId && zu.Id != id);
                if (existingUnit)
                {
                    return BadRequest($"Unit code '{request.UnitCode}' already exists in this zone");
                }
                unit.UnitCode = request.UnitCode;
            }

            if (request.UnitType != null)
            {
                unit.UnitType = request.UnitType;
            }

            if (request.BasePrice.HasValue)
            {
                unit.BasePrice = request.BasePrice;
            }

            if (request.PositionX.HasValue)
            {
                unit.PositionX = request.PositionX;
            }

            if (request.PositionY.HasValue)
            {
                unit.PositionY = request.PositionY;
            }

            if (request.Notes != null)
            {
                unit.Notes = request.Notes;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/superadmin/venues/5/units/10/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateUnitStatus(int venueId, int id, UpdateUnitStatusRequest request)
        {
            var unit = await _context.ZoneUnits
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId && !zu.IsDeleted);

            if (unit == null)
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
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/superadmin/venues/5/units/10 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUnit(int venueId, int id)
        {
            var unit = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId && !zu.IsDeleted);

            if (unit == null)
            {
                return NotFound();
            }

            unit.IsDeleted = true;
            unit.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/venues/5/units/10/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreUnit(int venueId, int id)
        {
            var unit = await _context.ZoneUnits
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId && zu.IsDeleted);

            if (unit == null)
            {
                return NotFound();
            }

            unit.IsDeleted = false;
            unit.DeletedAt = null;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string GenerateQrCode(int venueId, int zoneId, string unitCode)
        {
            var timestamp = DateTime.UtcNow.Ticks.ToString("X");
            return $"BB-V{venueId}-Z{zoneId}-{unitCode}-{timestamp[^8..]}";
        }
    }
}
