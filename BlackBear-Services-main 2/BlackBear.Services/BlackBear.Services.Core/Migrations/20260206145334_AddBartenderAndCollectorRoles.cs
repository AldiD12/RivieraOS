using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddBartenderAndCollectorRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add Bartender role
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'Bartender')
                BEGIN
                    INSERT INTO [core_roles] ([role_name], [description])
                    VALUES (N'Bartender', N'Bar staff who handles drink orders');
                END
            ");

            // Add Collector role
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT 1 FROM core_roles WHERE role_name = 'Collector')
                BEGIN
                    INSERT INTO [core_roles] ([role_name], [description])
                    VALUES (N'Collector', N'Staff who collects payments and manages cash');
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove Bartender and Collector roles
            migrationBuilder.Sql("DELETE FROM core_roles WHERE role_name IN ('Bartender', 'Collector')");
        }
    }
}
