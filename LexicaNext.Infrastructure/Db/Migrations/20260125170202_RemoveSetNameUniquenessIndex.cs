using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSetNameUniquenessIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_set_user_id_name",
                table: "set");

            migrationBuilder.CreateIndex(
                name: "IX_set_user_id_name",
                table: "set",
                columns: new[] { "user_id", "name" })
                .Annotation("Npgsql:NullsDistinct", true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_set_user_id_name",
                table: "set");

            migrationBuilder.CreateIndex(
                name: "IX_set_user_id_name",
                table: "set",
                columns: new[] { "user_id", "name" },
                unique: true)
                .Annotation("Npgsql:NullsDistinct", true);
        }
    }
}
