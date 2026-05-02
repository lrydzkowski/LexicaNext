using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data.CorrectTestCases;

// Mixed library — 5 words; 3 belong to a set, 2 are not in any set. Expected: only the 3 in-set words.
internal static class TestCase06
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid setId = Guid.Parse("0199e874-1000-7000-8000-000000000001");
        Guid inSetA = Guid.Parse("0199e874-2000-7000-8000-000000000001");
        Guid inSetB = Guid.Parse("0199e874-2000-7000-8000-000000000002");
        Guid inSetC = Guid.Parse("0199e874-2000-7000-8000-000000000003");
        Guid orphanA = Guid.Parse("0199e874-2000-7000-8000-000000000004");
        Guid orphanB = Guid.Parse("0199e874-2000-7000-8000-000000000005");

        return new TestCaseData
        {
            TestCaseId = 6,
            ExpectedCount = 3,
            ExpectedWordIdPool = [inSetA, inSetB, inSetC],
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        MakeWord(inSetA, "alpha"),
                        MakeWord(inSetB, "bravo"),
                        MakeWord(inSetC, "charlie"),
                        MakeWord(orphanA, "delta"),
                        MakeWord(orphanB, "echo")
                    ],
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = setId, UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 0, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    SetWords =
                    [
                        new SetWordEntity { SetId = setId, WordId = inSetA, Order = 0 },
                        new SetWordEntity { SetId = setId, WordId = inSetB, Order = 1 },
                        new SetWordEntity { SetId = setId, WordId = inSetC, Order = 2 }
                    ]
                }
            }
        };
    }

    private static WordEntity MakeWord(Guid wordId, string word)
    {
        return new WordEntity
        {
            WordId = wordId,
            UserId = "test-user-id",
            Word = word,
            WordTypeId = NounTypeId,
            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
        };
    }
}
