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
    public TestContextScope(
        WebApplicationFactory<Program> factory,
        LogMessages logMessages,
        WireMockServer? wireMockServer = null
    )
    {
        Factory = factory;
        LogMessages = logMessages;
        WireMockServer = wireMockServer;
        ServiceScope = Factory.Services.CreateScope();
        UserContext = new UserContextScope();
        AiService = new AiServiceContextScope();
        EnglishDictionaryApi = new EnglishDictionaryApiContextScope(WireMockServer);
        RecordingStorage = new RecordingStorageContextScope();
        Logging = new LoggingContextScope(LogMessages);
        Db = new DbContextScope(GetRequiredService<AppDbContext>());
    }

    public WebApplicationFactory<Program> Factory { get; private set; }

    public LogMessages LogMessages { get; }

    public WireMockServer? WireMockServer { get; }

    private IServiceScope ServiceScope { get; }

    public UserContextScope UserContext { get; }

    public AiServiceContextScope AiService { get; }

    public EnglishDictionaryApiContextScope EnglishDictionaryApi { get; }

    public RecordingStorageContextScope RecordingStorage { get; }

    public LoggingContextScope Logging { get; }

    public DbContextScope Db { get; }

    public ValueTask DisposeAsync()
    {
        WireMockServer?.Reset();
        Db.Dispose();
        LogMessages.Clear();
        ServiceScope.Dispose();

        return ValueTask.CompletedTask;
    }

    public async Task InitializeAsync(ITestCaseData testCaseData)
    {
        Factory = await UserContext.InitializeAsync(Factory, testCaseData);
        Factory = await AiService.InitializeAsync(Factory, testCaseData);
        Factory = await EnglishDictionaryApi.InitializeAsync(Factory, testCaseData);
        Factory = await RecordingStorage.InitializeAsync(Factory, testCaseData);
        Factory = await Logging.InitializeAsync(Factory, testCaseData);
        await Db.InitializeAsync(testCaseData);
    }

    private TService GetRequiredService<TService>() where TService : notnull
    {
        return ServiceScope.ServiceProvider.GetRequiredService<TService>();
    }
}
