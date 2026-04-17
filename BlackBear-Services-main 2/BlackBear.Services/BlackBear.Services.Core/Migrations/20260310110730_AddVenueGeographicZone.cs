using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddVenueGeographicZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "geographic_zone",
                table: "catalog_venues",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_catalog_venues_geographic_zone",
                table: "catalog_venues",
                column: "geographic_zone");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_catalog_venues_geographic_zone",
                table: "catalog_venues");

            migrationBuilder.DropColumn(
                name: "geographic_zone",
                table: "catalog_venues");
        }
    }
}
