using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.UpdateSet.Data.IncorrectTestCases;

// Null payload. Expected: 400 Bad Request.
internal static class TestCase03
{
    private static readonly Guid SetId = Guid.NewGuid();

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            SetId = SetId.ToString(),
            RequestBody = null,
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
