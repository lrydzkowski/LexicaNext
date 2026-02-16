using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;

// Invalid word type. Expected: 400 Bad Request.
internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new GenerateExampleSentencesRequest("bright", "invalid", 3),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Sentences = [] }
            }
        };
    }
}
