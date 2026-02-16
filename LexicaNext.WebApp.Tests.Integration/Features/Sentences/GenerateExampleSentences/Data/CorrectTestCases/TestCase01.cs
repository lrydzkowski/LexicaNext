using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.CorrectTestCases;

// Valid request with AI returning 3 sentences. Expected: 200 OK.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new GenerateExampleSentencesRequest("bright", "adjective"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData
                {
                    Sentences =
                    [
                        "The bright sun warmed the garden.",
                        "She is a bright student who learns quickly.",
                        "The room was bright and cheerful."
                    ]
                }
            }
        };
    }
}
