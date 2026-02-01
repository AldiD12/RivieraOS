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
    public class CategoriesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public CategoriesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/venues/10/categories
        [HttpGet]
        public async Task<ActionResult<List<CategoryListItemDto>>> GetCategories(int venueId)
        {
            var venueExists = await _context.Venues.AnyAsync(v => v.Id == venueId);
            if (!venueExists)
            {
                return NotFound("Venue not found");
            }

            var categories = await _context.Categories
                .Where(c => c.VenueId == venueId)
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

        // GET: api/superadmin/venues/10/categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDetailDto>> GetCategory(int venueId, int id)
        {
            var category = await _context.Categories
                .Include(c => c.Venue)
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == id && c.VenueId == venueId);

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
                VenueId = category.VenueId,
                VenueName = category.Venue?.Name,
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
                }).ToList()
            });
        }

        // POST: api/superadmin/venues/10/categories
        [HttpPost]
        public async Task<ActionResult<CategoryDetailDto>> CreateCategory(int venueId, CreateCategoryRequest request)
        {
            var venue = await _context.Venues.FindAsync(venueId);
            if (venue == null)
            {
                return NotFound("Venue not found");
            }

            var category = new Category
            {
                Name = request.Name,
                SortOrder = request.SortOrder,
                IsActive = request.IsActive,
                VenueId = venueId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { venueId, id = category.Id }, new CategoryDetailDto
            {
                Id = category.Id,
                Name = category.Name,
                SortOrder = category.SortOrder,
                IsActive = category.IsActive,
                VenueId = category.VenueId,
                VenueName = venue.Name,
                Products = new List<ProductListItemDto>()
            });
        }

        // PUT: api/superadmin/venues/10/categories/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int venueId, int id, UpdateCategoryRequest request)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.VenueId == venueId);

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

        // DELETE: api/superadmin/venues/10/categories/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int venueId, int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id && c.VenueId == venueId);

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
    }
}
