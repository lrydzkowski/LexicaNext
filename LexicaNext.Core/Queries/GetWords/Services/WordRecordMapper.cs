using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Mappers;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWords.Services;

public interface IWordRecordMapper
{
    ListInfo<WordRecordDto> Map(ListInfo<WordRecord> listInfo);

    List<WordRecordDto> Map(List<WordRecord> wordRecords);

    WordRecordDto Map(WordRecord record);
}

internal class WordRecordMapper
    : ISingletonService, IWordRecordMapper
{
    private readonly IWordTypeMapper _wordTypeMapper;

    public WordRecordMapper(IWordTypeMapper wordTypeMapper)
    {
        _wordTypeMapper = wordTypeMapper;
    }

    public ListInfo<WordRecordDto> Map(ListInfo<WordRecord> listInfo)
    {
        return new ListInfo<WordRecordDto>
        {
            Count = listInfo.Count,
            Data = Map(listInfo.Data)
        };
    }

    public List<WordRecordDto> Map(List<WordRecord> wordRecords)
    {
        return wordRecords.Select(Map).ToList();
    }

    public WordRecordDto Map(WordRecord record)
    {
        return new WordRecordDto
        {
            WordId = record.WordId,
            Word = record.Text,
            WordType = _wordTypeMapper.Map(record.WordType),
            CreatedAt = record.CreatedAt,
            UpdatedAt = record.UpdatedAt
        };
    }
}
