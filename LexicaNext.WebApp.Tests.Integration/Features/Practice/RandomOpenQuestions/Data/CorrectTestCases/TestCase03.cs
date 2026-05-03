using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.RandomOpenQuestions.Data.CorrectTestCases;

// Library has 3 words, all belong to a single set. Expected: 200 OK with all 3 entries (smaller-than-20).
internal static class TestCase03
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid setId = Guid.Parse("0199e871-1000-7000-8000-000000000001");
        Guid wordA = Guid.Parse("0199e871-2000-7000-8000-000000000001");
        Guid wordB = Guid.Parse("0199e871-2000-7000-8000-000000000002");
        Guid wordC = Guid.Parse("0199e871-2000-7000-8000-000000000003");

        return new TestCaseData
        {
            TestCaseId = 3,
            ExpectedCount = 3,
            ExpectedWordIdPool = [wordA, wordB, wordC],
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        MakeWord(wordA, "apple"),
                        MakeWord(wordB, "bright"),
                        MakeWord(wordC, "carbon")
                    ],
                    Translations =
                    [
                        new TranslationEntity
                        {
                            TranslationId = Guid.Parse("0199e871-3000-7000-8000-000000000001"),
                            WordId = wordA, Translation = "jabłko", Order = 0
                        },
                        new TranslationEntity
                        {
                            TranslationId = Guid.Parse("0199e871-3000-7000-8000-000000000002"),
                            WordId = wordB, Translation = "jasny", Order = 0
                        },
                        new TranslationEntity
                        {
                            TranslationId = Guid.Parse("0199e871-3000-7000-8000-000000000003"),
                            WordId = wordC, Translation = "węgiel", Order = 0
                        }
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
                        new SetWordEntity { SetId = setId, WordId = wordA, Order = 0 },
                        new SetWordEntity { SetId = setId, WordId = wordB, Order = 1 },
                        new SetWordEntity { SetId = setId, WordId = wordC, Order = 2 }
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
