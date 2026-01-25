using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWordUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_word_word_word_type_id",
                table: "word");

            migrationBuilder.CreateIndex(
                name: "IX_word_user_id_word_word_type_id",
                table: "word",
                columns: new[] { "user_id", "word", "word_type_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_word_user_id_word_word_type_id",
                table: "word");

            migrationBuilder.CreateIndex(
                name: "IX_word_word_word_type_id",
                table: "word",
                columns: new[] { "word", "word_type_id" },
                unique: true);
        }
    }
}
