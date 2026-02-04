using System.Security.Cryptography;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/businesses/{businessId}/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class UsersController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public UsersController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/businesses/5/users
        [HttpGet]
        public async Task<ActionResult<List<UserListItemDto>>> GetUsers(int businessId)
        {
            var businessExists = await _context.Businesses.AnyAsync(b => b.Id == businessId);
            if (!businessExists)
            {
                return NotFound("Business not found");
            }

            var users = await _context.Users
                .IgnoreQueryFilters() // Bypass multi-tenancy filter
                .Where(u => u.BusinessId == businessId)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Business)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    Role = u.UserRoles.FirstOrDefault() != null ? u.UserRoles.FirstOrDefault()!.Role!.RoleName : null,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    BusinessId = u.BusinessId,
                    BusinessName = u.Business != null ? u.Business.BrandName ?? u.Business.RegisteredName : null
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/superadmin/businesses/5/users/10
        [HttpGet("{id}")]
        public async Task<ActionResult<UserDetailDto>> GetUser(int businessId, int id)
        {
            var user = await _context.Users
                .IgnoreQueryFilters()
                .Where(u => u.Id == id && u.BusinessId == businessId)
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Business)
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                UserType = user.UserType,
                Role = user.UserRoles.FirstOrDefault()?.Role?.RoleName,
                IsActive = user.IsActive,
                HasPinSet = !string.IsNullOrEmpty(user.PinHash),
                CreatedAt = user.CreatedAt,
                BusinessId = user.BusinessId,
                BusinessName = user.Business?.BrandName ?? user.Business?.RegisteredName
            });
        }

        // POST: api/superadmin/businesses/5/users
        [HttpPost]
        public async Task<ActionResult<UserDetailDto>> CreateUser(int businessId, CreateUserRequest request)
        {
            // Verify business exists
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
            {
                return NotFound("Business not found");
            }

            // Check if email already exists
            var emailExists = await _context.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == request.Email);
            if (emailExists)
            {
                return BadRequest("Email already exists");
            }

            // Get the role
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == request.Role);
            if (role == null)
            {
                return BadRequest($"Role '{request.Role}' not found");
            }

            // Prevent creating SuperAdmin through this endpoint
            if (request.Role == "SuperAdmin")
            {
                return BadRequest("Cannot create SuperAdmin through this endpoint");
            }

            // Create user
            var user = new User
            {
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                PinHash = !string.IsNullOrEmpty(request.Pin) ? HashPin(request.Pin) : null,
                BusinessId = businessId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assign role
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { businessId, id = user.Id }, new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = role.RoleName,
                IsActive = user.IsActive,
                HasPinSet = !string.IsNullOrEmpty(user.PinHash),
                CreatedAt = user.CreatedAt,
                BusinessId = user.BusinessId,
                BusinessName = business.BrandName ?? business.RegisteredName
            });
        }

        // PUT: api/superadmin/businesses/5/users/10
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int businessId, int id, UpdateUserRequest request)
        {
            var user = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId);

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

            // Get the new role
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == request.Role);
            if (role == null)
            {
                return BadRequest($"Role '{request.Role}' not found");
            }

            // Prevent assigning SuperAdmin role
            if (request.Role == "SuperAdmin")
            {
                return BadRequest("Cannot assign SuperAdmin role through this endpoint");
            }

            // Update user
            user.Email = request.Email;
            user.FullName = request.FullName;
            user.PhoneNumber = request.PhoneNumber;
            user.IsActive = request.IsActive;

            // Update PIN if provided
            if (!string.IsNullOrEmpty(request.Pin))
            {
                user.PinHash = HashPin(request.Pin);
            }

            // Update role (remove old, add new)
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

        // POST: api/superadmin/businesses/5/users/10/reset-password
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(int businessId, int id, ResetPasswordRequest request)
        {
            var user = await _context.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId);

            if (user == null)
            {
                return NotFound();
            }

            user.PasswordHash = HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/superadmin/businesses/5/users/10 (deactivate)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeactivateUser(int businessId, int id)
        {
            var user = await _context.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId);

            if (user == null)
            {
                return NotFound();
            }

            // Deactivate (soft delete for users)
            user.IsActive = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/businesses/5/users/10/activate
        [HttpPost("{id}/activate")]
        public async Task<IActionResult> ActivateUser(int businessId, int id)
        {
            var user = await _context.Users
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(u => u.Id == id && u.BusinessId == businessId);

            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = true;
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

    // Separate controller for SuperAdmin user management (users without business)
    [Route("api/superadmin/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public AdminUsersController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/adminusers - Get all SuperAdmin users
        [HttpGet]
        public async Task<ActionResult<List<UserListItemDto>>> GetSuperAdmins()
        {
            var superAdminRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "SuperAdmin");
            if (superAdminRole == null)
            {
                return Ok(new List<UserListItemDto>());
            }

            var users = await _context.Users
                .IgnoreQueryFilters()
                .Where(u => u.UserRoles.Any(ur => ur.RoleId == superAdminRole.Id))
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new UserListItemDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    PhoneNumber = u.PhoneNumber,
                    Role = "SuperAdmin",
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    BusinessId = null,
                    BusinessName = null
                })
                .ToListAsync();

            return Ok(users);
        }

        // POST: api/superadmin/adminusers - Create new SuperAdmin
        [HttpPost]
        public async Task<ActionResult<UserDetailDto>> CreateSuperAdmin(CreateSuperAdminRequest request)
        {
            // Check if email already exists
            var emailExists = await _context.Users
                .IgnoreQueryFilters()
                .AnyAsync(u => u.Email == request.Email);
            if (emailExists)
            {
                return BadRequest("Email already exists");
            }

            // Get SuperAdmin role
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "SuperAdmin");
            if (role == null)
            {
                return BadRequest("SuperAdmin role not found");
            }

            // Create user
            var user = new User
            {
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                BusinessId = null, // SuperAdmin has no business
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assign SuperAdmin role
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = role.Id
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSuperAdmins), new UserDetailDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = "SuperAdmin",
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                BusinessId = null,
                BusinessName = null
            });
        }

        private static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);
            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }
    }
}
