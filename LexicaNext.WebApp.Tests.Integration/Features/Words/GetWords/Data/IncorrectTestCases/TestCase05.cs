namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.IncorrectTestCases;

// Invalid timezone ID. Expected: 400 Bad Request.
internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            TimeZoneId = "Invalid/Timezone"
        };
    }
}
