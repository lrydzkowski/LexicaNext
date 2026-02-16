using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;

// Count = 11 (above maximum of 10). Expected: 400 Bad Request.
internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            RequestBody = new GenerateExampleSentencesRequest("bright", "noun", 11),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Sentences = [] }
            }
        };
    }
}
