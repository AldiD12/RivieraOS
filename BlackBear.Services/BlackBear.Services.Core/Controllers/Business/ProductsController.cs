using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Business;
using BlackBear.Services.Core.Entities;
using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Business
{
    [Route("api/business/categories/{categoryId}/[controller]")]
    [ApiController]
    [Authorize(Policy = "Manager")]
    public class ProductsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ProductsController(BlackBearDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        // GET: api/business/categories/5/products
        [HttpGet]
        public async Task<ActionResult<List<BizProductListItemDto>>> GetProducts(int categoryId)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            var products = category.Products
                .OrderBy(p => p.Name)
                .Select(p => new BizProductListItemDto
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
                })
                .ToList();

            return Ok(products);
        }

        // GET: api/business/categories/5/products/10
        [HttpGet("{id}")]
        public async Task<ActionResult<BizProductDetailDto>> GetProduct(int categoryId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.VenueExclusions)
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound();
            }

            return Ok(new BizProductDetailDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                OldPrice = product.OldPrice,
                IsAvailable = product.IsAvailable,
                IsAlcohol = product.IsAlcohol,
                CreatedAt = product.CreatedAt,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name,
                ExcludedVenueIds = product.VenueExclusions.Select(e => e.VenueId).ToList()
            });
        }

        // POST: api/business/categories/5/products
        [HttpPost]
        public async Task<ActionResult<BizProductDetailDto>> CreateProduct(int categoryId, BizCreateProductRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                ImageUrl = request.ImageUrl,
                Price = request.Price,
                OldPrice = request.OldPrice,
                IsAvailable = request.IsAvailable,
                IsAlcohol = request.IsAlcohol,
                CategoryId = categoryId,
                BusinessId = businessId.Value,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { categoryId, id = product.Id }, new BizProductDetailDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                OldPrice = product.OldPrice,
                IsAvailable = product.IsAvailable,
                IsAlcohol = product.IsAlcohol,
                CreatedAt = product.CreatedAt,
                CategoryId = product.CategoryId,
                CategoryName = category.Name,
                ExcludedVenueIds = new List<int>()
            });
        }

        // PUT: api/business/categories/5/products/10
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int categoryId, int id, BizUpdateProductRequest request)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound();
            }

            // If category is changing, verify new category exists and belongs to same business
            if (request.CategoryId != categoryId)
            {
                var newCategory = await _context.Categories.FirstOrDefaultAsync(c => c.Id == request.CategoryId);
                if (newCategory == null)
                {
                    return BadRequest("New category not found");
                }
                product.CategoryId = request.CategoryId;
            }

            product.Name = request.Name;
            product.Description = request.Description;
            product.ImageUrl = request.ImageUrl;
            product.Price = request.Price;
            product.OldPrice = request.OldPrice;
            product.IsAvailable = request.IsAvailable;
            product.IsAlcohol = request.IsAlcohol;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/business/categories/5/products/10 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int categoryId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound();
            }

            product.IsDeleted = true;
            product.DeletedAt = DateTime.UtcNow;
            product.IsAvailable = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/business/categories/5/products/10/exclusions
        [HttpPost("{id}/exclusions")]
        public async Task<IActionResult> SetVenueExclusions(int categoryId, int id, [FromBody] List<int> venueIds)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var product = await _context.Products
                .Include(p => p.VenueExclusions)
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound("Product not found");
            }

            // Verify all venues belong to this business
            var validVenueIds = await _context.Venues
                .Where(v => venueIds.Contains(v.Id))
                .Select(v => v.Id)
                .ToListAsync();

            // Remove existing exclusions
            _context.ProductVenueExclusions.RemoveRange(product.VenueExclusions);

            // Add new exclusions
            foreach (var venueId in validVenueIds)
            {
                _context.ProductVenueExclusions.Add(new ProductVenueExclusion
                {
                    ProductId = id,
                    VenueId = venueId,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new { ExcludedVenueIds = validVenueIds });
        }

        // GET: api/business/categories/5/products/10/exclusions
        [HttpGet("{id}/exclusions")]
        public async Task<ActionResult<List<int>>> GetVenueExclusions(int categoryId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var product = await _context.Products
                .Include(p => p.VenueExclusions)
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound("Product not found");
            }

            return Ok(product.VenueExclusions.Select(e => e.VenueId).ToList());
        }

        // POST: api/business/categories/5/products/10/toggle-available
        [HttpPost("{id}/toggle-available")]
        public async Task<IActionResult> ToggleAvailable(int categoryId, int id)
        {
            var businessId = _currentUserService.BusinessId;
            if (!businessId.HasValue)
            {
                return Forbid("User is not associated with a business");
            }

            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound();
            }

            product.IsAvailable = !product.IsAvailable;

            await _context.SaveChangesAsync();

            return Ok(new { product.Id, product.IsAvailable });
        }
    }
}
