using LexicaNext.Core.Commands.UpdateSet;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data.IncorrectTestCases;

// Malformed UUID as setId. Expected: 400 Bad Request.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            SetId = "not-a-valid-uuid",
            RequestBody = new UpdateSetRequestPayload
            {
                WordIds = [Guid.NewGuid().ToString()]
            }
        };
    }
}
