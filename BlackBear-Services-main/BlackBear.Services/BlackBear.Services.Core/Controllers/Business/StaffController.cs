using System.Security.Claims;
using System.Security.Cryptography;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/[controller]")]
    [ApiController]
    [Authorize(Roles = "BusinessOwner,Manager")]
    public class StaffController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public StaffController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/staff/me
        [HttpGet("me")]
        [Authorize(Roles = "BusinessOwner,Manager,Bartender,Collector")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var parsedUserId))
            {
                return Unauthorized();
            }

            var user = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Venue)
                .Include(u => u.Business)
                .FirstOrDefaultAsync(u => u.Id == parsedUserId);

            if (user == null)
            {
                return NotFound("Staff member not found");
            }

            return Ok(new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                role = user.UserRoles.FirstOrDefault()?.Role?.RoleName,
                businessId = user.BusinessId,
                businessName = user.Business?.BrandName ?? user.Business?.RegisteredName,
                venueId = user.VenueId,
                venueName = user.Venue?.Name,
                isActive = user.IsActive
            });
        }

        // GET: api/business/staff
        [HttpGet]
        public async Task<ActionResult<List<BizStaffListItemDto>>> GetStaff()
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var staff = await _context.Users
                .Where(u => u.BusinessId == businessId.Value)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Venue)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new BizStaffListItemDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.UserRoles.FirstOrDefault() != null ? u.UserRoles.FirstOrDefault()!.Role!.RoleName : null,
                    IsActive = u.IsActive,
                    HasPinSet = u.PinHash != null,
                    VenueId = u.VenueId,
                    VenueName = u.Venue != null ? u.Venue.Name : null,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(staff);
        }

        // GET: api/business/staff/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BizStaffDetailDto>> GetStaffMember(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var user = await _context.Users
                .Where(u => u.Id == id && u.BusinessId == businessId.Value)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Venue)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new BizStaffDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.UserRoles.FirstOrDefault()?.Role?.RoleName,
                IsActive = user.IsActive,
                HasPinSet = !string.IsNullOrEmpty(user.PinHash),
                VenueId = user.VenueId,
                VenueName = user.Venue?.Name,
                CreatedAt = user.CreatedAt
            });
        }

        // POST: api/business/staff
        [HttpPost]
        [Authorize(Roles = "BusinessOwner,Manager")]
        public async Task<ActionResult<BizStaffDetailDto>> CreateStaff(BizCreateStaffRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Check if email already exists
            var emailExists = await _context.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == request.Email);
            if (emailExists)
            {
                return BadRequest("Email already exists");
            }

            // Only allow Manager, Bartender, or Collector roles
            var allowedRoles = new[] { "Manager", "Bartender", "Collector" };
            if (!allowedRoles.Contains(request.Role))
            {
                return BadRequest("Can only create Manager, Bartender, or Collector users");
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == request.Role);
            if (role == null)
            {
                return BadRequest($"Role '{request.Role}' not found");
            }

            // Validate VenueId belongs to this business if provided
            string? venueName = null;
            if (request.VenueId.HasValue)
            {
                var venue = await _context.Venues
                    .FirstOrDefaultAsync(v => v.Id == request.VenueId.Value && v.BusinessId == businessId.Value);
                if (venue == null)
                {
                    return BadRequest("Venue not found or does not belong to this business");
                }
                venueName = venue.Name;
            }

            var user = new User
            {
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                PinHash = !string.IsNullOrEmpty(request.Pin) ? HashPin(request.Pin) : null,
                BusinessId = businessId.Value,
                VenueId = request.VenueId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetStaffMember), new { id = user.Id }, new BizStaffDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = role.RoleName,
                IsActive = user.IsActive,
                HasPinSet = !string.IsNullOrEmpty(user.PinHash),
                VenueId = user.VenueId,
                VenueName = venueName,
                CreatedAt = user.CreatedAt
            });
        }

        // PUT: api/business/staff/5
        [HttpPut("{id}")]
        [Authorize(Roles = "BusinessOwner,Manager")]
        public async Task<IActionResult> UpdateStaff(int id, BizUpdateStaffRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var user = await _context.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId.Value);

            if (user == null)
            {
                return NotFound();
            }

            // Check if email is taken by another user
            var emailExists = await _context.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == request.Email && u.Id != id);
            if (emailExists)
            {
                return BadRequest("Email already exists");
            }

            // Only allow Manager, Bartender, or Collector roles
            var allowedRoles = new[] { "Manager", "Bartender", "Collector" };
            if (!allowedRoles.Contains(request.Role))
            {
                return BadRequest("Can only assign Manager, Bartender, or Collector roles");
            }

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == request.Role);
            if (role == null)
            {
                return BadRequest($"Role '{request.Role}' not found");
            }

            // Validate VenueId belongs to this business if provided
            if (request.VenueId.HasValue)
            {
                var venueExists = await _context.Venues
                    .AnyAsync(v => v.Id == request.VenueId.Value && v.BusinessId == businessId.Value);
                if (!venueExists)
                {
                    return BadRequest("Venue not found or does not belong to this business");
                }
            }

            user.Email = request.Email;
            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;
            user.IsActive = request.IsActive;
            user.VenueId = request.VenueId;

            if (!string.IsNullOrEmpty(request.Pin))
            {
                user.PinHash = HashPin(request.Pin);
            }

            // Update role
            var existingRoles = user.UserRoles.ToList();
            _context.UserRoles.RemoveRange(existingRoles);

            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            };
            _context.UserRoles.Add(userRole);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/business/staff/5 (deactivate)
        [HttpDelete("{id}")]
        [Authorize(Roles = "BusinessOwner,Manager")]
        public async Task<IActionResult> DeactivateStaff(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            // Prevent self-deactivation
            if (int.TryParse(_currentUserService.UserId, out var currentUserId) && currentUserId == id)
            {
                return BadRequest("Cannot deactivate your own account");
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId.Value);

            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/business/staff/5/activate
        [HttpPost("{id}/activate")]
        [Authorize(Roles = "BusinessOwner,Manager")]
        public async Task<IActionResult> ActivateStaff(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId.Value);

            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/business/staff/5/reset-password
        [HttpPost("{id}/reset-password")]
        [Authorize(Roles = "BusinessOwner,Manager")]
        public async Task<IActionResult> ResetPassword(int id, BizResetStaffPasswordRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId.Value);

            if (user == null)
            {
                return NotFound();
            }

            user.PasswordHash = HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/business/staff/5/set-pin
        [HttpPost("{id}/set-pin")]
        [Authorize(Roles = "BusinessOwner,Manager")]
        public async Task<IActionResult> SetPin(int id, BizSetStaffPinRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId.Value);

            if (user == null)
            {
                return NotFound();
            }

            user.PinHash = HashPin(request.Pin);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/business/staff/5/pin
        [HttpDelete("{id}/pin")]
        [Authorize(Roles = "BusinessOwner,Manager")]
        public async Task<IActionResult> RemovePin(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return StatusCode(403, new { error = "User is not associated with a business" });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId.Value);

            if (user == null)
            {
                return NotFound();
            }

            user.PinHash = null;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);
            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }

        private static string HashPin(string pin)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(pin, salt, 100000, HashAlgorithmName.SHA256, 32);
            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }
    }
}
