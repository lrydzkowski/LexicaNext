namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class TestEntity
{
    public const string TableName = "test";

    public Guid TestId { get; set; }

    public string Name { get; set; } = "";
}
