using LexicaNext.Core.Features.Words.UpdateWord;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Words.UpdateWord.Data.IncorrectTestCases;

internal static class TestCase11
{
    private static readonly Guid WordId = Guid.NewGuid();
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 13,
            WordId = WordId.ToString(),
            RequestBody = new UpdateWordRequestPayload
            {
                Word = "pear",
                WordType = "noun",
                Translations = Enumerable.Repeat("translation", 21).ToList(),
                ExampleSentences = Enumerable.Repeat("Sentence.", 21).ToList()
            },
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = WordId,
                            UserId = "test-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Translations =
                    [
                        new TranslationEntity
                        {
                            TranslationId = Guid.NewGuid(),
                            Translation = "jabłko",
                            Order = 0,
                            WordId = WordId
                        }
                    ],
                    ExampleSentences =
                    [
                        new ExampleSentenceEntity
                        {
                            ExampleSentenceId = Guid.NewGuid(),
                            Sentence = "I ate an apple.",
                            Order = 0,
                            WordId = WordId
                        }
                    ]
                }
            }
        };
    }
}
