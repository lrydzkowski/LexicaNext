using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace LexicaNext.WebApp.Tests.Integration.Common.Logging;

internal class TestLogger : ILogger
{
    private readonly string _categoryName;
    private readonly LogMessages _logMessages;

    public TestLogger(LogMessages logMessages, string categoryName)
    {
        _logMessages = logMessages;
        _categoryName = categoryName;
    }

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull
    {
        return null;
    }

    public bool IsEnabled(LogLevel logLevel)
    {
        return _logMessages.IsCategoryAllowed(_categoryName);
    }

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter
    )
    {
        if (!IsEnabled(logLevel))
        {
            return;
        }

        var logEntry = new
        {
            LogLevel = logLevel.ToString(),
            Category = _categoryName,
            Message = formatter(state, exception)
        };

        string logDetails = JsonSerializer.Serialize(
            logEntry,
            new JsonSerializerOptions
            {
                WriteIndented = true
            }
        );
        _logMessages.Messages.Enqueue(logDetails);
    }
}
