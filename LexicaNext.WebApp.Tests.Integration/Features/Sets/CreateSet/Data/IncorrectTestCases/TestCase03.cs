using LexicaNext.Core.Commands.CreateSet;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data.IncorrectTestCases;

// Non-existent word ID. Expected: 400 Bad Request.
internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new CreateSetRequestPayload
            {
                WordIds = [Guid.NewGuid().ToString()]
            }
        };
    }
}
