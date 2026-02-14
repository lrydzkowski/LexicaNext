namespace LexicaNext.WebApp.Tests.Integration.Features.Words.CreateWord.Data.CorrectTestCases;

internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new
            {
                Word = "bright",
                WordType = "adjective",
                Translations = new[] { "jasny", "świetlany" },
                ExampleSentences = new[] { "The bright sun warmed the garden." }
            }
        };
    }
}
