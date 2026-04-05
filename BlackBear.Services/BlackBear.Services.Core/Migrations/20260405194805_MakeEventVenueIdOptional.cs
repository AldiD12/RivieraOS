using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class MakeEventVenueIdOptional : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_events_scheduled_catalog_venues_venue_id",
                table: "events_scheduled");

            migrationBuilder.AlterColumn<int>(
                name: "venue_id",
                table: "events_scheduled",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            // Add business_id as nullable first so we can populate it
            migrationBuilder.AddColumn<int>(
                name: "business_id",
                table: "events_scheduled",
                type: "int",
                nullable: true);

            // Populate business_id from the venue's business for existing events
            migrationBuilder.Sql(
                @"UPDATE e SET e.business_id = v.business_id
                  FROM events_scheduled e
                  INNER JOIN catalog_venues v ON e.venue_id = v.venue_id
                  WHERE e.business_id IS NULL");

            // Now make it required
            migrationBuilder.AlterColumn<int>(
                name: "business_id",
                table: "events_scheduled",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_events_scheduled_business_id",
                table: "events_scheduled",
                column: "business_id");

            migrationBuilder.AddForeignKey(
                name: "FK_events_scheduled_catalog_venues_venue_id",
                table: "events_scheduled",
                column: "venue_id",
                principalTable: "catalog_venues",
                principalColumn: "venue_id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_events_scheduled_core_businesses_business_id",
                table: "events_scheduled",
                column: "business_id",
                principalTable: "core_businesses",
                principalColumn: "business_id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_events_scheduled_catalog_venues_venue_id",
                table: "events_scheduled");

            migrationBuilder.DropForeignKey(
                name: "FK_events_scheduled_core_businesses_business_id",
                table: "events_scheduled");

            migrationBuilder.DropIndex(
                name: "IX_events_scheduled_business_id",
                table: "events_scheduled");

            migrationBuilder.DropColumn(
                name: "business_id",
                table: "events_scheduled");

            migrationBuilder.AlterColumn<int>(
                name: "venue_id",
                table: "events_scheduled",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_events_scheduled_catalog_venues_venue_id",
                table: "events_scheduled",
                column: "venue_id",
                principalTable: "catalog_venues",
                principalColumn: "venue_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
