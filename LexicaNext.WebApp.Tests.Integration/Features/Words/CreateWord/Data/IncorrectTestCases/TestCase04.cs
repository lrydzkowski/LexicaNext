namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            RequestBody = new
            {
                Word = "test",
                WordType = "invalid-type",
                Translations = new[] { "test" },
                ExampleSentences = Array.Empty<string>()
            }
        };
    }
}
