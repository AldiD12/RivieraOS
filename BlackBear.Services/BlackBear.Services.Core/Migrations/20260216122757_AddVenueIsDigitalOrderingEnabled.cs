using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddVenueIsDigitalOrderingEnabled : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_digital_ordering_enabled",
                table: "catalog_venues",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_digital_ordering_enabled",
                table: "catalog_venues");
        }
    }
}
