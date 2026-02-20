using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

// Filter by createdAt with Europe/Warsaw timezone (CET = UTC+1 in January).
// searchQuery "2025-01-15" should match bravo and charlie after timezone conversion.
internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            SearchQuery = "2025-01-15",
            TimeZoneId = "Europe/Warsaw",
            SortingFieldName = "createdAt",
            SortingOrder = "asc",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_alpha",
                            CreatedAt = new DateTimeOffset(2025, 1, 14, 22, 30, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_bravo",
                            CreatedAt = new DateTimeOffset(2025, 1, 14, 23, 30, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_charlie",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = Guid.NewGuid(), UserId = "test-user-id", Name = "set_delta",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 5, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
