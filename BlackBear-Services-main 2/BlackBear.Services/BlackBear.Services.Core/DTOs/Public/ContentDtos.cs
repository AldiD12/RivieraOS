namespace BlackBear.Services.Core.DTOs.Public
{
    public class PublicContentListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public string? ContentUrl { get; set; }
        public string? Author { get; set; }
        public DateTime PublishedAt { get; set; }
        public int? ReadTimeMinutes { get; set; }
    }
}
