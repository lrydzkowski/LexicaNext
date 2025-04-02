namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class WordEntity
{
    public const string TableName = "word";

    public Guid WordId { get; set; }

    public string Word { get; set; } = "";

    public Guid WordTypeId { get; set; }

    public WordTypeEntity? WordType { get; set; }

    public int Order { get; set; }

    public Guid SetId { get; set; }

    public SetEntity? Set { get; set; }

    public ICollection<TranslationEntity> Translations { get; set; } = [];
}
