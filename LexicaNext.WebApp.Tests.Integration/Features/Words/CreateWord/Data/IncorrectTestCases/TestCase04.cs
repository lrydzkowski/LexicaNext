using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "test",
                WordType = "invalid-type",
                Translations = ["test"],
                ExampleSentences = []
            }
        };
    }
}
