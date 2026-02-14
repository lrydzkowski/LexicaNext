using LexicaNext.Infrastructure.Db;
using Microsoft.EntityFrameworkCore;

namespace LexicaNext.WebApp.Tests.Integration.Common.Data.Db;

internal class ContextScope : IDisposable
{
    public ContextScope(AppDbContext context)
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

    private void RemoveData(string tableName)
    {
#pragma warning disable EF1003
        Context.Database.ExecuteSqlRaw("DELETE FROM \"" + tableName + "\"");
#pragma warning restore EF1003
    }
}
