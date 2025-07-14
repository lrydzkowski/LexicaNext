using Microsoft.Extensions.Logging;

namespace LexicaNext.WebApp.Tests.Integration.Common.Logging;

internal class TestLoggerProvider : ILoggerProvider
{
    private readonly LogMessages _logMessages;

    public TestLoggerProvider(LogMessages logMessages)
    {
        _logMessages = logMessages;
    }

    public ILogger CreateLogger(string categoryName)
    {
        return new TestLogger(_logMessages, categoryName);
    }

    public void Dispose()
    {
    }
}
