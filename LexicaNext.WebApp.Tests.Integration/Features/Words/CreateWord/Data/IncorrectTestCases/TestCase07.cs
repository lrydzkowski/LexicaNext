using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

// Example sentence exceeds max length (501 chars). Expected: 400 Bad Request.
internal static class TestCase07
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 7,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "test",
                WordType = "noun",
                Translations = ["test"],
                ExampleSentences = [new string('a', 501)]
            }
        };
    }
}
