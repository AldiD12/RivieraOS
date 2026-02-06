using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/venues/{venueId}/[controller]")]
    [ApiController]
    [Authorize(Policy = "Caderman")]
    public class UnitsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public UnitsController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/venues/5/units
        [HttpGet]
        public async Task<ActionResult<List<BizZoneUnitListItemDto>>> GetUnits(
            int venueId,
            [FromQuery] int? zoneId = null,
            [FromQuery] string? status = null,
            [FromQuery] string? unitType = null)
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

            var query = _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .Where(zu => zu.VenueId == venueId);

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
                .Select(zu => new BizZoneUnitListItemDto
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
                    CurrentBooking = zu.Bookings
                        .OrderByDescending(b => b.StartTime)
                        .Select(b => new BizCurrentBookingDto
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

        // GET: api/business/venues/5/units/10
        [HttpGet("{id}")]
        public async Task<ActionResult<BizZoneUnitDetailDto>> GetUnit(int venueId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var unit = await _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Venue)
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound();
            }

            var currentBooking = unit.Bookings
                .OrderByDescending(b => b.StartTime)
                .FirstOrDefault();

            return Ok(new BizZoneUnitDetailDto
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
                CreatedAt = unit.CreatedAt,
                CurrentBooking = currentBooking != null ? new BizCurrentBookingDto
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

        // GET: api/business/venues/5/units/by-qr/{qrCode}
        [HttpGet("by-qr/{qrCode}")]
        public async Task<ActionResult<BizZoneUnitDetailDto>> GetUnitByQrCode(int venueId, string qrCode)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var unit = await _context.ZoneUnits
                .Include(zu => zu.VenueZone)
                .Include(zu => zu.Venue)
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .FirstOrDefaultAsync(zu => zu.QrCode == qrCode && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound("Unit not found with the given QR code");
            }

            var currentBooking = unit.Bookings
                .OrderByDescending(b => b.StartTime)
                .FirstOrDefault();

            return Ok(new BizZoneUnitDetailDto
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
                CreatedAt = unit.CreatedAt,
                CurrentBooking = currentBooking != null ? new BizCurrentBookingDto
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

        // POST: api/business/venues/5/units
        [HttpPost]
        [Authorize(Policy = "Manager")]
        public async Task<ActionResult<BizZoneUnitDetailDto>> CreateUnit(int venueId, BizCreateZoneUnitRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == venueId);
            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var zone = await _context.VenueZones.FirstOrDefaultAsync(z => z.Id == request.VenueZoneId && z.VenueId == venueId);
            if (zone == null)
            {
                return BadRequest("Zone not found in this venue");
            }

            // Check for duplicate unit code in this zone
            var existingUnit = await _context.ZoneUnits
                .AnyAsync(zu => zu.UnitCode == request.UnitCode && zu.VenueZoneId == request.VenueZoneId);
            if (existingUnit)
            {
                return BadRequest($"Unit code '{request.UnitCode}' already exists in this zone");
            }

            // Generate unique QR code
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
                BusinessId = businessId.Value
            };

            _context.ZoneUnits.Add(unit);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUnit), new { venueId, id = unit.Id }, new BizZoneUnitDetailDto
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
                CreatedAt = unit.CreatedAt
            });
        }

        // POST: api/business/venues/5/units/bulk
        [HttpPost("bulk")]
        [Authorize(Policy = "Manager")]
        public async Task<ActionResult<BizBulkCreateUnitsResponse>> BulkCreateUnits(int venueId, BizBulkCreateUnitsRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var venue = await _context.Venues.FirstOrDefaultAsync(v => v.Id == venueId);
            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var zone = await _context.VenueZones.FirstOrDefaultAsync(z => z.Id == request.VenueZoneId && z.VenueId == venueId);
            if (zone == null)
            {
                return BadRequest("Zone not found in this venue");
            }

            var units = new List<ZoneUnit>();
            var createdUnits = new List<BizZoneUnitListItemDto>();

            for (int i = 0; i < request.Count; i++)
            {
                var number = request.StartNumber + i;
                var unitCode = $"{request.Prefix}{number}";

                // Check for duplicate
                var exists = await _context.ZoneUnits
                    .AnyAsync(zu => zu.UnitCode == unitCode && zu.VenueZoneId == request.VenueZoneId);
                if (exists)
                {
                    continue; // Skip duplicates
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
                    BusinessId = businessId.Value
                };

                units.Add(unit);
            }

            if (units.Count > 0)
            {
                _context.ZoneUnits.AddRange(units);
                await _context.SaveChangesAsync();

                createdUnits = units.Select(u => new BizZoneUnitListItemDto
                {
                    Id = u.Id,
                    UnitCode = u.UnitCode,
                    UnitType = u.UnitType,
                    Status = u.Status,
                    BasePrice = u.BasePrice,
                    QrCode = u.QrCode,
                    VenueZoneId = u.VenueZoneId,
                    ZoneName = zone.Name
                }).ToList();
            }

            return Ok(new BizBulkCreateUnitsResponse
            {
                CreatedCount = units.Count,
                Units = createdUnits
            });
        }

        // PUT: api/business/venues/5/units/10
        [HttpPut("{id}")]
        [Authorize(Policy = "Manager")]
        public async Task<IActionResult> UpdateUnit(int venueId, int id, BizUpdateZoneUnitRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var unit = await _context.ZoneUnits
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound();
            }

            if (request.UnitCode != null)
            {
                // Check for duplicate unit code in this zone
                var existingUnit = await _context.ZoneUnits
                    .AnyAsync(zu => zu.UnitCode == request.UnitCode && zu.VenueZoneId == unit.VenueZoneId && zu.Id != id);
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

        // PUT: api/business/venues/5/units/10/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateUnitStatus(int venueId, int id, BizUpdateUnitStatusRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var unit = await _context.ZoneUnits
                .Include(zu => zu.Bookings.Where(b => !b.IsDeleted && (b.Status == "Active" || b.Status == "Reserved")))
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound();
            }

            var previousStatus = unit.Status;
            unit.Status = request.Status;

            if (request.Notes != null)
            {
                unit.Notes = request.Notes;
            }

            // Handle booking status changes based on unit status change
            var activeBooking = unit.Bookings.FirstOrDefault(b => b.Status == "Active" || b.Status == "Reserved");

            if (request.Status == "Available" && activeBooking != null)
            {
                // Check out the guest
                activeBooking.Status = "Completed";
                activeBooking.CheckedOutAt = DateTime.UtcNow;
            }
            else if (request.Status == "Occupied" && activeBooking != null && activeBooking.Status == "Reserved")
            {
                // Check in the guest
                activeBooking.Status = "Active";
                activeBooking.CheckedInAt = DateTime.UtcNow;
                if (int.TryParse(_currentUserService.UserId, out var userId))
                {
                    activeBooking.HandledByUserId = userId;
                }
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/business/venues/5/units/10 (soft delete)
        [HttpDelete("{id}")]
        [Authorize(Policy = "Manager")]
        public async Task<IActionResult> DeleteUnit(int venueId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var unit = await _context.ZoneUnits
                .FirstOrDefaultAsync(zu => zu.Id == id && zu.VenueId == venueId);

            if (unit == null)
            {
                return NotFound();
            }

            unit.IsDeleted = true;
            unit.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/business/venues/5/units/stats
        [HttpGet("stats")]
        public async Task<ActionResult<BizBookingStatsDto>> GetStats(int venueId)
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

            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var units = await _context.ZoneUnits
                .Where(zu => zu.VenueId == venueId)
                .GroupBy(zu => zu.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var bookingsToday = await _context.ZoneUnitBookings
                .Where(b => b.VenueId == venueId && b.StartTime >= today && b.StartTime < tomorrow)
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new BizBookingStatsDto
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

        private static string GenerateQrCode(int venueId, int zoneId, string unitCode)
        {
            var timestamp = DateTime.UtcNow.Ticks.ToString("X");
            return $"BB-V{venueId}-Z{zoneId}-{unitCode}-{timestamp[^8..]}";
        }
    }
}
