using System.ComponentModel.DataAnnotations;

namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class ProductListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? OldPrice { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsAlcohol { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
    }

    public class ProductDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? OldPrice { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsAlcohol { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public int VenueId { get; set; }
        public string? VenueName { get; set; }
    }

    public class CreateProductRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [Required]
        public decimal Price { get; set; }

        public decimal? OldPrice { get; set; }

        public bool IsAvailable { get; set; } = true;

        public bool IsAlcohol { get; set; } = false;
    }

    public class UpdateProductRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        [Required]
        public decimal Price { get; set; }

        public decimal? OldPrice { get; set; }

        public bool IsAvailable { get; set; } = true;

        public bool IsAlcohol { get; set; } = false;

        public int CategoryId { get; set; }
    }
}
