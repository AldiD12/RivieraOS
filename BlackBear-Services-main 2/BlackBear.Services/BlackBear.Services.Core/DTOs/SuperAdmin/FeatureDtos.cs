namespace BlackBear.Services.Core.DTOs.SuperAdmin
{
    public class BusinessFeatureDto
    {
        public int Id { get; set; }
        public int BusinessId { get; set; }
        public string? BusinessName { get; set; }
        public bool HasDigitalMenu { get; set; }
        public bool HasTableOrdering { get; set; }
        public bool HasBookings { get; set; }
        public bool HasEvents { get; set; }
        public bool HasPulse { get; set; }
    }

    public class UpdateBusinessFeatureRequest
    {
        public bool HasDigitalMenu { get; set; }
        public bool HasTableOrdering { get; set; }
        public bool HasBookings { get; set; }
        public bool HasEvents { get; set; }
        public bool HasPulse { get; set; }
    }

    public class PatchBusinessFeatureRequest
    {
        public bool? HasDigitalMenu { get; set; }
        public bool? HasTableOrdering { get; set; }
        public bool? HasBookings { get; set; }
        public bool? HasEvents { get; set; }
        public bool? HasPulse { get; set; }
    }
}
