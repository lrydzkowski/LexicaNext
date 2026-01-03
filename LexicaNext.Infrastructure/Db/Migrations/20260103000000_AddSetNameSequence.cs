using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LexicaNext.Infrastructure.Db.Migrations
{
    public partial class AddSetNameSequence : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_set_name",
                table: "set");

            migrationBuilder.Sql("CREATE SEQUENCE set_name_sequence START WITH 1;");

            migrationBuilder.Sql("CREATE UNIQUE INDEX ix_set_name_lower ON set (LOWER(name));");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX ix_set_name_lower;");

            migrationBuilder.Sql("DROP SEQUENCE set_name_sequence;");

            migrationBuilder.CreateIndex(
                name: "IX_set_name",
                table: "set",
                column: "name",
                unique: true);
        }
    }
}
