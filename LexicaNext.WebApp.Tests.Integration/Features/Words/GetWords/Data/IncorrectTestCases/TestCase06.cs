namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.IncorrectTestCases;

// SearchQuery too long (501 characters). Expected: 400 Bad Request.
internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            SearchQuery = new string('a', 501)
        };
    }
}
