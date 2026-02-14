namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;

// No words in DB. Expected: 200 OK with empty results.
internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6
        };
    }
}
