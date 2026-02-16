namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet.Data.IncorrectTestCases;

// Malformed UUID. Expected: 404 Not Found.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            SetId = "not-a-valid-uuid"
        };
    }
}
