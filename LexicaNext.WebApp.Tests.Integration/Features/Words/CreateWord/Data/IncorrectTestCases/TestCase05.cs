namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            RequestBody = new
            {
                Word = "test",
                WordType = "noun",
                Translations = Array.Empty<string>(),
                ExampleSentences = Array.Empty<string>()
            }
        };
    }
}
