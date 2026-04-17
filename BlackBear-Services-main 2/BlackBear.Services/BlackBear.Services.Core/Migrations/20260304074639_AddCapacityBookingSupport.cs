using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddCapacityBookingSupport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_venue_zone_unit_bookings_venue_zone_units_zone_unit_id",
                table: "venue_zone_unit_bookings");

            migrationBuilder.AddColumn<int>(
                name: "current_booking_id",
                table: "venue_zone_units",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "zone_unit_id",
                table: "venue_zone_unit_bookings",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "units_needed",
                table: "venue_zone_unit_bookings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "zone_id",
                table: "venue_zone_unit_bookings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_units_current_booking_id",
                table: "venue_zone_units",
                column: "current_booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_unit_bookings_zone_id",
                table: "venue_zone_unit_bookings",
                column: "zone_id");

            migrationBuilder.AddForeignKey(
                name: "FK_venue_zone_unit_bookings_catalog_venue_zones_zone_id",
                table: "venue_zone_unit_bookings",
                column: "zone_id",
                principalTable: "catalog_venue_zones",
                principalColumn: "zone_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_venue_zone_unit_bookings_venue_zone_units_zone_unit_id",
                table: "venue_zone_unit_bookings",
                column: "zone_unit_id",
                principalTable: "venue_zone_units",
                principalColumn: "unit_id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_venue_zone_units_venue_zone_unit_bookings_current_booking_id",
                table: "venue_zone_units",
                column: "current_booking_id",
                principalTable: "venue_zone_unit_bookings",
                principalColumn: "booking_id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_venue_zone_unit_bookings_catalog_venue_zones_zone_id",
                table: "venue_zone_unit_bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_venue_zone_unit_bookings_venue_zone_units_zone_unit_id",
                table: "venue_zone_unit_bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_venue_zone_units_venue_zone_unit_bookings_current_booking_id",
                table: "venue_zone_units");

            migrationBuilder.DropIndex(
                name: "IX_venue_zone_units_current_booking_id",
                table: "venue_zone_units");

            migrationBuilder.DropIndex(
                name: "IX_venue_zone_unit_bookings_zone_id",
                table: "venue_zone_unit_bookings");

            migrationBuilder.DropColumn(
                name: "current_booking_id",
                table: "venue_zone_units");

            migrationBuilder.DropColumn(
                name: "units_needed",
                table: "venue_zone_unit_bookings");

            migrationBuilder.DropColumn(
                name: "zone_id",
                table: "venue_zone_unit_bookings");

            migrationBuilder.AlterColumn<int>(
                name: "zone_unit_id",
                table: "venue_zone_unit_bookings",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_venue_zone_unit_bookings_venue_zone_units_zone_unit_id",
                table: "venue_zone_unit_bookings",
                column: "zone_unit_id",
                principalTable: "venue_zone_units",
                principalColumn: "unit_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
