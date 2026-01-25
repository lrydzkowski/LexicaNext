using LexicaNext.Core.Commands.UpdateWord.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateWord.Services;

public interface IUpdateWordCommandMapper
{
    UpdateWordCommand Map(string userId, UpdateWordRequest request);
}

internal class UpdateWordCommandMapper
    : ISingletonService, IUpdateWordCommandMapper
{
    private readonly IWordTypeMapper _wordTypeMapper;

    public UpdateWordCommandMapper(IWordTypeMapper wordTypeMapper)
    {
        _wordTypeMapper = wordTypeMapper;
    }

    public UpdateWordCommand Map(string userId, UpdateWordRequest request)
    {
        return new UpdateWordCommand
        {
            WordId = Guid.Parse(request.WordId),
            UserId = userId,
            Word = request.Payload?.Word?.Trim() ?? "",
            WordType = _wordTypeMapper.Map(request.Payload?.WordType),
            Translations = request.Payload?.Translations?.Select(t => t.Trim()).ToList() ?? [],
            ExampleSentences = request.Payload?.ExampleSentences?
                                   .Select(
                                       (sentence, index) => new ExampleSentence
                                           { Sentence = sentence.Trim(), Order = index }
                                   )
                                   .ToList()
                               ?? []
        };
    }
}
