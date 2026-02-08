using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class DropTestTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "test");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "test",
                columns: table => new
                {
                    test_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_test", x => x.test_id);
                });
        }
    }
}
