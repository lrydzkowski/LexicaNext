using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class AddExampleSentences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "example_sentence",
                columns: table => new
                {
                    example_sentence_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sentence = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    word_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_example_sentence", x => x.example_sentence_id);
                    table.ForeignKey(
                        name: "FK_example_sentence_word_word_id",
                        column: x => x.word_id,
                        principalTable: "word",
                        principalColumn: "word_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_example_sentence_word_id",
                table: "example_sentence",
                column: "word_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "example_sentence");
        }
    }
}
