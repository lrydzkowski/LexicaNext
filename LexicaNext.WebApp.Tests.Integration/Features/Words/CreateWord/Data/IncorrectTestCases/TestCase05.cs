using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

// Empty translations list. Expected: 400 Bad Request.
internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "test",
                WordType = "noun",
                Translations = [],
                ExampleSentences = []
            }
        };
    }
}
