using BlackBear.Services.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BlackBear.Services.Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ImagesController : ControllerBase
    {
        private readonly IBlobService _blobService;

        public ImagesController(IBlobService blobService)
        {
            _blobService = blobService;
        }

        // POST: api/images/upload
        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided.");

            var contentType = file.ContentType;
            if (!contentType.StartsWith("image/"))
                return BadRequest("Only image files are allowed.");

            var url = await _blobService.UploadImageAsync(file);
            return Ok(new { url });
        }
    }
}
