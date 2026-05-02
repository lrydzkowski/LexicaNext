using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetWeakestOpenQuestionsPracticeEntries.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class WeakestOpenQuestionsPracticeRepository
    : IScopedService, IGetWeakestOpenQuestionsPracticeEntriesRepository
{
    private const string OpenQuestionsModeType = "open-questions";

    private readonly AppDbContext _dbContext;

    public WeakestOpenQuestionsPracticeRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Entry>> GetWeakestEntriesAsync(
        string userId,
        int count,
        CancellationToken cancellationToken = default
    )
    {
        if (count <= 0)
        {
            return [];
        }

        var aggregates = await _dbContext.Answers.AsNoTracking()
            .Where(answer => answer.UserId == userId && answer.ModeType == OpenQuestionsModeType)
            .GroupBy(answer => answer.WordId)
            .Select(
                group => new
                {
                    WordId = group.Key,
                    CorrectCount = group.Count(x => x.IsCorrect),
                    IncorrectCount = group.Count(x => !x.IsCorrect)
                }
            )
            .ToListAsync(cancellationToken);

        List<Guid> orderedWordIds = aggregates
            .Where(a => a.CorrectCount + a.IncorrectCount > 0)
            .OrderByDescending(a => (double)a.IncorrectCount / (a.CorrectCount + a.IncorrectCount))
            .ThenByDescending(a => a.IncorrectCount)
            .Take(count)
            .Select(a => a.WordId)
            .ToList();

        if (orderedWordIds.Count == 0)
        {
            return [];
        }

        Dictionary<Guid, Entry> entriesByWordId = await _dbContext.Words.AsNoTracking()
            .Where(word => word.UserId == userId && orderedWordIds.Contains(word.WordId))
            .Select(
                word => new Entry
                {
                    WordId = word.WordId,
                    Word = word.Word,
                    WordType = MapWordType(word.WordType!.Name),
                    Translations = word.Translations.OrderBy(t => t.Order).Select(t => t.Translation).ToList(),
                    ExampleSentences = word.ExampleSentences.OrderBy(s => s.Order)
                        .Select(s => new ExampleSentence { Sentence = s.Sentence, Order = s.Order })
                        .ToList()
                }
            )
            .ToDictionaryAsync(entry => entry.WordId, cancellationToken);

        List<Entry> entries = orderedWordIds
            .Where(entriesByWordId.ContainsKey)
            .Select(wordId => entriesByWordId[wordId])
            .ToList();

        return entries;
    }

    private static WordType MapWordType(string wordTypeName)
    {
        bool parsingResult = Enum.TryParse(wordTypeName, out WordType wordType);

        return !parsingResult ? WordType.None : wordType;
    }
}
