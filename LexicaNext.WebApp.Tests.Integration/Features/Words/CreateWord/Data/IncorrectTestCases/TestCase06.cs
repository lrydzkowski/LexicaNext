namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.IncorrectTestCases;

internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            RequestBody = new
            {
                Word = "test",
                WordType = "noun",
                Translations = new[] { new string('a', 201) },
                ExampleSentences = Array.Empty<string>()
            }
        };
    }
}
