namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase07
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 7,
            RequestBody = new
            {
                Word = "test",
                WordType = "noun",
                Translations = new[] { "test" },
                ExampleSentences = new[] { new string('a', 501) }
            }
        };
    }
}
