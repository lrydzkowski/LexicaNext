using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSets.Data.CorrectTestCases;

// Default pagination. Expected: 200 OK with paginated list of 3 sets.
internal static class TestCase01
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid wordId1 = Guid.NewGuid();
        Guid wordId2 = Guid.NewGuid();
        Guid setId1 = Guid.NewGuid();
        Guid setId2 = Guid.NewGuid();
        Guid setId3 = Guid.NewGuid();

        return new TestCaseData
        {
            TestCaseId = 1,
            SortingFieldName = "createdAt",
            SortingOrder = "asc",
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = wordId1, UserId = "test-user-id", Word = "apple", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 10, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = wordId2, UserId = "test-user-id", Word = "banana", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 10, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = setId1, UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = setId2, UserId = "test-user-id", Name = "set_0002",
                            CreatedAt = new DateTimeOffset(2025, 1, 16, 10, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = setId3, UserId = "test-user-id", Name = "set_0003",
                            CreatedAt = new DateTimeOffset(2025, 1, 17, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    SetWords =
                    [
                        new SetWordEntity { SetId = setId1, WordId = wordId1, Order = 1 },
                        new SetWordEntity { SetId = setId2, WordId = wordId2, Order = 1 },
                        new SetWordEntity { SetId = setId3, WordId = wordId1, Order = 1 }
                    ]
                }
            }
        };
    }
}
