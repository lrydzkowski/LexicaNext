using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.GetWords.Data.CorrectTestCases;

// Pagination with page 2 and page size 2. Expected: 200 OK with second page of results.
internal static class TestCase05
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            Page = 2,
            PageSize = 2,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "a_word", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 1, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "b_word", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 2, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "c_word", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 3, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "d_word", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 4, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = Guid.NewGuid(), UserId = "test-user-id", Word = "e_word", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 5, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
