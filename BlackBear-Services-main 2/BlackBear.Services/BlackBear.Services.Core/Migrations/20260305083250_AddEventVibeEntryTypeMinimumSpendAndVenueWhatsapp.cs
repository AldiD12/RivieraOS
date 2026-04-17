using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddEventVibeEntryTypeMinimumSpendAndVenueWhatsapp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "entry_type",
                table: "events_scheduled",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "minimum_spend",
                table: "events_scheduled",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "vibe",
                table: "events_scheduled",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "whatsapp_number",
                table: "catalog_venues",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "entry_type",
                table: "events_scheduled");

            migrationBuilder.DropColumn(
                name: "minimum_spend",
                table: "events_scheduled");

            migrationBuilder.DropColumn(
                name: "vibe",
                table: "events_scheduled");

            migrationBuilder.DropColumn(
                name: "whatsapp_number",
                table: "catalog_venues");
        }
    }
}
