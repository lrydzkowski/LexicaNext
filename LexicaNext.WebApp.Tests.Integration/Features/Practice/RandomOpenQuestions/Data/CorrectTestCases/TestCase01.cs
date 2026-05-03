namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data.CorrectTestCases;

// Empty library — user has no words. Expected: 200 OK with empty entries.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            ExpectedCount = 0
        };
    }
}
