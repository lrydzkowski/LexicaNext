namespace LexicaNext.Core.Common.Models;

public class WordStatisticsRecord
{
    public Guid WordId { get; init; }

    public string Word { get; init; } = "";

    public int CorrectCount { get; init; }

    public int IncorrectCount { get; init; }
}
