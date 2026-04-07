using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Services;

internal class RateLimitingContextScope
{
    public Task<WebApplicationFactory<Program>> InitializeAsync(
        WebApplicationFactory<Program> factory,
        ITestCaseData testCase
    )
    {
        RateLimitingTestCaseData? data = testCase.Data.RateLimiting;
        if (data is null)
        {
            return Task.FromResult(factory);
        }

        factory = factory.WithCustomOptions(
            new Dictionary<string, string?>
            {
                ["RateLimiting:PermitLimit"] = data.PermitLimit.ToString(),
                ["RateLimiting:WindowTime"] = data.WindowTime
            }
        );

        return Task.FromResult(factory);
    }
}
