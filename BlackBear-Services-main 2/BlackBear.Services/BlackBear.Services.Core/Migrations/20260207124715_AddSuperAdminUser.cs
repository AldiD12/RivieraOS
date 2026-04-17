using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlackBear.Services.Core.Migrations
{
    /// <inheritdoc />
    public partial class AddSuperAdminUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create SuperAdmin user: kristi@gmail.com / kico123
            // Password hash generated using PBKDF2 with salt
            migrationBuilder.Sql(@"
                DECLARE @SuperAdminRoleId INT;
                DECLARE @UserId INT;
                
                -- Get SuperAdmin role ID
                SELECT @SuperAdminRoleId = role_id FROM core_roles WHERE role_name = 'SuperAdmin';
                
                -- Check if user already exists
                IF NOT EXISTS (SELECT 1 FROM core_users WHERE email = 'kristi@gmail.com')
                BEGIN
                    -- Insert SuperAdmin user
                    INSERT INTO core_users (email, password_hash, full_name, phone_number, business_id, is_active, created_at)
                    VALUES (
                        'kristi@gmail.com',
                        'wQFO9vZ3xJLwIg+6K8VNOw==:yqW8JYGvC9RMHZ+8tLf7xNQjZBx4zKwDJHVL/Kj8Y8w=', -- kico123
                        'Kristi Admin',
                        NULL,
                        NULL,
                        1,
                        GETUTCDATE()
                    );
                    
                    -- Get the new user ID
                    SET @UserId = SCOPE_IDENTITY();
                    
                    -- Assign SuperAdmin role
                    INSERT INTO core_user_roles (user_id, role_id)
                    VALUES (@UserId, @SuperAdminRoleId);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove SuperAdmin user
            migrationBuilder.Sql("DELETE FROM core_users WHERE email = 'kristi@gmail.com'");
        }
    }
}
