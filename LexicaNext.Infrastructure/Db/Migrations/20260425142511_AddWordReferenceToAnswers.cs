using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class AddWordReferenceToAnswers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "word_id",
                table: "answer",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_answer_word_id",
                table: "answer",
                column: "word_id");

            migrationBuilder.AddForeignKey(
                name: "FK_answer_word_word_id",
                table: "answer",
                column: "word_id",
                principalTable: "word",
                principalColumn: "word_id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_answer_word_word_id",
                table: "answer");

            migrationBuilder.DropIndex(
                name: "IX_answer_word_id",
                table: "answer");

            migrationBuilder.DropColumn(
                name: "word_id",
                table: "answer");
        }
    }
}
