using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet.Data.IncorrectTestCases;

// GUID of set created by another user. Expected: 404 Not Found.
internal static class TestCase03
{
    private static readonly Guid SetId = Guid.NewGuid();
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            SetId = SetId.ToString(),
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = SetId, UserId = "other-user-id", Name = "other_set",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
