using LexicaNext.WebApp.Tests.Integration.Common.Logging;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;

namespace LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;

internal static class LoggingBuilder
{
    public static WebApplicationFactory<Program> WithLogging(
        this WebApplicationFactory<Program> webApplicationFactory,
        LogMessages logMessage,
        string category,
        LogLevel level = LogLevel.Debug
    )
    {
        logMessage.AllowedCategories.Add(category);

        return webApplicationFactory.WithCustomOptions(
            new Dictionary<string, string?>
            {
                [$"Logging:LogLevel:{category}"] = level.ToString()
            }
        );
    }
}
