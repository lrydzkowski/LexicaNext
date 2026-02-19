using LexicaNext.Infrastructure.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Context.Db;
using LexicaNext.WebApp.Tests.Integration.Common.Context.Services;
using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using WireMock.Server;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context;

internal class TestContextScope : IAsyncDisposable
{
    private readonly WireMockServer? _wireMockServer;

    public TestContextScope(
        WebApplicationFactory<Program> factory,
        LogMessages logMessages,
        WireMockServer? wireMockServer = null
    )
    {
        Factory = factory;
        LogMessages = logMessages;
        _wireMockServer = wireMockServer;
    }

    private IServiceScope? ServiceScope { get; set; }

    public WebApplicationFactory<Program> Factory { get; private set; }

    public LogMessages LogMessages { get; }

    public DbContextScope? Db { get; private set; }

    public RecordingStorageContextScope? RecordingStorage { get; private set; }

    public ValueTask DisposeAsync()
    {
        Db?.Dispose();
        LogMessages.Clear();
        ServiceScope?.Dispose();

        return ValueTask.CompletedTask;
    }

    public async Task InitializeAsync(ITestCaseData testCaseData)
    {
        UserContextScope userContext = new(Factory);
        await userContext.InitializeAsync(testCaseData);
        Factory = userContext.Factory;

        AiServiceContextScope aiService = new(Factory);
        await aiService.InitializeAsync(testCaseData);
        Factory = aiService.Factory;

        if (_wireMockServer is not null)
        {
            EnglishDictionaryApiContextScope englishDictionaryApi = new(Factory, _wireMockServer);
            await englishDictionaryApi.InitializeAsync(testCaseData);
            Factory = englishDictionaryApi.Factory;
        }

        RecordingStorage = new RecordingStorageContextScope(Factory);
        await RecordingStorage.InitializeAsync(testCaseData);
        Factory = RecordingStorage.Factory;

        ServiceScope = Factory.Services.CreateScope();
        Db = new DbContextScope(GetRequiredService<AppDbContext>());

        await Db.SeedDataAsync(testCaseData);
    }

    private TService GetRequiredService<TService>() where TService : notnull
    {
        return ServiceScope!.ServiceProvider.GetRequiredService<TService>();
    }
}
