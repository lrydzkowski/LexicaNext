using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new CreateWordRequestPayload
            {
                Word = new string('a', 201),
                WordType = "noun",
                Translations = ["test"],
                ExampleSentences = []
            }
        };
    }
}
