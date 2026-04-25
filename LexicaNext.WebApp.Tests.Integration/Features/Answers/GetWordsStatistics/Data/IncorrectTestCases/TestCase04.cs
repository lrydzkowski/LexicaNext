namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.IncorrectTestCases;

// Invalid sortingOrder value. Expected: 400 Bad Request.
internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            SortingOrder = "sideways"
        };
    }
}
