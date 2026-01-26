using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "core_businesses",
                columns: table => new
                {
                    business_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    registered_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    brand_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tax_id = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    contact_email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    logo_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    subscription_status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_core_businesses", x => x.business_id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "core_roles",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    role_name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_core_roles", x => x.role_id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "catalog_venues",
                columns: table => new
                {
                    venue_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    type = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    image_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    latitude = table.Column<double>(type: "double", nullable: true),
                    longitude = table.Column<double>(type: "double", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    business_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_venues", x => x.venue_id);
                    table.ForeignKey(
                        name: "FK_catalog_venues_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "core_users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    password_hash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    full_name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    phone_number = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    user_type = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    business_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_core_users", x => x.user_id);
                    table.ForeignKey(
                        name: "FK_core_users_core_businesses_business_id",
                        column: x => x.business_id,
                        principalTable: "core_businesses",
                        principalColumn: "business_id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "catalog_categories",
                columns: table => new
                {
                    category_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_categories", x => x.category_id);
                    table.ForeignKey(
                        name: "FK_catalog_categories_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "catalog_venue_configs",
                columns: table => new
                {
                    config_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    is_booking_enabled = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    is_self_service_enabled = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    is_event_mode_enabled = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    max_capacity = table.Column<int>(type: "int", nullable: false),
                    booking_deposit_amount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_venue_configs", x => x.config_id);
                    table.ForeignKey(
                        name: "FK_catalog_venue_configs_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "catalog_venue_zones",
                columns: table => new
                {
                    zone_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    zone_type = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    capacity_per_unit = table.Column<int>(type: "int", nullable: false),
                    base_price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_venue_zones", x => x.zone_id);
                    table.ForeignKey(
                        name: "FK_catalog_venue_zones_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "events_scheduled",
                columns: table => new
                {
                    event_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    flyer_image_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    start_time = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    end_time = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    is_ticketed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ticket_price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    max_guests = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events_scheduled", x => x.event_id);
                    table.ForeignKey(
                        name: "FK_events_scheduled_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "core_user_roles",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_core_user_roles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "FK_core_user_roles_core_roles_role_id",
                        column: x => x.role_id,
                        principalTable: "core_roles",
                        principalColumn: "role_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_core_user_roles_core_users_user_id",
                        column: x => x.user_id,
                        principalTable: "core_users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "catalog_products",
                columns: table => new
                {
                    product_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    image_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    old_price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    is_available = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    is_alcohol = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    category_id = table.Column<int>(type: "int", nullable: false),
                    venue_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_catalog_products", x => x.product_id);
                    table.ForeignKey(
                        name: "FK_catalog_products_catalog_categories_category_id",
                        column: x => x.category_id,
                        principalTable: "catalog_categories",
                        principalColumn: "category_id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_catalog_products_catalog_venues_venue_id",
                        column: x => x.venue_id,
                        principalTable: "catalog_venues",
                        principalColumn: "venue_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "events_bookings",
                columns: table => new
                {
                    booking_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    guest_count = table.Column<int>(type: "int", nullable: false),
                    total_paid = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    booking_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    event_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events_bookings", x => x.booking_id);
                    table.ForeignKey(
                        name: "FK_events_bookings_core_users_user_id",
                        column: x => x.user_id,
                        principalTable: "core_users",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_events_bookings_events_scheduled_event_id",
                        column: x => x.event_id,
                        principalTable: "events_scheduled",
                        principalColumn: "event_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_categories_venue_id",
                table: "catalog_categories",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_products_category_id",
                table: "catalog_products",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_products_venue_id",
                table: "catalog_products",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_venue_configs_venue_id",
                table: "catalog_venue_configs",
                column: "venue_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_catalog_venue_zones_venue_id",
                table: "catalog_venue_zones",
                column: "venue_id");

            migrationBuilder.CreateIndex(
                name: "IX_catalog_venues_business_id",
                table: "catalog_venues",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_core_user_roles_role_id",
                table: "core_user_roles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_core_users_business_id",
                table: "core_users",
                column: "business_id");

            migrationBuilder.CreateIndex(
                name: "IX_core_users_email",
                table: "core_users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_events_bookings_event_id",
                table: "events_bookings",
                column: "event_id");

            migrationBuilder.CreateIndex(
                name: "IX_events_bookings_user_id",
                table: "events_bookings",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_events_scheduled_venue_id",
                table: "events_scheduled",
                column: "venue_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "catalog_products");

            migrationBuilder.DropTable(
                name: "catalog_venue_configs");

            migrationBuilder.DropTable(
                name: "catalog_venue_zones");

            migrationBuilder.DropTable(
                name: "core_user_roles");

            migrationBuilder.DropTable(
                name: "events_bookings");

            migrationBuilder.DropTable(
                name: "catalog_categories");

            migrationBuilder.DropTable(
                name: "core_roles");

            migrationBuilder.DropTable(
                name: "core_users");

            migrationBuilder.DropTable(
                name: "events_scheduled");

            migrationBuilder.DropTable(
                name: "catalog_venues");

            migrationBuilder.DropTable(
                name: "core_businesses");
        }
    }
}
