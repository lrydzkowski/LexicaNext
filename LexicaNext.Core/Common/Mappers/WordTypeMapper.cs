using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Common.Mappers;

public interface IWordTypeMapper
{
    WordType Map(string wordType);

    string Map(WordType wordType);
}

internal class WordTypeMapper
    : ISingletonService, IWordTypeMapper
{
    public WordType Map(string wordType)
    {
        return wordType switch
        {
            "noun" => WordType.Noun,
            "verb" => WordType.Verb,
            "adjective" => WordType.Adjective,
            "adverb" => WordType.Adverb,
            _ => WordType.None
        };
    }

    public string Map(WordType wordType)
    {
        return wordType switch
        {
            WordType.Noun => "noun",
            WordType.Verb => "verb",
            WordType.Adjective => "adjective",
            WordType.Adverb => "adverb",
            _ => "none"
        };
    }
}
