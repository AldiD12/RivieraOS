using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class CreateOrdersSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "orders_orders",
                columns: table => new
                {
                    order_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    order_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    customer_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    completed_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    venue_id = table.Column<int>(type: "int", nullable: false),
                    zone_id = table.Column<int>(type: "int", nullable: false),
                    business_id = table.Column<int>(type: "int", nullable: false),
                    handled_by_user_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders_orders", x => x.order_id);
                    table.ForeignKey(
                        name: "FK_orders_orders_catalog_venue_zones_zone_id",
                        column: x => x.zone_id,
                        principalTable: "catalog_venue_zones",
                        principalColumn: "zone_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_orders_orders_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_orders_orders_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_orders_orders_core_users_handled_by_user_id",
                        column: x => x.handled_by_user_id,
                        principalTable: "core_users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "orders_items",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    product_name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_orders_items", x => x.item_id);
                    table.ForeignKey(
                        name: "FK_orders_items_catalog_products_product_id",
                        column: x => x.product_id,
                        principalTable: "catalog_products",
                        principalColumn: "product_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_orders_items_orders_orders_order_id",
                        column: x => x.order_id,
                        principalTable: "orders_orders",
                        principalColumn: "order_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_orders_items_order_id",
                table: "orders_items",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_items_product_id",
                table: "orders_items",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_orders_business_id",
                table: "orders_orders",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_orders_handled_by_user_id",
                table: "orders_orders",
                column: "handled_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_orders_venue_id",
                table: "orders_orders",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_orders_orders_zone_id",
                table: "orders_orders",
                column: "zone_id");

            // Seed Barman role (if not exists)
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_id = 6)
                BEGIN
                    SET IDENTITY_INSERT [core_roles] ON;
                    INSERT INTO [core_roles] ([role_id], [role_name], [description])
                    VALUES (6, N'Barman', N'Bar staff who handles drink orders');
                    SET IDENTITY_INSERT [core_roles] OFF;
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "orders_items");

            migrationBuilder.DropTable(
                name: "orders_orders");

            // Remove Barman role
            migrationBuilder.DeleteData(
                table: "core_roles",
                keyColumn: "role_id",
                keyValue: 6);
        }
    }
}
