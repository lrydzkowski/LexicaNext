using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class Init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "set",
                columns: table => new
                {
                    set_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_set", x => x.set_id);
                });

            migrationBuilder.CreateTable(
                name: "word_type",
                columns: table => new
                {
                    word_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_word_type", x => x.word_type_id);
                });

            migrationBuilder.CreateTable(
                name: "recording",
                columns: table => new
                {
                    recording_id = table.Column<Guid>(type: "uuid", nullable: false),
                    word = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    word_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    file_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_recording", x => x.recording_id);
                    table.ForeignKey(
                        name: "FK_recording_word_type_word_type_id",
                        column: x => x.word_type_id,
                        principalTable: "word_type",
                        principalColumn: "word_type_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "word",
                columns: table => new
                {
                    word_id = table.Column<Guid>(type: "uuid", nullable: false),
                    word = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    word_type_id = table.Column<Guid>(type: "uuid", nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    set_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_word", x => x.word_id);
                    table.ForeignKey(
                        name: "FK_word_set_set_id",
                        column: x => x.set_id,
                        principalTable: "set",
                        principalColumn: "set_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_word_word_type_word_type_id",
                        column: x => x.word_type_id,
                        principalTable: "word_type",
                        principalColumn: "word_type_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "translation",
                columns: table => new
                {
                    translation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    translation = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    order = table.Column<int>(type: "integer", nullable: false),
                    word_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_translation", x => x.translation_id);
                    table.ForeignKey(
                        name: "FK_translation_word_word_id",
                        column: x => x.word_id,
                        principalTable: "word",
                        principalColumn: "word_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "word_type",
                columns: new[] { "word_type_id", "name" },
                values: new object[,]
                {
                    { new Guid("0196294e-9a78-735e-9186-2607dbb3e33a"), "None" },
                    { new Guid("0196294e-9a78-73b5-947e-fb739d73808c"), "Noun" },
                    { new Guid("0196294e-9a78-74d8-8430-4ebdfd46cf68"), "Verb" },
                    { new Guid("0196294e-9a78-7573-9db1-47b3d0ee9eae"), "Adjective" },
                    { new Guid("0196294e-9a78-7e0a-b3b2-9c653699e41e"), "Adverb" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_recording_word_type_id",
                table: "recording",
                column: "word_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_set_name",
                table: "set",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_translation_word_id",
                table: "translation",
                column: "word_id");

            migrationBuilder.CreateIndex(
                name: "IX_word_set_id",
                table: "word",
                column: "set_id");

            migrationBuilder.CreateIndex(
                name: "IX_word_word_type_id",
                table: "word",
                column: "word_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_word_type_name",
                table: "word_type",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "recording");

            migrationBuilder.DropTable(
                name: "translation");

            migrationBuilder.DropTable(
                name: "word");

            migrationBuilder.DropTable(
                name: "set");

            migrationBuilder.DropTable(
                name: "word_type");
        }
    }
}
