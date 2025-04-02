using LexicaNext.Core.Commands.CreateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.CreateSet.Services;

public interface ICreateSetCommandMapper
{
    CreateSetCommand Map(CreateSetRequest request);

    List<Entry> Map(List<EntryDto> entryDtos);

    Entry Map(EntryDto entryDto);
}

internal class CreateSetCommandMapper
    : ISingletonService, ICreateSetCommandMapper
{
    private readonly IWordTypeMapper _wordTypeMapper;

    public CreateSetCommandMapper(IWordTypeMapper wordTypeMapper)
    {
        _wordTypeMapper = wordTypeMapper;
    }

    public CreateSetCommand Map(CreateSetRequest request)
    {
        return new CreateSetCommand
        {
            SetName = request.SetName.Trim(),
            Entries = Map(request.Entries)
        };
    }

    public List<Entry> Map(List<EntryDto> entryDtos)
    {
        return entryDtos.Select(Map).ToList();
    }

    public Entry Map(EntryDto entryDto)
    {
        return new Entry
        {
            Word = entryDto.Word.Trim(),
            WordType = _wordTypeMapper.Map(entryDto.WordType),
            Translations = entryDto.Translations.Select(translation => translation.Trim()).ToList()
        };
    }
}
