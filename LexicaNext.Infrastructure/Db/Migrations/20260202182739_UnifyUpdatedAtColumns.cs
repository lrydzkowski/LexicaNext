using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class UnifyUpdatedAtColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "edited_at",
                table: "word",
                newName: "updated_at");

            migrationBuilder.RenameIndex(
                name: "IX_word_edited_at",
                table: "word",
                newName: "IX_word_updated_at");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "updated_at",
                table: "set",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "set");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "word",
                newName: "edited_at");

            migrationBuilder.RenameIndex(
                name: "IX_word_updated_at",
                table: "word",
                newName: "IX_word_edited_at");
        }
    }
}
