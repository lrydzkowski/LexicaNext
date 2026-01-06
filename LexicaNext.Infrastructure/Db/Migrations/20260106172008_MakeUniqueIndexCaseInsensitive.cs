using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class MakeUniqueIndexCaseInsensitive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_set_name",
                table: "set");

            migrationBuilder.Sql("CREATE UNIQUE INDEX \"IX_set_name\" ON set (LOWER(name)) NULLS NOT DISTINCT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_set_name",
                table: "set");

            migrationBuilder.CreateIndex(
                name: "IX_set_name",
                table: "set",
                column: "name",
                unique: true);
        }
    }
}
