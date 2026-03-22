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
    public class ContentController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public ContentController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/superadmin/content
        [HttpGet]
        public async Task<ActionResult<List<ContentListItemDto>>> GetContent(
            [FromQuery] bool? isActive = null,
            [FromQuery] string? contentType = null,
            [FromQuery] int? venueId = null)
        {
            var query = _context.Contents
                .IgnoreQueryFilters()
                .Include(c => c.Venue)
                .AsQueryable();

            if (isActive.HasValue)
                query = query.Where(c => c.IsActive == isActive.Value);
            if (!string.IsNullOrEmpty(contentType))
                query = query.Where(c => c.ContentType == contentType);
            if (venueId.HasValue)
                query = query.Where(c => c.VenueId == venueId.Value);

            var content = await query
                .OrderBy(c => c.SortOrder)
                .ThenByDescending(c => c.PublishedAt)
                .Select(c => new ContentListItemDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    ContentType = c.ContentType,
                    ImageUrl = c.ImageUrl,
                    ContentUrl = c.ContentUrl,
                    Author = c.Author,
                    VenueId = c.VenueId,
                    VenueName = c.Venue != null ? c.Venue.Name : null,
                    PublishedAt = c.PublishedAt,
                    ReadTimeMinutes = c.ReadTimeMinutes,
                    IsActive = c.IsActive,
                    SortOrder = c.SortOrder,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(content);
        }

        // GET: api/superadmin/content/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ContentListItemDto>> GetContentById(int id)
        {
            var content = await _context.Contents
                .IgnoreQueryFilters()
                .Include(c => c.Venue)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (content == null)
            {
                return NotFound();
            }

            return Ok(new ContentListItemDto
            {
                Id = content.Id,
                Title = content.Title,
                Description = content.Description,
                ContentType = content.ContentType,
                ImageUrl = content.ImageUrl,
                ContentUrl = content.ContentUrl,
                Author = content.Author,
                VenueId = content.VenueId,
                VenueName = content.Venue?.Name,
                PublishedAt = content.PublishedAt,
                ReadTimeMinutes = content.ReadTimeMinutes,
                IsActive = content.IsActive,
                SortOrder = content.SortOrder,
                CreatedAt = content.CreatedAt
            });
        }

        // POST: api/superadmin/content
        [HttpPost]
        public async Task<ActionResult<ContentListItemDto>> CreateContent(CreateContentRequest request)
        {
            if (request.VenueId.HasValue)
            {
                var venueExists = await _context.Venues.AnyAsync(v => v.Id == request.VenueId.Value);
                if (!venueExists)
                {
                    return BadRequest("Venue not found");
                }
            }

            var content = new Content
            {
                Title = request.Title,
                Description = request.Description,
                ContentType = request.ContentType,
                ImageUrl = request.ImageUrl,
                ContentUrl = request.ContentUrl,
                Author = request.Author,
                VenueId = request.VenueId,
                PublishedAt = request.PublishedAt ?? DateTime.UtcNow,
                ReadTimeMinutes = request.ReadTimeMinutes,
                IsActive = request.IsActive,
                SortOrder = request.SortOrder,
                CreatedAt = DateTime.UtcNow
            };

            _context.Contents.Add(content);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetContentById), new { id = content.Id }, new ContentListItemDto
            {
                Id = content.Id,
                Title = content.Title,
                Description = content.Description,
                ContentType = content.ContentType,
                ImageUrl = content.ImageUrl,
                ContentUrl = content.ContentUrl,
                Author = content.Author,
                VenueId = content.VenueId,
                PublishedAt = content.PublishedAt,
                ReadTimeMinutes = content.ReadTimeMinutes,
                IsActive = content.IsActive,
                SortOrder = content.SortOrder,
                CreatedAt = content.CreatedAt
            });
        }

        // PUT: api/superadmin/content/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContent(int id, UpdateContentRequest request)
        {
            var content = await _context.Contents
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.Id == id);

            if (content == null)
            {
                return NotFound();
            }

            if (request.VenueId.HasValue)
            {
                var venueExists = await _context.Venues.AnyAsync(v => v.Id == request.VenueId.Value);
                if (!venueExists)
                {
                    return BadRequest("Venue not found");
                }
            }

            content.Title = request.Title;
            content.Description = request.Description;
            content.ContentType = request.ContentType;
            content.ImageUrl = request.ImageUrl;
            content.ContentUrl = request.ContentUrl;
            content.Author = request.Author;
            content.VenueId = request.VenueId;
            if (request.PublishedAt.HasValue)
                content.PublishedAt = request.PublishedAt.Value;
            content.ReadTimeMinutes = request.ReadTimeMinutes;
            content.IsActive = request.IsActive;
            content.SortOrder = request.SortOrder;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/superadmin/content/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContent(int id)
        {
            var content = await _context.Contents
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.Id == id);

            if (content == null)
            {
                return NotFound();
            }

            _context.Contents.Remove(content);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Content deleted successfully" });
        }
    }
}
