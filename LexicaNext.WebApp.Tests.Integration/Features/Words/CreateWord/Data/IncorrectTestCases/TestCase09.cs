using LexicaNext.Core.Commands.CreateWord;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase09
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 11,
            RequestBody = new CreateWordRequestPayload
            {
                Word = "pear",
                WordType = "noun",
                Translations = Enumerable.Repeat("translation", 21).ToList(),
                ExampleSentences = Enumerable.Repeat("Sentence.", 21).ToList()
            }
        };
    }
}
