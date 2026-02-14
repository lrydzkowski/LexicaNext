namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new
            {
                Word = new string('a', 201),
                WordType = "noun",
                Translations = new[] { "test" },
                ExampleSentences = Array.Empty<string>()
            }
        };
    }
}
