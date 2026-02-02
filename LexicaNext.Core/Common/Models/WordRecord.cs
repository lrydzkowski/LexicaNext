namespace LexicaNext.Core.Common.Models;

public class WordRecord
{
    public Guid WordId { get; init; }

    public string Text { get; init; } = "";

    public WordType WordType { get; init; } = WordType.None;

    public DateTimeOffset CreatedAt { get; init; }

    public DateTimeOffset? UpdatedAt { get; init; }
}
