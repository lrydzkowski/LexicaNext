namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.IncorrectTestCases;

// Page size exceeds maximum (201). Expected: 400 Bad Request.
internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            PageSize = 201
        };
    }
}
