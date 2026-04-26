namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.CorrectTestCases;

// Empty state — user has no answers. Expected: 200 OK with count=0 and empty data.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1
        };
    }
}
