using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;

// AI service failure (throws exception). Expected: 500 Internal Server Error.
internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            RequestBody = new GenerateExampleSentencesRequest("bright", "adjective", 3),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData
                {
                    ShouldThrowException = true
                }
            }
        };
    }
}
