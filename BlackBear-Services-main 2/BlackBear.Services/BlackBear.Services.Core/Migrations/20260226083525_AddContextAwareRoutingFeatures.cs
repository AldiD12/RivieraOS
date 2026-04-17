using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddContextAwareRoutingFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_manual_override",
                table: "catalog_venue_zones",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "override_by",
                table: "catalog_venue_zones",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "override_reason",
                table: "catalog_venue_zones",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "override_until",
                table: "catalog_venue_zones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "content_items",
                columns: table => new
                {
                    content_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    content_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    content_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    author = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    venue_id = table.Column<int>(type: "int", nullable: true),
                    published_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    read_time_minutes = table.Column<int>(type: "int", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_content_items", x => x.content_id);
                    table.ForeignKey(
                        name: "FK_content_items_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "feedback_negative",
                columns: table => new
                {
                    feedback_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    venue_id = table.Column<int>(type: "int", nullable: false),
                    business_id = table.Column<int>(type: "int", nullable: false),
                    rating = table.Column<int>(type: "int", nullable: false),
                    comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    unit_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    guest_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    guest_phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    submitted_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    resolved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    resolved_by = table.Column<int>(type: "int", nullable: true),
                    resolution_notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_feedback_negative", x => x.feedback_id);
                    table.ForeignKey(
                        name: "FK_feedback_negative_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_feedback_negative_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_feedback_negative_core_users_resolved_by",
                        column: x => x.resolved_by,
                        principalTable: "core_users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_content_items_content_type",
                table: "content_items",
                column: "content_type");

            migrationBuilder.CreateIndex(
                name: "IX_content_items_venue_id",
                table: "content_items",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_negative_business_id",
                table: "feedback_negative",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_negative_resolved_by",
                table: "feedback_negative",
                column: "resolved_by");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_negative_status",
                table: "feedback_negative",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_negative_submitted_at",
                table: "feedback_negative",
                column: "submitted_at");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_negative_venue_id",
                table: "feedback_negative",
                column: "venue_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "content_items");

            migrationBuilder.DropTable(
                name: "feedback_negative");

            migrationBuilder.DropColumn(
                name: "is_manual_override",
                table: "catalog_venue_zones");

            migrationBuilder.DropColumn(
                name: "override_by",
                table: "catalog_venue_zones");

            migrationBuilder.DropColumn(
                name: "override_reason",
                table: "catalog_venue_zones");

            migrationBuilder.DropColumn(
                name: "override_until",
                table: "catalog_venue_zones");
        }
    }
}
