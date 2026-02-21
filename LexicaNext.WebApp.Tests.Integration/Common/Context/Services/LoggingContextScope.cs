using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Services;

internal class LoggingContextScope
{
    private readonly LogMessages _logMessage;

    public LoggingContextScope(LogMessages logMessage)
    {
        _logMessage = logMessage;
    }

    public Task<WebApplicationFactory<Program>> InitializeAsync(
        WebApplicationFactory<Program> factory,
        ITestCaseData testCase
    )
    {
        foreach ((string category, string level) in testCase.Data.Logging.LoggingCategories)
        {
            _logMessage.AllowedCategories.Add(category);

            factory = factory.WithCustomOptions(
                new Dictionary<string, string?>
                {
                    [$"Logging:LogLevel:{category}"] = level
                }
            );
        }

        return Task.FromResult(factory);
    }
}
