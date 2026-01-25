namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class SetEntity
{
    public const string TableName = "set";

    public Guid SetId { get; set; }

    public string UserId { get; set; } = "";

    public string Name { get; set; } = "";

    public DateTimeOffset CreatedAt { get; set; }

    public ICollection<SetWordEntity> SetWords { get; set; } = [];
}
