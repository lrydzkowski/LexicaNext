namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.DeleteSets.Data.IncorrectTestCases;

// Empty IDs list. Expected: 204.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            Ids = []
        };
    }
}
