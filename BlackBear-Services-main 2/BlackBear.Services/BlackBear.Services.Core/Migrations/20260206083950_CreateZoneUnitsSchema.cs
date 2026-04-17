using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class CreateZoneUnitsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "venue_zone_units",
                columns: table => new
                {
                    unit_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    unit_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    unit_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    base_price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    position_x = table.Column<int>(type: "int", nullable: true),
                    position_y = table.Column<int>(type: "int", nullable: true),
                    qr_code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    zone_id = table.Column<int>(type: "int", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false),
                    business_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_venue_zone_units", x => x.unit_id);
                    table.ForeignKey(
                        name: "FK_venue_zone_units_catalog_venue_zones_zone_id",
                        column: x => x.zone_id,
                        principalTable: "catalog_venue_zones",
                        principalColumn: "zone_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_venue_zone_units_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_venue_zone_units_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "venue_zone_unit_bookings",
                columns: table => new
                {
                    booking_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    guest_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    guest_phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    guest_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    guest_count = table.Column<int>(type: "int", nullable: false),
                    start_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_time = table.Column<DateTime>(type: "datetime2", nullable: true),
                    checked_in_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    checked_out_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    zone_unit_id = table.Column<int>(type: "int", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false),
                    business_id = table.Column<int>(type: "int", nullable: false),
                    handled_by_user_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_venue_zone_unit_bookings", x => x.booking_id);
                    table.ForeignKey(
                        name: "FK_venue_zone_unit_bookings_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_venue_zone_unit_bookings_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_venue_zone_unit_bookings_core_users_handled_by_user_id",
                        column: x => x.handled_by_user_id,
                        principalTable: "core_users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_venue_zone_unit_bookings_venue_zone_units_zone_unit_id",
                        column: x => x.zone_unit_id,
                        principalTable: "venue_zone_units",
                        principalColumn: "unit_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_unit_bookings_booking_code",
                table: "venue_zone_unit_bookings",
                column: "booking_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_unit_bookings_business_id",
                table: "venue_zone_unit_bookings",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_unit_bookings_handled_by_user_id",
                table: "venue_zone_unit_bookings",
                column: "handled_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_unit_bookings_venue_id",
                table: "venue_zone_unit_bookings",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_unit_bookings_zone_unit_id",
                table: "venue_zone_unit_bookings",
                column: "zone_unit_id");

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_units_business_id",
                table: "venue_zone_units",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_units_qr_code",
                table: "venue_zone_units",
                column: "qr_code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_units_venue_id",
                table: "venue_zone_units",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_venue_zone_units_zone_id",
                table: "venue_zone_units",
                column: "zone_id");

            // Seed Caderman role (only if not exists by name or id)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'Caderman' OR role_id = 7)
                BEGIN
                    SET IDENTITY_INSERT [core_roles] ON;
                    INSERT INTO [core_roles] ([role_id], [role_name], [description])
                    VALUES (7, N'Caderman', N'Beach/pool staff who manages sunbeds and umbrellas');
                    SET IDENTITY_INSERT [core_roles] OFF;
                END
                ELSE IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'Caderman')
                BEGIN
                    INSERT INTO [core_roles] ([role_name], [description])
                    VALUES (N'Caderman', N'Beach/pool staff who manages sunbeds and umbrellas');
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "venue_zone_unit_bookings");

            migrationBuilder.DropTable(
                name: "venue_zone_units");

            // Remove Caderman role
            migrationBuilder.Sql("DELETE FROM core_roles WHERE role_name = 'Caderman'");
        }
    }
}
