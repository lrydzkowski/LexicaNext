using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;

internal static class TestCase11
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 11,
            SortingFieldName = "updatedAt",
            SortingOrder = "asc",
            TimeZoneId = "Pacific Standard Time",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "first", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 1, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 3, 10, 6, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "second", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 2, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 3, 11, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "third", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 3, 10, 0, 0, TimeSpan.Zero),
                            UpdatedAt = new DateTimeOffset(2025, 3, 12, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
