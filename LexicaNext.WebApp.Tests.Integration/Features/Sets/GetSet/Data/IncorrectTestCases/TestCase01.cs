namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet.Data.IncorrectTestCases;

// Non-existent GUID. Expected: 404 Not Found.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            SetId = Guid.NewGuid().ToString()
        };
    }
}
