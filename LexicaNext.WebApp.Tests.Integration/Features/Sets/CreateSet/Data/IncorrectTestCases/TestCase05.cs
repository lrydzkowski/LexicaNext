using LexicaNext.Core.Commands.CreateSet;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.CreateSet.Data.IncorrectTestCases;

// Malformed UUID in word IDs. Expected: 400 Bad Request.
internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            RequestBody = new CreateSetRequestPayload
            {
                WordIds = ["not-a-valid-uuid"]
            }
        };
    }
}
