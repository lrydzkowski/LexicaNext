namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.IncorrectTestCases;

// Page size is zero. Expected: 400 Bad Request.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            PageSize = 0
        };
    }
}
