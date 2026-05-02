using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data.CorrectTestCases;

// Cross-user isolation — current user has 2 in-set words, other user has 4 in-set words. Expected: only the 2 current-user words.
internal static class TestCase05
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid mySetId = Guid.Parse("0199e873-1000-7000-8000-000000000001");
        Guid otherSetId = Guid.Parse("0199e873-1000-7000-8000-000000000002");
        Guid myWordA = Guid.Parse("0199e873-2000-7000-8000-000000000001");
        Guid myWordB = Guid.Parse("0199e873-2000-7000-8000-000000000002");
        Guid otherWordA = Guid.Parse("0199e873-2000-7000-8000-000000000003");
        Guid otherWordB = Guid.Parse("0199e873-2000-7000-8000-000000000004");
        Guid otherWordC = Guid.Parse("0199e873-2000-7000-8000-000000000005");
        Guid otherWordD = Guid.Parse("0199e873-2000-7000-8000-000000000006");

        return new TestCaseData
        {
            TestCaseId = 5,
            ExpectedCount = 2,
            ExpectedWordIdPool = [myWordA, myWordB],
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        MakeWord(myWordA, "test-user-id", "alpha"),
                        MakeWord(myWordB, "test-user-id", "bravo"),
                        MakeWord(otherWordA, "other-user-id", "charlie"),
                        MakeWord(otherWordB, "other-user-id", "delta"),
                        MakeWord(otherWordC, "other-user-id", "echo"),
                        MakeWord(otherWordD, "other-user-id", "foxtrot")
                    ],
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = mySetId, UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 0, 0, 0, TimeSpan.Zero)
                        },
                        new SetEntity
                        {
                            SetId = otherSetId, UserId = "other-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 0, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    SetWords =
                    [
                        new SetWordEntity { SetId = mySetId, WordId = myWordA, Order = 0 },
                        new SetWordEntity { SetId = mySetId, WordId = myWordB, Order = 1 },
                        new SetWordEntity { SetId = otherSetId, WordId = otherWordA, Order = 0 },
                        new SetWordEntity { SetId = otherSetId, WordId = otherWordB, Order = 1 },
                        new SetWordEntity { SetId = otherSetId, WordId = otherWordC, Order = 2 },
                        new SetWordEntity { SetId = otherSetId, WordId = otherWordD, Order = 3 }
                    ]
                }
            }
        };
    }

    private static WordEntity MakeWord(Guid wordId, string userId, string word)
    {
        return new WordEntity
        {
            WordId = wordId,
            UserId = userId,
            Word = word,
            WordTypeId = NounTypeId,
            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
        };
    }
}
