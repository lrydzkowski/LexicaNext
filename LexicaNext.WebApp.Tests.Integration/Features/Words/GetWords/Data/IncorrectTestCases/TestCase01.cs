namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.IncorrectTestCases;

// Page number is zero. Expected: 400 Bad Request.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            Page = 0
        };
    }
}
