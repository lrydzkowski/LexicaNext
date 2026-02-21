using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Sets.GetSet.Data.CorrectTestCases;

// Existing set with 2 words, translations, and examples. Expected: 200 OK with full details.
internal static class TestCase01
{
    private static readonly Guid SetId = Guid.NewGuid();
    private static readonly Guid WordId1 = Guid.NewGuid();
    private static readonly Guid WordId2 = Guid.NewGuid();
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");
    private static readonly Guid VerbTypeId = Guid.Parse("0196294e-9a78-74d8-8430-4ebdfd46cf68");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            SetId = SetId.ToString(),
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = WordId1, UserId = "test-user-id", Word = "apple", WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 10, 10, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = WordId2, UserId = "test-user-id", Word = "run", WordTypeId = VerbTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 11, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Translations =
                    [
                        new TranslationEntity
                        {
                            TranslationId = Guid.NewGuid(), WordId = WordId1, Translation = "jabłko", Order = 1
                        },
                        new TranslationEntity
                        {
                            TranslationId = Guid.NewGuid(), WordId = WordId2, Translation = "biegać", Order = 1
                        }
                    ],
                    ExampleSentences =
                    [
                        new ExampleSentenceEntity
                        {
                            ExampleSentenceId = Guid.NewGuid(), WordId = WordId1,
                            Sentence = "I ate an apple.", Order = 1
                        }
                    ],
                    Sets =
                    [
                        new SetEntity
                        {
                            SetId = SetId, UserId = "test-user-id", Name = "set_0001",
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    SetWords =
                    [
                        new SetWordEntity { SetId = SetId, WordId = WordId1, Order = 1 },
                        new SetWordEntity { SetId = SetId, WordId = WordId2, Order = 2 }
                    ]
                }
            }
        };
    }
}
