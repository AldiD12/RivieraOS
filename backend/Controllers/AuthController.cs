using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RivieraApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        string role = string.Empty;

        // Validate credentials
        if (request.Type == "waiter")
        {
            var waiterPin = _configuration["Auth:WaiterPin"] ?? "1111";
            if (request.Value != waiterPin)
            {
                return Unauthorized(new { message = "Invalid PIN" });
            }
            role = "Waiter";
        }
        else if (request.Type == "admin")
        {
            var adminPassword = _configuration["Auth:AdminPassword"] ?? "admin123";
            if (request.Value != adminPassword)
            {
                return Unauthorized(new { message = "Invalid password" });
            }
            role = "Admin";
        }
        else
        {
            return BadRequest(new { message = "Invalid login type" });
        }

        // Generate JWT token
        var token = GenerateJwtToken(role);

        return Ok(new
        {
            token,
            role,
            message = "Login successful"
        });
    }

    private string GenerateJwtToken(string role)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "YourSuperSecretKeyForRiviera2024!";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "RivieraApi";
        var expiryHours = int.Parse(_configuration["Jwt:ExpiryHours"] ?? "12");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Type { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
}
