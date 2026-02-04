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
    public class CategoriesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public CategoriesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/businesses/5/categories
        [HttpGet]
        public async Task<ActionResult<List<CategoryListItemDto>>> GetCategories(int businessId)
        {
            var businessExists = await _context.Businesses.AnyAsync(b => b.Id == businessId);
            if (!businessExists)
            {
                return NotFound("Business not found");
            }

            var categories = await _context.Categories
                .Where(c => c.BusinessId == businessId)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .Select(c => new CategoryListItemDto
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

        // GET: api/superadmin/businesses/5/categories/10
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDetailDto>> GetCategory(int businessId, int id)
        {
            var category = await _context.Categories
                .Include(c => c.Business)
                .Include(c => c.Products)
                .Include(c => c.VenueExclusions)
                .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(new CategoryDetailDto
            {
                Id = category.Id,
                Name = category.Name,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                BusinessId = category.BusinessId,
                BusinessName = category.Business?.BrandName ?? category.Business?.RegisteredName,
                Products = category.Products.Select(p => new ProductListItemDto
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

        // POST: api/superadmin/businesses/5/categories
        [HttpPost]
        public async Task<ActionResult<CategoryDetailDto>> CreateCategory(int businessId, CreateCategoryRequest request)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
            {
                return NotFound("Business not found");
            }

            var category = new Category
            {
                Name = request.Name,
                SortOrder = request.SortOrder,
                IsActive = request.IsActive,
                BusinessId = businessId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { businessId, id = category.Id }, new CategoryDetailDto
            {
                Id = category.Id,
                Name = category.Name,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                BusinessId = category.BusinessId,
                BusinessName = business.BrandName ?? business.RegisteredName,
                Products = new List<ProductListItemDto>(),
                ExcludedVenueIds = new List<int>()
            });
        }

        // PUT: api/superadmin/businesses/5/categories/10
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int businessId, int id, UpdateCategoryRequest request)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId);

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

        // DELETE: api/superadmin/businesses/5/categories/10 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int businessId, int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId);

            if (category == null)
            {
                return NotFound();
            }

            // Soft delete
            category.IsDeleted = true;
            category.DeletedAt = DateTime.UtcNow;
            category.IsActive = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/superadmin/businesses/5/categories/10/exclusions
        [HttpPost("{id}/exclusions")]
        public async Task<IActionResult> SetVenueExclusions(int businessId, int id, [FromBody] List<int> venueIds)
        {
            var category = await _context.Categories
                .Include(c => c.VenueExclusions)
                .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            // Verify all venues belong to this business
            var validVenueIds = await _context.Venues
                .Where(v => v.BusinessId == businessId && venueIds.Contains(v.Id))
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

        // GET: api/superadmin/businesses/5/categories/10/exclusions
        [HttpGet("{id}/exclusions")]
        public async Task<ActionResult<List<int>>> GetVenueExclusions(int businessId, int id)
        {
            var category = await _context.Categories
                .Include(c => c.VenueExclusions)
                .FirstOrDefaultAsync(c => c.Id == id && c.BusinessId == businessId);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            return Ok(category.VenueExclusions.Select(e => e.VenueId).ToList());
        }
    }
}
