using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddZoneUnitIdToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "zone_unit_id",
                table: "orders_orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_orders_zone_unit_id",
                table: "orders_orders",
                column: "zone_unit_id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_orders_venue_zone_units_zone_unit_id",
                table: "orders_orders",
                column: "zone_unit_id",
                principalTable: "venue_zone_units",
                principalColumn: "unit_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_orders_venue_zone_units_zone_unit_id",
                table: "orders_orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_orders_zone_unit_id",
                table: "orders_orders");

            migrationBuilder.DropColumn(
                name: "zone_unit_id",
                table: "orders_orders");
        }
    }
}
