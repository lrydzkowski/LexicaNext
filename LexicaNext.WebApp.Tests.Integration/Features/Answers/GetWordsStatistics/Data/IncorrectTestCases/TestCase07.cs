namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.IncorrectTestCases;

// TimeZoneId too long (101 characters); cascade stops before IANA check. Expected: 400 Bad Request.
internal static class TestCase07
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 7,
            TimeZoneId = new string('a', 101)
        };
    }
}
