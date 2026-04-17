using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class MoveMenuToBusinessLevel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_catalog_categories_catalog_venues_venue_id",
                table: "catalog_categories");

            migrationBuilder.DropForeignKey(
                name: "FK_catalog_products_catalog_venues_venue_id",
                table: "catalog_products");

            migrationBuilder.RenameColumn(
                name: "venue_id",
                table: "catalog_products",
                newName: "business_id");

            migrationBuilder.RenameIndex(
                name: "IX_catalog_products_venue_id",
                table: "catalog_products",
                newName: "IX_catalog_products_business_id");

            migrationBuilder.RenameColumn(
                name: "venue_id",
                table: "catalog_categories",
                newName: "business_id");

            migrationBuilder.RenameIndex(
                name: "IX_catalog_categories_venue_id",
                table: "catalog_categories",
                newName: "IX_catalog_categories_business_id");

            migrationBuilder.CreateTable(
                name: "catalog_category_venue_exclusions",
                columns: table => new
                {
                    category_id = table.Column<int>(type: "int", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_category_venue_exclusions", x => new { x.category_id, x.venue_id });
                    table.ForeignKey(
                        name: "FK_catalog_category_venue_exclusions_catalog_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "catalog_categories",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_catalog_category_venue_exclusions_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "catalog_product_venue_exclusions",
                columns: table => new
                {
                    product_id = table.Column<int>(type: "int", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_product_venue_exclusions", x => new { x.product_id, x.venue_id });
                    table.ForeignKey(
                        name: "FK_catalog_product_venue_exclusions_catalog_products_product_id",
                        column: x => x.product_id,
                        principalTable: "catalog_products",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_catalog_product_venue_exclusions_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_catalog_category_venue_exclusions_venue_id",
                table: "catalog_category_venue_exclusions",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_product_venue_exclusions_venue_id",
                table: "catalog_product_venue_exclusions",
                column: "venue_id");

            migrationBuilder.AddForeignKey(
                name: "FK_catalog_categories_core_businesses_business_id",
                table: "catalog_categories",
                column: "business_id",
                principalTable: "core_businesses",
                principalColumn: "business_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_catalog_products_core_businesses_business_id",
                table: "catalog_products",
                column: "business_id",
                principalTable: "core_businesses",
                principalColumn: "business_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_catalog_categories_core_businesses_business_id",
                table: "catalog_categories");

            migrationBuilder.DropForeignKey(
                name: "FK_catalog_products_core_businesses_business_id",
                table: "catalog_products");

            migrationBuilder.DropTable(
                name: "catalog_category_venue_exclusions");

            migrationBuilder.DropTable(
                name: "catalog_product_venue_exclusions");

            migrationBuilder.RenameColumn(
                name: "business_id",
                table: "catalog_products",
                newName: "venue_id");

            migrationBuilder.RenameIndex(
                name: "IX_catalog_products_business_id",
                table: "catalog_products",
                newName: "IX_catalog_products_venue_id");

            migrationBuilder.RenameColumn(
                name: "business_id",
                table: "catalog_categories",
                newName: "venue_id");

            migrationBuilder.RenameIndex(
                name: "IX_catalog_categories_business_id",
                table: "catalog_categories",
                newName: "IX_catalog_categories_venue_id");

            migrationBuilder.AddForeignKey(
                name: "FK_catalog_categories_catalog_venues_venue_id",
                table: "catalog_categories",
                column: "venue_id",
                principalTable: "catalog_venues",
                principalColumn: "venue_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_catalog_products_catalog_venues_venue_id",
                table: "catalog_products",
                column: "venue_id",
                principalTable: "catalog_venues",
                principalColumn: "venue_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
