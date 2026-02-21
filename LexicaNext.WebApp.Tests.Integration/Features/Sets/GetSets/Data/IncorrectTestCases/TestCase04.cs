namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.IncorrectTestCases;

// Invalid sorting order value. Expected: 400 Bad Request.
internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            SortingOrder = "invalid"
        };
    }
}
