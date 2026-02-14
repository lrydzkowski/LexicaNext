using LexicaNext.Core.Commands.UpdateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord.Data.IncorrectTestCases;

internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            WordId = "not-a-guid",
            RequestBody = new UpdateWordRequestPayload
            {
                Word = "test",
                WordType = "noun",
                Translations = ["test"],
                ExampleSentences = []
            }
        };
    }
}
