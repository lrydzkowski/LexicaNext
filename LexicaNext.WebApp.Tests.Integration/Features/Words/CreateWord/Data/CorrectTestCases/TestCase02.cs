namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.CorrectTestCases;

internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new
            {
                Word = "quickly",
                WordType = "adverb",
                Translations = new[] { "szybko", "prędko" },
                ExampleSentences = Array.Empty<string>()
            }
        };
    }
}
