using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToAnswer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "user_id",
                table: "answer",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_answer_user_id",
                table: "answer",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_answer_user_id",
                table: "answer");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "answer");
        }
    }
}
