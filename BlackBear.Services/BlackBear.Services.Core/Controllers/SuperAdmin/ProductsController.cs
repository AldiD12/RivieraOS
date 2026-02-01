using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.SuperAdmin;
using BlackBear.Services.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.SuperAdmin
{
    [Route("api/superadmin/categories/{categoryId}/[controller]")]
    [ApiController]
    [Authorize(Policy = "SuperAdmin")]
    public class ProductsController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public ProductsController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/categories/5/products
        [HttpGet]
        public async Task<ActionResult<List<ProductListItemDto>>> GetProducts(int categoryId)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
            {
                return NotFound("Category not found");
            }

            var products = category.Products
                .OrderBy(p => p.Name)
                .Select(p => new ProductListItemDto
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

        // GET: api/superadmin/categories/5/products/10
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDetailDto>> GetProduct(int categoryId, int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Venue)
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound();
            }

            return Ok(new ProductDetailDto
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
                VenueId = product.VenueId,
                VenueName = product.Venue?.Name
            });
        }

        // POST: api/superadmin/categories/5/products
        [HttpPost]
        public async Task<ActionResult<ProductDetailDto>> CreateProduct(int categoryId, CreateProductRequest request)
        {
            var category = await _context.Categories
                .Include(c => c.Venue)
                .FirstOrDefaultAsync(c => c.Id == categoryId);

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
                VenueId = category.VenueId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { categoryId, id = product.Id }, new ProductDetailDto
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
                VenueId = product.VenueId,
                VenueName = category.Venue?.Name
            });
        }

        // PUT: api/superadmin/categories/5/products/10
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int categoryId, int id, UpdateProductRequest request)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound();
            }

            // If category is changing, verify new category exists and get its venueId
            if (request.CategoryId != categoryId)
            {
                var newCategory = await _context.Categories.FindAsync(request.CategoryId);
                if (newCategory == null)
                {
                    return BadRequest("New category not found");
                }
                product.CategoryId = request.CategoryId;
                product.VenueId = newCategory.VenueId;
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

        // DELETE: api/superadmin/categories/5/products/10 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int categoryId, int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == id && p.CategoryId == categoryId);

            if (product == null)
            {
                return NotFound();
            }

            // Soft delete
            product.IsDeleted = true;
            product.DeletedAt = DateTime.UtcNow;
            product.IsAvailable = false;

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
