namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class WordEntity
{
    public const string TableName = "word";

    public Guid WordId { get; set; }

    public string Word { get; set; } = "";

    public Guid WordTypeId { get; set; }

    public WordTypeEntity? WordType { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? EditedAt { get; set; }

    public ICollection<TranslationEntity> Translations { get; set; } = [];

    public ICollection<ExampleSentenceEntity> ExampleSentences { get; set; } = [];

    public ICollection<SetWordEntity> SetWords { get; set; } = [];
}
