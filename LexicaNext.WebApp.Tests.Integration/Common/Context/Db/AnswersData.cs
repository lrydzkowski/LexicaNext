using LexicaNext.Infrastructure.Db;
using LexicaNext.Infrastructure.Db.Common.Entities;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Db;

internal static class AnswersData
{
    public static async Task CreateAnswersAsync(
        this AppDbContext context,
        IEnumerable<AnswerEntity> answers
    )
    {
        context.Answers.AddRange(answers);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);
    }

    public static async Task<List<AnswerEntity>> GetAnswersAsync(this AppDbContext context)
    {
        return await context.Answers
            .AsNoTracking()
            .ToListAsync(TestContext.Current.CancellationToken);
    }
}
