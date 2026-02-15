using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.WebApp.Tests.Integration.Common.Data.Db;

internal static class WordsData
{
    public static async Task CreateWordsAsync(this AppDbContext context, IEnumerable<WordEntity> words)
    {
        context.Words.AddRange(words);
        await context.SaveChangesAsync();
    }

    public static async Task CreateTranslationsAsync(
        this AppDbContext context,
        IEnumerable<TranslationEntity> translations
    )
    {
        context.Translations.AddRange(translations);
        await context.SaveChangesAsync();
    }

    public static async Task CreateExampleSentencesAsync(
        this AppDbContext context,
        IEnumerable<ExampleSentenceEntity> exampleSentences
    )
    {
        context.ExampleSentences.AddRange(exampleSentences);
        await context.SaveChangesAsync();
    }

    public static async Task CreateRecordingsAsync(
        this AppDbContext context,
        IEnumerable<RecordingEntity> recordings
    )
    {
        context.Recordings.AddRange(recordings);
        await context.SaveChangesAsync();
    }

    public static async Task<List<WordEntity>> GetWordsAsync(this AppDbContext context)
    {
        return await context.Words
            .Include(w => w.Translations.OrderBy(y => y.Order))
            .Include(w => w.ExampleSentences.OrderBy(y => y.Order))
            .AsNoTracking()
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();
    }
}
