using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("orders_items")]
    public class OrderItem
    {
        [Key]
        [Column("item_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        [Column("product_name")]
        public string ProductName { get; set; } = string.Empty;

        [Column("quantity")]
        public int Quantity { get; set; } = 1;

        [Column("unit_price", TypeName = "decimal(10,2)")]
        public decimal UnitPrice { get; set; } = 0;

        [MaxLength(500)]
        [Column("notes")]
        public string? Notes { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("product_id")]
        public int ProductId { get; set; }

        // Navigation properties
        [ForeignKey("OrderId")]
        public Order? Order { get; set; }

        [ForeignKey("ProductId")]
        public Product? Product { get; set; }
    }
}
