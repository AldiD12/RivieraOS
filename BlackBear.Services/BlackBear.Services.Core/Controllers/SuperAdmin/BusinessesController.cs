using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class BusinessesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public BusinessesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/businesses?page=1&pageSize=20&search=term
        [HttpGet]
        public async Task<ActionResult<PaginatedResponse<BusinessListItemDto>>> GetBusinesses(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null)
        {
            var query = _context.Businesses.AsQueryable();

            // Apply search filter
            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(b =>
                    b.RegisteredName.ToLower().Contains(search) ||
                    (b.BrandName != null && b.BrandName.ToLower().Contains(search)) ||
                    (b.ContactEmail != null && b.ContactEmail.ToLower().Contains(search)));
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Get paginated results
            var businesses = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BusinessListItemDto
                {
                    Id = b.Id,
                    RegisteredName = b.RegisteredName,
                    BrandName = b.BrandName,
                    ContactEmail = b.ContactEmail,
                    SubscriptionStatus = b.SubscriptionStatus,
                    IsActive = b.IsActive,
                    CreatedAt = b.CreatedAt,
                    VenueCount = b.Venues.Count,
                    UserCount = b.Users.Count
                })
                .ToListAsync();

            return Ok(new PaginatedResponse<BusinessListItemDto>
            {
                Items = businesses,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            });
        }

        // GET: api/superadmin/businesses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BusinessDetailDto>> GetBusiness(int id)
        {
            var business = await _context.Businesses
                .Include(b => b.Venues)
                .Include(b => b.Users)
                    .ThenInclude(u => u.UserRoles)
                        .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (business == null)
            {
                return NotFound();
            }

            var dto = new BusinessDetailDto
            {
                Id = business.Id,
                RegisteredName = business.RegisteredName,
                BrandName = business.BrandName,
                TaxId = business.TaxId,
                ContactEmail = business.ContactEmail,
                LogoUrl = business.LogoUrl,
                SubscriptionStatus = business.SubscriptionStatus,
                IsActive = business.IsActive,
                CreatedAt = business.CreatedAt,
                Venues = business.Venues.Select(v => new VenueSummaryDto
                {
                    Id = v.Id,
                    Name = v.Name,
                    Type = v.Type,
                    Address = v.Address,
                    CreatedAt = v.CreatedAt
                }).ToList(),
                Users = business.Users.Select(u => new UserSummaryDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FullName = u.FullName,
                    Role = u.UserRoles.FirstOrDefault()?.Role?.RoleName,
                    IsActive = u.IsActive
                }).ToList()
            };

            return Ok(dto);
        }

        // POST: api/superadmin/businesses
        [HttpPost]
        public async Task<ActionResult<BusinessDetailDto>> CreateBusiness(CreateBusinessRequest request)
        {
            var business = new Business
            {
                RegisteredName = request.RegisteredName,
                BrandName = request.BrandName,
                TaxId = request.TaxId,
                ContactEmail = request.ContactEmail,
                LogoUrl = request.LogoUrl,
                SubscriptionStatus = request.SubscriptionStatus,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBusiness), new { id = business.Id }, new BusinessDetailDto
            {
                Id = business.Id,
                RegisteredName = business.RegisteredName,
                BrandName = business.BrandName,
                TaxId = business.TaxId,
                ContactEmail = business.ContactEmail,
                LogoUrl = business.LogoUrl,
                SubscriptionStatus = business.SubscriptionStatus,
                IsActive = business.IsActive,
                CreatedAt = business.CreatedAt,
                Venues = new List<VenueSummaryDto>(),
                Users = new List<UserSummaryDto>()
            });
        }

        // PUT: api/superadmin/businesses/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBusiness(int id, UpdateBusinessRequest request)
        {
            var business = await _context.Businesses.FindAsync(id);

            if (business == null)
            {
                return NotFound();
            }

            business.RegisteredName = request.RegisteredName;
            business.BrandName = request.BrandName;
            business.TaxId = request.TaxId;
            business.ContactEmail = request.ContactEmail;
            business.LogoUrl = request.LogoUrl;
            business.SubscriptionStatus = request.SubscriptionStatus;
            business.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/superadmin/businesses/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBusiness(int id)
        {
            var business = await _context.Businesses.FindAsync(id);

            if (business == null)
            {
                return NotFound();
            }

            // Soft delete
            business.IsDeleted = true;
            business.DeletedAt = DateTime.UtcNow;
            business.IsActive = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/businesses/5/restore
        [HttpPost("{id}/restore")]
        public async Task<IActionResult> RestoreBusiness(int id)
        {
            // Need to bypass soft delete filter to find deleted business
            var business = await _context.Businesses
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.Id == id && b.IsDeleted);

            if (business == null)
            {
                return NotFound();
            }

            // Restore
            business.IsDeleted = false;
            business.DeletedAt = null;
            business.IsActive = true;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
