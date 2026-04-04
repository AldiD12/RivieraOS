using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLoginLockout : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "failed_login_attempts",
                table: "core_users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "lockout_end",
                table: "core_users",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "failed_login_attempts",
                table: "core_users");

            migrationBuilder.DropColumn(
                name: "lockout_end",
                table: "core_users");
        }
    }
}
