using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessFeaturesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "core_business_features",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    business_id = table.Column<int>(type: "int", nullable: false),
                    has_digital_menu = table.Column<bool>(type: "bit", nullable: false),
                    has_table_ordering = table.Column<bool>(type: "bit", nullable: false),
                    has_bookings = table.Column<bool>(type: "bit", nullable: false),
                    has_events = table.Column<bool>(type: "bit", nullable: false),
                    has_pulse = table.Column<bool>(type: "bit", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_core_business_features", x => x.id);
                    table.ForeignKey(
                        name: "FK_core_business_features_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_core_business_features_business_id",
                table: "core_business_features",
                column: "business_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "core_business_features");
        }
    }
}
