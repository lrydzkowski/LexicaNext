using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace LexicaNext.WebApp.Tests.Integration.Common.Data;

internal class TestContextScope : IAsyncDisposable
{
    public TestContextScope(WebApplicationFactory<Program> webApiFactory, LogMessages logMessages)
    {
        ServiceScope = webApiFactory.Services.CreateScope();
        LogMessages = logMessages;
    }

    private IServiceScope ServiceScope { get; }

    public LogMessages LogMessages { get; }

    public ValueTask DisposeAsync()
    {
        LogMessages.Clear();
        ServiceScope.Dispose();

        return ValueTask.CompletedTask;
    }

    public TService GetRequiredService<TService>() where TService : notnull
    {
        return ServiceScope.ServiceProvider.GetRequiredService<TService>();
    }
}
