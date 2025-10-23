using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SecureAuth.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TenantId = table.Column<int>(type: "integer", nullable: false),
                    BrandColorPrimary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    BrandColorSecondary = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    WidgetPosition = table.Column<string>(type: "text", nullable: false),
                    ChatTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    WelcomeMessage = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    AutoOpen = table.Column<bool>(type: "boolean", nullable: false),
                    AutoOpenDelaySeconds = table.Column<int>(type: "integer", nullable: false),
                    ShowTypingIndicator = table.Column<bool>(type: "boolean", nullable: false),
                    EnableSoundNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    AllowedDomains = table.Column<string[]>(type: "text[]", nullable: false),
                    RequireAuth = table.Column<bool>(type: "boolean", nullable: false),
                    WidgetSize = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    Timezone = table.Column<string>(type: "text", nullable: false),
                    CustomCss = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantSettings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantSettings_TenantId",
                table: "TenantSettings",
                column: "TenantId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantSettings");
        }
    }
}
