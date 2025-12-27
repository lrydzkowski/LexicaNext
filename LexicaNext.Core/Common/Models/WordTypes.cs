using LexicaNext.Core.Common.Infrastructure.Extensions;

namespace LexicaNext.Core.Common.Models;

internal static class WordTypes
{
    public const string None = "none";
    public const string Noun = "noun";
    public const string Verb = "verb";
    public const string Adjective = "adjective";
    public const string Adverb = "adverb";
    public const string Other = "other";

    public static readonly IReadOnlyList<string> All =
    [
        None,
        Noun,
        Verb,
        Adjective,
        Adverb,
        Other
    ];

    public static bool IsCorrect(string? sortingOrder)
    {
        return sortingOrder is not null && All.ContainsIgnoreCase(sortingOrder);
    }

    public static string Serialize()
    {
        return $"'{string.Join("', '", All)}'";
    }
}
