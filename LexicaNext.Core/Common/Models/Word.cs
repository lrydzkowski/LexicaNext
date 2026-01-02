namespace LexicaNext.Core.Common.Models;

public class Word
{
    public Guid WordId { get; init; }

    public string Text { get; init; } = "";

    public WordType WordType { get; init; } = WordType.None;

    public List<string> Translations { get; init; } = [];

    public List<ExampleSentence> ExampleSentences { get; init; } = [];

    public DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset? EditedAt { get; init; }
}
