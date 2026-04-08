using System.Text.Json;
using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;

// Rate limit exceeded. Expected: 429 Too Many Requests.
internal static class TestCase07
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 7,
            RequestBody = new GenerateExampleSentencesRequest("bright", "adjective"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData
                {
                    Responses =
                    [
                        JsonSerializer.Serialize(
                            new List<string>
                            {
                                "The bright sun warmed the garden.",
                                "She is a bright student who learns quickly.",
                                "The room was bright and cheerful."
                            }
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
