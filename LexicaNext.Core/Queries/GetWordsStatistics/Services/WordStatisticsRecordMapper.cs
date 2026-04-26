using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;

namespace LexicaNext.Core.Queries.GetWordsStatistics.Services;

public interface IWordStatisticsRecordMapper
{
    ListInfo<WordStatisticsRecordDto> Map(ListInfo<WordStatisticsRecord> listInfo);

    List<WordStatisticsRecordDto> Map(List<WordStatisticsRecord> records);

    WordStatisticsRecordDto Map(WordStatisticsRecord record);
}

internal class WordStatisticsRecordMapper
    : ISingletonService, IWordStatisticsRecordMapper
{
    public ListInfo<WordStatisticsRecordDto> Map(ListInfo<WordStatisticsRecord> listInfo)
    {
        return new ListInfo<WordStatisticsRecordDto>
        {
            Count = listInfo.Count,
            Data = Map(listInfo.Data)
        };
    }

    public List<WordStatisticsRecordDto> Map(List<WordStatisticsRecord> records)
    {
        return records.Select(Map).ToList();
    }

    public WordStatisticsRecordDto Map(WordStatisticsRecord record)
    {
        return new WordStatisticsRecordDto
        {
            WordId = record.WordId,
            Word = record.Word,
            CorrectCount = record.CorrectCount,
            IncorrectCount = record.IncorrectCount
        };
    }
}
