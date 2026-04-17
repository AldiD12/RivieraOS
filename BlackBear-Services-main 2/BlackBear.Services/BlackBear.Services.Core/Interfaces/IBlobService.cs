namespace BlackBear.Services.Core.Interfaces
{
    public interface IBlobService
    {
        Task<string> UploadImageAsync(IFormFile file);
    }
}
