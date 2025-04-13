namespace LexicaNext.Infrastructure.EnglishDictionary.Options;

internal class EnglishDictionaryOptions
{
    public const string Position = "EnglishDictionary";

    public string BaseUrl { get; init; } = "";

    public string Path { get; init; } = "";
}
