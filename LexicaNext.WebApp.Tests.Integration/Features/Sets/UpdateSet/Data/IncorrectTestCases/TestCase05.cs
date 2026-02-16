using LexicaNext.Core.Commands.UpdateSet;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data.IncorrectTestCases;

// Non-existent word ID. Expected: 400 Bad Request.
internal static class TestCase05
{
    private static readonly Guid SetId = Guid.NewGuid();

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            SetId = SetId.ToString(),
            RequestBody = new UpdateSetRequestPayload
            {
                WordIds = [Guid.NewGuid().ToString()]
            },
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = SetId, UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
