using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;

// Count = 0 (below minimum of 1). Expected: 400 Bad Request.
internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            RequestBody = new GenerateExampleSentencesRequest("bright", "noun", 0),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Sentences = [] }
            }
        };
    }
}
