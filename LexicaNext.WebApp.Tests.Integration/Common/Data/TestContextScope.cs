using LexicaNext.Infrastructure.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Data.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.WebApp.Tests.Integration.Common.Data;

internal class TestContextScope : IAsyncDisposable
{
    public TestContextScope(WebApplicationFactory<Program> webApiFactory, LogMessages logMessages)
    {
        ServiceScope = webApiFactory.Services.CreateScope();
        LogMessages = logMessages;
        Db = new ContextScope(GetRequiredService<AppDbContext>());
    }

    private IServiceScope ServiceScope { get; }

    public LogMessages LogMessages { get; }

    public ContextScope Db { get; }

    public ValueTask DisposeAsync()
    {
        Db.Dispose();
        LogMessages.Clear();
        ServiceScope.Dispose();

        return ValueTask.CompletedTask;
    }

    public async Task SeedDataAsync(ITestCaseData testCase)
    {
        AppDbContext context = Db.Context;

        if (testCase.Data.Db.Words.Count > 0)
        {
            await context.CreateWordsAsync(testCase.Data.Db.Words);
        }

        if (testCase.Data.Db.Translations.Count > 0)
        {
            await context.CreateTranslationsAsync(testCase.Data.Db.Translations);
        }

        if (testCase.Data.Db.ExampleSentences.Count > 0)
        {
            await context.CreateExampleSentencesAsync(testCase.Data.Db.ExampleSentences);
        }

        if (testCase.Data.Db.Sets.Count > 0)
        {
            await context.CreateSetsAsync(testCase.Data.Db.Sets);
        }

        if (testCase.Data.Db.SetWords.Count > 0)
        {
            await context.CreateSetWordsAsync(testCase.Data.Db.SetWords);
        }

        if (testCase.Data.Db.Recordings.Count > 0)
        {
            await context.CreateRecordingsAsync(testCase.Data.Db.Recordings);
        }

        if (testCase.Data.Db.Answers.Count > 0)
        {
            await context.CreateAnswersAsync(testCase.Data.Db.Answers);
        }

        if (testCase.Data.Db.UserSetSequences.Count > 0)
        {
            await context.CreateUserSetSequencesAsync(testCase.Data.Db.UserSetSequences);
        }
    }

    public TService GetRequiredService<TService>() where TService : notnull
    {
        return ServiceScope.ServiceProvider.GetRequiredService<TService>();
    }
}
