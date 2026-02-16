using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddUserVenueAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "venue_id",
                table: "core_users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_core_users_venue_id",
                table: "core_users",
                column: "venue_id");

            migrationBuilder.AddForeignKey(
                name: "FK_core_users_catalog_venues_venue_id",
                table: "core_users",
                column: "venue_id",
                principalTable: "catalog_venues",
                principalColumn: "venue_id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_core_users_catalog_venues_venue_id",
                table: "core_users");

            migrationBuilder.DropIndex(
                name: "IX_core_users_venue_id",
                table: "core_users");

            migrationBuilder.DropColumn(
                name: "venue_id",
                table: "core_users");
        }
    }
}
