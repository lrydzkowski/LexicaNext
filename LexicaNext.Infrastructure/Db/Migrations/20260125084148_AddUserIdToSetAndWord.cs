using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToSetAndWord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "user_id",
                table: "word",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "user_id",
                table: "set",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_word_user_id",
                table: "word",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_set_user_id",
                table: "set",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_word_user_id",
                table: "word");

            migrationBuilder.DropIndex(
                name: "IX_set_user_id",
                table: "set");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "word");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "set");
        }
    }
}
