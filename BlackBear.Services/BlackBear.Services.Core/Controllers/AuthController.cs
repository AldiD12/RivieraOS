using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BlackBear.Services.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableRateLimiting("auth")]
    public class AuthController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(BlackBearDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            // Check if user already exists (ignore filters to check all users)
            if (await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == request.Email))
            {
                return BadRequest("User with this email already exists.");
            }

            // Get the Guest role (default for new registrations)
            var guestRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Guest");
            if (guestRole == null)
            {
                return StatusCode(500, "Default role not configured.");
            }

            // Create new user
            var user = new User
            {
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Assign Guest role to new user
            var userRole = new UserRole
            {
                UserId = user.Id,
                RoleId = guestRole.Id
            };
            _context.UserRoles.Add(userRole);
            await _context.SaveChangesAsync();

            // Generate token and return
            var token = GenerateJwtToken(user, guestRole.RoleName);

            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = guestRole.RoleName,
                BusinessId = user.BusinessId
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            // Find user by email, including their roles
            // IgnoreQueryFilters bypasses multi-tenancy to allow any user (including SuperAdmin) to login
            var user = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Venue)
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            // Check if account is locked out
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                return Unauthorized("Account is temporarily locked. Please try again later.");
            }

            // Verify password
            if (!VerifyPassword(request.Password, user.PasswordHash))
            {
                // Track failed attempt
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                }
                await _context.SaveChangesAsync();
                return Unauthorized("Invalid email or password.");
            }

            // Reset failed attempts on successful login
            if (user.FailedLoginAttempts > 0)
            {
                user.FailedLoginAttempts = 0;
                user.LockoutEnd = null;
                await _context.SaveChangesAsync();
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return Unauthorized("User account is deactivated.");
            }

            // Get user's role
            var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName;

            // Block floor staff from using email/password login
            if (roleName == "Staff" || roleName == "Bartender" || roleName == "Collector")
            {
                return Unauthorized("Floor staff must login using Phone Number and PIN.");
            }

            // Generate JWT token
            var token = GenerateJwtToken(user, roleName);

            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = roleName,
                BusinessId = user.BusinessId,
                VenueId = user.VenueId,
                VenueName = user.Venue?.Name
            });
        }

        // POST: api/auth/login/pin
        [HttpPost("login/pin")]
        public async Task<IActionResult> LoginWithPin(PinLoginRequest request)
        {
            // Normalize phone number (remove spaces, dashes, etc.)
            var normalizedPhone = NormalizePhoneNumber(request.PhoneNumber);

            // Find user by phone number
            var user = await _context.Users
                .IgnoreQueryFilters()
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Venue)
                .FirstOrDefaultAsync(u => u.PhoneNumber != null &&
                    u.PhoneNumber.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "") == normalizedPhone);

            if (user == null)
            {
                return Unauthorized("Invalid phone number or PIN.");
            }

            // Check if account is locked out
            if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
            {
                return Unauthorized("Account is temporarily locked. Please try again later.");
            }

            // Check if user has a PIN set
            if (string.IsNullOrEmpty(user.PinHash))
            {
                return Unauthorized("PIN login not enabled for this account.");
            }

            // Verify PIN
            if (!VerifyPin(request.Pin, user.PinHash))
            {
                user.FailedLoginAttempts++;
                if (user.FailedLoginAttempts >= 5)
                {
                    user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                }
                await _context.SaveChangesAsync();
                return Unauthorized("Invalid phone number or PIN.");
            }

            // Reset failed attempts on successful login
            if (user.FailedLoginAttempts > 0)
            {
                user.FailedLoginAttempts = 0;
                user.LockoutEnd = null;
                await _context.SaveChangesAsync();
            }

            // Check if user is active
            if (!user.IsActive)
            {
                return Unauthorized("User account is deactivated.");
            }

            // Check if user belongs to a business (staff requirement)
            if (!user.BusinessId.HasValue)
            {
                return Unauthorized("PIN login is only available for staff members.");
            }

            // Get user's role and verify it's a floor staff role (Staff, Bartender, or Collector)
            var roleName = user.UserRoles.FirstOrDefault()?.Role?.RoleName;
            if (roleName != "Staff" && roleName != "Bartender" && roleName != "Collector")
            {
                return Unauthorized("PIN login is only available for floor staff. Managers must use email login.");
            }

            // Generate JWT token
            var token = GenerateJwtToken(user, roleName);

            return Ok(new LoginResponse
            {
                Token = token,
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = roleName,
                BusinessId = user.BusinessId,
                VenueId = user.VenueId,
                VenueName = user.Venue?.Name
            });
        }

        private string GenerateJwtToken(User user, string? roleName)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expireMinutes = int.Parse(_configuration["Jwt:ExpireMinutes"]!);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email)
            };

            // Add BusinessId claim if user belongs to a business
            if (user.BusinessId.HasValue)
            {
                claims.Add(new Claim("businessId", user.BusinessId.Value.ToString()));
            }

            // Add Role claim if user has a role
            if (!string.IsNullOrEmpty(roleName))
            {
                claims.Add(new Claim(ClaimTypes.Role, roleName));
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);
            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }

        private static bool VerifyPassword(string password, string storedHash)
        {
            var parts = storedHash.Split(':');
            if (parts.Length != 2) return false;

            var salt = Convert.FromBase64String(parts[0]);
            var hash = Convert.FromBase64String(parts[1]);

            var computedHash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(computedHash, hash);
        }

        public static string HashPin(string pin)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            var hash = Rfc2898DeriveBytes.Pbkdf2(pin, salt, 100000, HashAlgorithmName.SHA256, 32);
            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }

        private static bool VerifyPin(string pin, string storedHash)
        {
            var parts = storedHash.Split(':');
            if (parts.Length != 2) return false;

            var salt = Convert.FromBase64String(parts[0]);
            var hash = Convert.FromBase64String(parts[1]);

            var computedHash = Rfc2898DeriveBytes.Pbkdf2(pin, salt, 100000, HashAlgorithmName.SHA256, 32);
            return CryptographicOperations.FixedTimeEquals(computedHash, hash);
        }

        private static string NormalizePhoneNumber(string phone)
        {
            return phone.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "").Replace("+", "");
        }
    }
}
