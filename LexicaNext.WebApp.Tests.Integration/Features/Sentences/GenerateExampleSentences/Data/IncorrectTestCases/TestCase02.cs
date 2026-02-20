using LexicaNext.Core.Commands.GenerateExampleSentences;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sentences.GenerateExampleSentences.Data.IncorrectTestCases;

// Word exceeds 200 characters. Expected: 400 Bad Request.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new GenerateExampleSentencesRequest(new string('a', 201), "noun"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData()
            }
        };
    }
}
