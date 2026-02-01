using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "core_businesses",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "core_businesses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "catalog_venues",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "catalog_venues",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "catalog_venue_zones",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "catalog_venue_zones",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "catalog_products",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "catalog_products",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "deleted_at",
                table: "catalog_categories",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_deleted",
                table: "catalog_categories",
                type: "bit",
                nullable: false,
                defaultValue: false);

            // Seed roles if they don't exist
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'SuperAdmin')
                    INSERT INTO core_roles (role_name, description) VALUES ('SuperAdmin', 'System administrator with full access');

                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'BusinessOwner')
                    INSERT INTO core_roles (role_name, description) VALUES ('BusinessOwner', 'Owner of a business with full business access');

                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'Manager')
                    INSERT INTO core_roles (role_name, description) VALUES ('Manager', 'Manager with limited business access');

                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'Staff')
                    INSERT INTO core_roles (role_name, description) VALUES ('Staff', 'Staff member with operational access');

                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'Guest')
                    INSERT INTO core_roles (role_name, description) VALUES ('Guest', 'Guest user with minimal access');
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "core_businesses");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "core_businesses");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "catalog_venues");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "catalog_venues");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "catalog_venue_zones");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "catalog_venue_zones");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "catalog_products");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "catalog_products");

            migrationBuilder.DropColumn(
                name: "deleted_at",
                table: "catalog_categories");

            migrationBuilder.DropColumn(
                name: "is_deleted",
                table: "catalog_categories");
        }
    }
}
