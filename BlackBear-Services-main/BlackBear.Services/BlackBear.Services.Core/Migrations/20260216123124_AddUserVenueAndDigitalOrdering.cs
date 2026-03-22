using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddUserVenueAndDigitalOrdering : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // venue_id column and index may already exist from a partial prior migration run
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('core_users') AND name = 'venue_id')
                BEGIN
                    ALTER TABLE [core_users] ADD [venue_id] int NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('core_users') AND name = 'IX_core_users_venue_id')
                BEGIN
                    CREATE INDEX [IX_core_users_venue_id] ON [core_users] ([venue_id]);
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_core_users_catalog_venues_venue_id')
                BEGIN
                    ALTER TABLE [core_users] ADD CONSTRAINT [FK_core_users_catalog_venues_venue_id] FOREIGN KEY ([venue_id]) REFERENCES [catalog_venues] ([venue_id]);
                END
            ");

            migrationBuilder.AddColumn<bool>(
                name: "is_digital_ordering_enabled",
                table: "catalog_venues",
                type: "bit",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_core_users_catalog_venues_venue_id",
                table: "core_users");

            migrationBuilder.DropIndex(
                name: "IX_core_users_venue_id",
                table: "core_users");

            migrationBuilder.DropColumn(
                name: "venue_id",
                table: "core_users");

            migrationBuilder.DropColumn(
                name: "is_digital_ordering_enabled",
                table: "catalog_venues");
        }
    }
}
