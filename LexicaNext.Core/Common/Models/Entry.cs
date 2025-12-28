namespace LexicaNext.Core.Common.Models;

public class Entry
{
    public Guid WordId { get; init; }

    public string Word { get; init; } = "";

    public WordType WordType { get; init; } = WordType.None;

    public List<string> Translations { get; init; } = [];

    public List<ExampleSentence> ExampleSentences { get; init; } = [];
}
