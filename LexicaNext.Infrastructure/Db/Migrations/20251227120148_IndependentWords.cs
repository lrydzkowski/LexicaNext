using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class IndependentWords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_word_set_set_id",
                table: "word");

            migrationBuilder.DropIndex(
                name: "IX_word_set_id",
                table: "word");

            migrationBuilder.DropColumn(
                name: "order",
                table: "word");

            migrationBuilder.DropColumn(
                name: "set_id",
                table: "word");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "created_at",
                table: "word",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "edited_at",
                table: "word",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "set_word",
                columns: table => new
                {
                    set_id = table.Column<Guid>(type: "uuid", nullable: false),
                    word_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_set_word", x => new { x.set_id, x.word_id });
                    table.ForeignKey(
                        name: "FK_set_word_set_set_id",
                        column: x => x.set_id,
                        principalTable: "set",
                        principalColumn: "set_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_set_word_word_word_id",
                        column: x => x.word_id,
                        principalTable: "word",
                        principalColumn: "word_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_word_created_at",
                table: "word",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_word_edited_at",
                table: "word",
                column: "edited_at");

            migrationBuilder.CreateIndex(
                name: "IX_word_word",
                table: "word",
                column: "word");

            migrationBuilder.CreateIndex(
                name: "IX_word_word_word_type_id",
                table: "word",
                columns: new[] { "word", "word_type_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_set_word_set_id_order",
                table: "set_word",
                columns: new[] { "set_id", "order" });

            migrationBuilder.CreateIndex(
                name: "IX_set_word_word_id",
                table: "set_word",
                column: "word_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "set_word");

            migrationBuilder.DropIndex(
                name: "IX_word_created_at",
                table: "word");

            migrationBuilder.DropIndex(
                name: "IX_word_edited_at",
                table: "word");

            migrationBuilder.DropIndex(
                name: "IX_word_word",
                table: "word");

            migrationBuilder.DropIndex(
                name: "IX_word_word_word_type_id",
                table: "word");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "word");

            migrationBuilder.DropColumn(
                name: "edited_at",
                table: "word");

            migrationBuilder.AddColumn<int>(
                name: "order",
                table: "word",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "set_id",
                table: "word",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_word_set_id",
                table: "word",
                column: "set_id");

            migrationBuilder.AddForeignKey(
                name: "FK_word_set_set_id",
                table: "word",
                column: "set_id",
                principalTable: "set",
                principalColumn: "set_id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
