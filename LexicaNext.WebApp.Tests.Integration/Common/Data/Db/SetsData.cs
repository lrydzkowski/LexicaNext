using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.WebApp.Tests.Integration.Common.Data.Db;

internal static class SetsData
{
    public static async Task CreateSetsAsync(this AppDbContext context, IEnumerable<SetEntity> sets)
    {
        context.Sets.AddRange(sets);
        await context.SaveChangesAsync();
    }

    public static async Task CreateSetWordsAsync(
        this AppDbContext context,
        IEnumerable<SetWordEntity> setWords
    )
    {
        context.SetWords.AddRange(setWords);
        await context.SaveChangesAsync();
    }

    public static async Task CreateUserSetSequencesAsync(
        this AppDbContext context,
        IEnumerable<UserSetSequenceEntity> sequences
    )
    {
        context.UserSetSequences.AddRange(sequences);
        await context.SaveChangesAsync();
    }

    public static async Task<List<SetEntity>> GetSetsAsync(this AppDbContext context)
    {
        return await context.Sets
            .Include(s => s.SetWords)
            .OrderBy(s => s.CreatedAt)
            .AsNoTracking()
            .ToListAsync();
    }
}
