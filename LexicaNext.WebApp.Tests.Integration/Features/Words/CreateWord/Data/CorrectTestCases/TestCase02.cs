using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.CorrectTestCases;

internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "quickly",
                WordType = "adverb",
                Translations = ["szybko", "prędko"],
                ExampleSentences = []
            }
        };
    }
}
