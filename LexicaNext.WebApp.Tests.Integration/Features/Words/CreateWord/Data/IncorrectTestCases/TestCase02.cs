namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new
            {
                Word = "",
                WordType = "noun",
                Translations = new[] { "test" },
                ExampleSentences = Array.Empty<string>()
            }
        };
    }
}
