using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BlackBear.Services.Core.Entities
{
    [Table("orders_orders")]
    public class Order
    {
        [Key]
        [Column("order_id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        [Column("order_number")]
        public string OrderNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Pending";

        [MaxLength(500)]
        [Column("notes")]
        public string? Notes { get; set; }

        [MaxLength(100)]
        [Column("customer_name")]
        public string? CustomerName { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("completed_at")]
        public DateTime? CompletedAt { get; set; }

        [Column("is_deleted")]
        public bool IsDeleted { get; set; } = false;

        [Column("deleted_at")]
        public DateTime? DeletedAt { get; set; }

        // Foreign keys
        [Column("venue_id")]
        public int VenueId { get; set; }

        [Column("zone_id")]
        public int VenueZoneId { get; set; }

        [Column("business_id")]
        public int BusinessId { get; set; }

        [Column("handled_by_user_id")]
        public int? HandledByUserId { get; set; }

        [Column("zone_unit_id")]
        public int? ZoneUnitId { get; set; }

        // Navigation properties
        [ForeignKey("VenueId")]
        public Venue? Venue { get; set; }

        [ForeignKey("VenueZoneId")]
        public VenueZone? VenueZone { get; set; }

        [ForeignKey("BusinessId")]
        public Business? Business { get; set; }

        [ForeignKey("HandledByUserId")]
        public User? HandledByUser { get; set; }

        [ForeignKey("ZoneUnitId")]
        public ZoneUnit? ZoneUnit { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
