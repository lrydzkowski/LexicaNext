using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;

// Empty word. Expected: 400 Bad Request.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new GenerateExampleSentencesRequest("", "noun", 3),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Sentences = [] }
            }
        };
    }
}
