namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.IncorrectTestCases;

// Invalid IANA timezone ID. Expected: 400 Bad Request.
internal static class TestCase08
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 8,
            TimeZoneId = "Invalid/Timezone"
        };
    }
}
