using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWordsStatistics.Interfaces;
using LexicaNext.Infrastructure.Db.Extensions;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class WordsStatisticsRepository
    : IScopedService, IGetWordsStatisticsRepository
{
    private const string OpenQuestionsModeType = "open-questions";

    private readonly AppDbContext _dbContext;

    public WordsStatisticsRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ListInfo<WordStatisticsRecord>> GetWordsStatisticsAsync(
        string userId,
        ListParameters listParameters,
        CancellationToken cancellationToken = default
    )
    {
        string defaultSortingFieldName = "incorrectCount";
        SortingOrder defaultSortingOrder = SortingOrder.Descending;
        List<string> fieldsAvailableToSort = ["word", "correctCount", "incorrectCount"];
        List<string> fieldsAvailableToFilter = ["word"];

        var aggregates = _dbContext.Answers.AsNoTracking()
            .Where(a => a.UserId == userId && a.ModeType == OpenQuestionsModeType)
            .GroupBy(a => a.WordId)
            .Select(
                g => new
                {
                    WordId = g.Key,
                    CorrectCount = g.Count(x => x.IsCorrect),
                    IncorrectCount = g.Count(x => !x.IsCorrect)
                }
            );

        IQueryable<WordStatisticsRecord> query = aggregates
            .Join(
                _dbContext.Words.AsNoTracking().Where(w => w.UserId == userId),
                s => s.WordId,
                w => w.WordId,
                (s, w) => new WordStatisticsRecord
                {
                    WordId = w.WordId,
                    Word = w.Word,
                    CorrectCount = s.CorrectCount,
                    IncorrectCount = s.IncorrectCount
                }
            )
            .Sort(fieldsAvailableToSort, listParameters.Sorting, defaultSortingFieldName, defaultSortingOrder)
            .Filter(fieldsAvailableToFilter, listParameters.Search);

        int count = await query.CountAsync(cancellationToken);
        List<WordStatisticsRecord> data = await query
            .Paginate(listParameters.Pagination)
            .ToListAsync(cancellationToken);

        return new ListInfo<WordStatisticsRecord>
        {
            Count = count,
            Data = data
        };
    }
}
