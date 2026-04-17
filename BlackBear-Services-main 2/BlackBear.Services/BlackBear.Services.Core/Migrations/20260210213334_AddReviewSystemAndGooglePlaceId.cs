using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewSystemAndGooglePlaceId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "google_place_id",
                table: "catalog_venues",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "feedback_reviews",
                columns: table => new
                {
                    review_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    rating = table.Column<int>(type: "int", nullable: false),
                    comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    customer_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    customer_email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    is_public = table.Column<bool>(type: "bit", nullable: false),
                    redirected_to_google = table.Column<bool>(type: "bit", nullable: false),
                    alert_sent = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    venue_id = table.Column<int>(type: "int", nullable: false),
                    business_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    booking_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_feedback_reviews", x => x.review_id);
                    table.ForeignKey(
                        name: "FK_feedback_reviews_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_feedback_reviews_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_feedback_reviews_core_users_user_id",
                        column: x => x.user_id,
                        principalTable: "core_users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_feedback_reviews_orders_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders_orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_feedback_reviews_venue_zone_unit_bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "venue_zone_unit_bookings",
                        principalColumn: "booking_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reviews_booking_id",
                table: "feedback_reviews",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reviews_business_id",
                table: "feedback_reviews",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reviews_created_at",
                table: "feedback_reviews",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reviews_order_id",
                table: "feedback_reviews",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reviews_rating",
                table: "feedback_reviews",
                column: "rating");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reviews_user_id",
                table: "feedback_reviews",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_feedback_reviews_venue_id",
                table: "feedback_reviews",
                column: "venue_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "feedback_reviews");

            migrationBuilder.DropColumn(
                name: "google_place_id",
                table: "catalog_venues");
        }
    }
}
