using LexicaNext.Infrastructure.Db;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Db;

internal class DbContextScope : IDisposable
{
    public DbContextScope(AppDbContext context)
    {
        Context = context;
    }

    public AppDbContext Context { get; }

    public void Dispose()
    {
        RemoveData("set_word");
        RemoveData("translation");
        RemoveData("example_sentence");
        RemoveData("set");
        RemoveData("word");
        RemoveData("recording");
        RemoveData("answer");
        RemoveData("user_set_sequence");
    }

    public async Task InitializeAsync(ITestCaseData testCase)
    {
        if (testCase.Data.Db.Words.Count > 0)
        {
            await Context.CreateWordsAsync(testCase.Data.Db.Words);
        }

        if (testCase.Data.Db.Translations.Count > 0)
        {
            await Context.CreateTranslationsAsync(testCase.Data.Db.Translations);
        }

        if (testCase.Data.Db.ExampleSentences.Count > 0)
        {
            await Context.CreateExampleSentencesAsync(testCase.Data.Db.ExampleSentences);
        }

        if (testCase.Data.Db.Sets.Count > 0)
        {
            await Context.CreateSetsAsync(testCase.Data.Db.Sets);
        }

        if (testCase.Data.Db.SetWords.Count > 0)
        {
            await Context.CreateSetWordsAsync(testCase.Data.Db.SetWords);
        }

        if (testCase.Data.Db.Recordings.Count > 0)
        {
            await Context.CreateRecordingsAsync(testCase.Data.Db.Recordings);
        }

        if (testCase.Data.Db.Answers.Count > 0)
        {
            await Context.CreateAnswersAsync(testCase.Data.Db.Answers);
        }

        if (testCase.Data.Db.UserSetSequences.Count > 0)
        {
            await Context.CreateUserSetSequencesAsync(testCase.Data.Db.UserSetSequences);
        }
    }

    private void RemoveData(string tableName)
    {
#pragma warning disable EF1003
        Context.Database.ExecuteSqlRaw("DELETE FROM \"" + tableName + "\"");
#pragma warning restore EF1003
    }
}
