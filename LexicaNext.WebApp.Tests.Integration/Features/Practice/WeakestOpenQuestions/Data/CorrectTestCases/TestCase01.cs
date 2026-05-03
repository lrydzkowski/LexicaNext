namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data.CorrectTestCases;

// Empty answer history. Expected: 200 OK with empty entries.
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
