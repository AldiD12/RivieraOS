using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.DTOs.Public;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace BlackBear.Services.Core.Controllers.Public
{
    [Route("api/public/[controller]")]
    [ApiController]
    [EnableRateLimiting("public")]
    public class ContentController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public ContentController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/public/content
        [HttpGet]
        public async Task<ActionResult<List<PublicContentListItemDto>>> GetContent(
            [FromQuery] int? venueId = null,
            [FromQuery] string? type = null,
            [FromQuery] int limit = 10)
        {
            var query = _context.Contents
                .AsQueryable();

            if (venueId.HasValue)
                query = query.Where(c => c.VenueId == venueId.Value || c.VenueId == null);

            if (!string.IsNullOrEmpty(type))
                query = query.Where(c => c.ContentType == type);

            var content = await query
                .OrderBy(c => c.SortOrder)
                .ThenByDescending(c => c.PublishedAt)
                .Take(limit)
                .Select(c => new PublicContentListItemDto
                {
                    Id = c.Id,
                    Title = c.Title,
                    Description = c.Description,
                    ContentType = c.ContentType,
                    ImageUrl = c.ImageUrl,
                    ContentUrl = c.ContentUrl,
                    Author = c.Author,
                    PublishedAt = c.PublishedAt,
                    ReadTimeMinutes = c.ReadTimeMinutes
                })
                .ToListAsync();

            return Ok(content);
        }
    }
}
