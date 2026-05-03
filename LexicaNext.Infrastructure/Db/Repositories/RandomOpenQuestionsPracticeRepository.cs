using LexicaNext.Core.Common.Infrastructure.Interfaces;
using LexicaNext.Core.Common.Models;
using LexicaNext.Core.Queries.GetRandomOpenQuestionsPracticeEntries.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.Infrastructure.Db.Repositories;

internal class RandomOpenQuestionsPracticeRepository
    : IScopedService, IGetRandomOpenQuestionsPracticeEntriesRepository
{
    private readonly AppDbContext _dbContext;

    public RandomOpenQuestionsPracticeRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Entry>> GetRandomEntriesAsync(
        string userId,
        int count,
        CancellationToken cancellationToken = default
    )
    {
        if (count <= 0)
        {
            return [];
        }

        List<Entry> entries = await _dbContext.Words.AsNoTracking()
            .Where(
                word => word.UserId == userId
                        && _dbContext.SetWords.Any(
                            setWord => setWord.WordId == word.WordId
                                       && setWord.Set != null
                                       && setWord.Set.UserId == userId
                        )
            )
            .OrderBy(_ => EF.Functions.Random())
            .Take(count)
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
            .ToListAsync(cancellationToken);

        return entries;
    }

    private static WordType MapWordType(string wordTypeName)
    {
        bool parsingResult = Enum.TryParse(wordTypeName, out WordType wordType);

        return !parsingResult ? WordType.None : wordType;
    }
}
