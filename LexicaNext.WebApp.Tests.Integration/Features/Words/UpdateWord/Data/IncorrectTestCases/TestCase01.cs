using LexicaNext.Core.Commands.UpdateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord.Data.IncorrectTestCases;

internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            WordId = Guid.NewGuid().ToString(),
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
