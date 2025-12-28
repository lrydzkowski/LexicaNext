using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetSet.Services;

public interface ISetMapper
{
    GetSetResponse Map(Set set);

    List<EntryDto> Map(List<Entry> entries);

    EntryDto Map(Entry entry);
}

internal class SetMapper
    : ISingletonService, ISetMapper
{
    private readonly IWordTypeMapper _wordTypeMapper;

    public SetMapper(IWordTypeMapper wordTypeMapper)
    {
        _wordTypeMapper = wordTypeMapper;
    }

    public GetSetResponse Map(Set set)
    {
        return new GetSetResponse
        {
            SetId = set.SetId,
            Name = set.Name,
            Entries = Map(set.Entries),
            CreatedAt = set.CreatedAt
        };
    }

    public List<EntryDto> Map(List<Entry> entries)
    {
        return entries.Select(Map).ToList();
    }

    public EntryDto Map(Entry entry)
    {
        return new EntryDto
        {
            WordId = entry.WordId,
            Word = entry.Word,
            WordType = _wordTypeMapper.Map(entry.WordType),
            Translations = entry.Translations,
            ExampleSentences = entry.ExampleSentences.Select(s => s.Sentence).ToList()
        };
    }
}
