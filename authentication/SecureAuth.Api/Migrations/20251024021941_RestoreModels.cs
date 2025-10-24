using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecureAuth.Api.Migrations
{
    /// <inheritdoc />
    public partial class RestoreModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccentColor",
                table: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "ButtonText",
                table: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "PlaceholderText",
                table: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "ShowBranding",
                table: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "TextColor",
                table: "TenantSettings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccentColor",
                table: "TenantSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ButtonText",
                table: "TenantSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PlaceholderText",
                table: "TenantSettings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "ShowBranding",
                table: "TenantSettings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TextColor",
                table: "TenantSettings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
