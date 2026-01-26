using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlackBear.Services.Core.Data;
using BlackBear.Services.Core.Entities;

namespace BlackBear.Services.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BusinessesController : ControllerBase
    {
        private readonly BlackBearDbContext _context;

        public BusinessesController(BlackBearDbContext context)
        {
            _context = context;
        }

        // GET: api/businesses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Business>>> GetBusinesses()
        {
            return await _context.Businesses.ToListAsync();
        }

        // GET: api/businesses/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Business>> GetBusiness(int id)
        {
            var business = await _context.Businesses.FindAsync(id);

            if (business == null)
            {
                return NotFound();
            }

            return business;
        }

        // POST: api/businesses
        [HttpPost]
        public async Task<ActionResult<Business>> CreateBusiness(Business business)
        {
            // Force create timestamp
            // Note: Ideally we use DTOs, but for Sprint 1, this is fine.
            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetBusiness", new { id = business.Id }, business);
        }
    }
}