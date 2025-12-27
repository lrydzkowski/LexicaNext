namespace LexicaNext.Infrastructure.Db.Common.Entities;

internal class ExampleSentenceEntity
{
    public const string TableName = "example_sentence";

    public Guid ExampleSentenceId { get; set; }

    public string Sentence { get; set; } = "";

    public int Order { get; set; }

    public Guid WordId { get; set; }

    public WordEntity? Word { get; set; }
}
