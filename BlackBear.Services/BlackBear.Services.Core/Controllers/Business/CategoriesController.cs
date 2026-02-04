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
    [Authorize(Policy = "Manager")]
    public class CategoriesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public CategoriesController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/categories
        [HttpGet]
        public async Task<ActionResult<List<BizCategoryListItemDto>>> GetCategories()
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var categories = await _context.Categories
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .Select(c => new BizCategoryListItemDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    SortOrder = c.SortOrder,
                    IsActive = c.IsActive,
                    ProductCount = c.Products.Count
                })
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/business/categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BizCategoryDetailDto>> GetCategory(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = await _context.Categories
                .Include(c => c.Products)
                .Include(c => c.VenueExclusions)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(new BizCategoryDetailDto
            {
                Id = category.Id,
                Name = category.Name,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                Products = category.Products.Select(p => new BizProductListItemDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    Price = p.Price,
                    OldPrice = p.OldPrice,
                    IsAvailable = p.IsAvailable,
                    IsAlcohol = p.IsAlcohol,
                    CategoryId = p.CategoryId,
                    CategoryName = category.Name
                }).ToList(),
                ExcludedVenueIds = category.VenueExclusions.Select(e => e.VenueId).ToList()
            });
        }

        // POST: api/business/categories
        [HttpPost]
        public async Task<ActionResult<BizCategoryDetailDto>> CreateCategory(BizCreateCategoryRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = new Category
            {
                Name = request.Name,
                SortOrder = request.SortOrder,
                IsActive = request.IsActive,
                BusinessId = businessId.Value
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, new BizCategoryDetailDto
            {
                Id = category.Id,
                Name = category.Name,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                Products = new List<BizProductListItemDto>(),
                ExcludedVenueIds = new List<int>()
            });
        }

        // PUT: api/business/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, BizUpdateCategoryRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound();
            }

            category.Name = request.Name;
            category.SortOrder = request.SortOrder;
            category.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/business/categories/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound();
            }

            category.IsDeleted = true;
            category.DeletedAt = DateTime.UtcNow;
            category.IsActive = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/business/categories/5/exclusions
        [HttpPost("{id}/exclusions")]
        public async Task<IActionResult> SetVenueExclusions(int id, [FromBody] List<int> venueIds)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = await _context.Categories
                .Include(c => c.VenueExclusions)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            // Verify all venues belong to this business
            var validVenueIds = await _context.Venues
                .Where(v => venueIds.Contains(v.Id))
                .Select(v => v.Id)
                .ToListAsync();

            // Remove existing exclusions
            _context.CategoryVenueExclusions.RemoveRange(category.VenueExclusions);

            // Add new exclusions
            foreach (var venueId in validVenueIds)
            {
                _context.CategoryVenueExclusions.Add(new CategoryVenueExclusion
                {
                    CategoryId = id,
                    VenueId = venueId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { ExcludedVenueIds = validVenueIds });
        }

        // GET: api/business/categories/5/exclusions
        [HttpGet("{id}/exclusions")]
        public async Task<ActionResult<List<int>>> GetVenueExclusions(int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = await _context.Categories
                .Include(c => c.VenueExclusions)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            return Ok(category.VenueExclusions.Select(e => e.VenueId).ToList());
        }
    }
}
