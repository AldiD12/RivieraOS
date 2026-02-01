using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class CategoryListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public int ProductCount { get; set; }
    }

    public class CategoryDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
        public List<ProductListItemDto> Products { get; set; } = new();
    }

    public class CreateCategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }

    public class UpdateCategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;
    }
}
