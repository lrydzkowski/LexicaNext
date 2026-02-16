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

    public async Task InitializeAppAsync(ITestCaseData testCaseData)
    {
        await Db.SeedDataAsync(testCaseData);
    }

    private TService GetRequiredService<TService>() where TService : notnull
    {
        return ServiceScope.ServiceProvider.GetRequiredService<TService>();
    }
}
