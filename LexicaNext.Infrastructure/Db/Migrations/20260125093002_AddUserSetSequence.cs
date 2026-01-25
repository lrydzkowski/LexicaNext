using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSetSequence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "user_set_sequence",
                columns: table => new
                {
                    user_set_sequence_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    next_value = table.Column<int>(type: "integer", nullable: false, defaultValue: 1),
                    last_updated = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_set_sequence", x => x.user_set_sequence_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_set_sequence_user_id",
                table: "user_set_sequence",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_set_sequence");
        }
    }
}
