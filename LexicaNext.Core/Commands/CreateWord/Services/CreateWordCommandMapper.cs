using LexicaNext.Core.Commands.CreateWord.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateWord.Services;

public interface ICreateWordCommandMapper
{
    CreateWordCommand Map(CreateWordRequest request);
}

internal class CreateWordCommandMapper
    : ISingletonService, ICreateWordCommandMapper
{
    private readonly IWordTypeMapper _wordTypeMapper;

    public CreateWordCommandMapper(IWordTypeMapper wordTypeMapper)
    {
        _wordTypeMapper = wordTypeMapper;
    }

    public CreateWordCommand Map(CreateWordRequest request)
    {
        return new CreateWordCommand
        {
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
