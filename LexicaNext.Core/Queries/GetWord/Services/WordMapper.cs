using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWord.Services;

public interface IWordMapper
{
    GetWordResponse Map(Word word);
}

internal class WordMapper
    : ISingletonService, IWordMapper
{
    private readonly IWordTypeMapper _wordTypeMapper;

    public WordMapper(IWordTypeMapper wordTypeMapper)
    {
        _wordTypeMapper = wordTypeMapper;
    }

    public GetWordResponse Map(Word word)
    {
        return new GetWordResponse
        {
            WordId = word.WordId,
            Word = word.Text,
            WordType = _wordTypeMapper.Map(word.WordType),
            Translations = word.Translations,
            ExampleSentences = word.ExampleSentences.Select(s => s.Sentence).ToList(),
            CreatedAt = word.CreatedAt,
            EditedAt = word.EditedAt
        };
    }
}
