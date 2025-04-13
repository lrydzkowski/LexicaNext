using LexicaNext.Core.Commands.UpdateSet.Models;
using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Commands.UpdateSet.Services;

public interface IUpdateSetCommandMapper
{
    UpdateSetCommand Map(UpdateSetRequest request);

    List<Entry> Map(List<EntryDto> entryDtos);

    Entry Map(EntryDto entryDto);
}

internal class UpdateSetCommandMapper
    : ISingletonService, IUpdateSetCommandMapper
{
    private readonly IWordTypeMapper _wordTypeMapper;

    public UpdateSetCommandMapper(IWordTypeMapper wordTypeMapper)
    {
        _wordTypeMapper = wordTypeMapper;
    }

    public UpdateSetCommand Map(UpdateSetRequest request)
    {
        return new UpdateSetCommand
        {
            SetId = Guid.Parse(request.SetId),
            SetName = request.Payload?.SetName.Trim() ?? "",
            Entries = Map(request.Payload?.Entries ?? [])
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
