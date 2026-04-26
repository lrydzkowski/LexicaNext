using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Infrastructure.Lists;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWordsStatistics.Interfaces;
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

        IQueryable<WordStatisticsRecord> baseQuery =
            from s in aggregates
            join w in _dbContext.Words.AsNoTracking() on s.WordId equals w.WordId
            where w.UserId == userId
            select new WordStatisticsRecord
            {
                WordId = w.WordId,
                Word = w.Word,
                CorrectCount = s.CorrectCount,
                IncorrectCount = s.IncorrectCount
            };

        string? searchQuery = listParameters.Search.Query;
        if (!string.IsNullOrWhiteSpace(searchQuery))
        {
            string escaped = searchQuery
                .Replace("\\", "\\\\")
                .Replace("%", "\\%")
                .Replace("_", "\\_");
            string pattern = $"%{escaped}%";
            baseQuery = baseQuery.Where(record => EF.Functions.ILike(record.Word, pattern));
        }

        IQueryable<WordStatisticsRecord> sortedQuery = ApplySorting(baseQuery, listParameters.Sorting);

        int count = await sortedQuery.CountAsync(cancellationToken);

        int page = Math.Max(1, listParameters.Pagination.Page);
        int pageSize = Math.Max(1, listParameters.Pagination.PageSize);
        List<WordStatisticsRecord> data = await sortedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new ListInfo<WordStatisticsRecord>
        {
            Count = count,
            Data = data
        };
    }

    private static IQueryable<WordStatisticsRecord> ApplySorting(
        IQueryable<WordStatisticsRecord> query,
        Sorting sorting
    )
    {
        bool ascending = sorting.Order == SortingOrder.Ascending;
        string fieldName = string.IsNullOrWhiteSpace(sorting.FieldName) ? "incorrectCount" : sorting.FieldName!;

        return fieldName switch
        {
            "correctCount" => ascending
                ? query.OrderBy(record => record.CorrectCount).ThenBy(record => record.Word)
                : query.OrderByDescending(record => record.CorrectCount).ThenBy(record => record.Word),
            "word" => ascending
                ? query.OrderBy(record => record.Word)
                : query.OrderByDescending(record => record.Word),
            _ => ascending
                ? query.OrderBy(record => record.IncorrectCount).ThenBy(record => record.Word)
                : query.OrderByDescending(record => record.IncorrectCount).ThenBy(record => record.Word)
        };
    }
}
