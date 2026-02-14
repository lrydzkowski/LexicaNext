namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.IncorrectTestCases;

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
