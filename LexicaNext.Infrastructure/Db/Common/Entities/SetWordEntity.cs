namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class SetWordEntity
{
    public const string TableName = "set_word";

    public Guid SetId { get; set; }

    public SetEntity? Set { get; set; }

    public Guid WordId { get; set; }

    public WordEntity? Word { get; set; }

    public int Order { get; set; }
}
