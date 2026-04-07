using System.Text.Json;
using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;

// Rate limit exceeded. Expected: 429 Too Many Requests.
internal static class TestCase07
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 7,
            RequestBody = new GenerateTranslationsRequest("bright", "adjective"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData
                {
                    Responses =
                    [
                        JsonSerializer.Serialize(
                            new List<string> { "jasny", "świetlany", "bystry" }
                        )
                    ]
                },
                RateLimiting = new RateLimitingTestCaseData
                {
                    PermitLimit = 1,
                    WindowTime = "00:01:00",
                    NumberOfPreRequests = 1
                }
            }
        };
    }
}
