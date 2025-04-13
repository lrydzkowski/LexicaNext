namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class TranslationEntity
{
    public const string TableName = "translation";

    public Guid TranslationId { get; set; }

    public string Translation { get; set; } = "";

    public int Order { get; set; }

    public Guid WordId { get; set; }

    public WordEntity? Word { get; set; }
}
