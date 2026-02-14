using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;

// Search by query "apple" matches "apple" and "pineapple". Expected: 200 OK with filtered results.
internal static class TestCase02
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");
    private static readonly Guid VerbTypeId = Guid.Parse("0196294e-9a78-74d8-8430-4ebdfd46cf68");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            SearchQuery = "apple",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(),
                            UserId = "test-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(),
                            UserId = "test-user-id",
                            Word = "run",
                            WordTypeId = VerbTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(),
                            UserId = "test-user-id",
                            Word = "pineapple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 17, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
