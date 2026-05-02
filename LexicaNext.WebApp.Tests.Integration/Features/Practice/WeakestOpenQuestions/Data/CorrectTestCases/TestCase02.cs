using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data.CorrectTestCases;

// Three words with distinct ratios. Expected order: high (1.00), mid (0.5), low (0.25).
// high: 0 correct, 2 incorrect → ratio 1.00
// mid:  2 correct, 2 incorrect → ratio 0.50
// low:  3 correct, 1 incorrect → ratio 0.25
internal static class TestCase02
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid highId = Guid.Parse("0199e880-1000-7000-8000-000000000001");
        Guid midId = Guid.Parse("0199e880-1000-7000-8000-000000000002");
        Guid lowId = Guid.Parse("0199e880-1000-7000-8000-000000000003");

        return new TestCaseData
        {
            TestCaseId = 2,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        MakeWord(highId, "high"),
                        MakeWord(midId, "mid"),
                        MakeWord(lowId, "low")
                    ],
                    Translations =
                    [
                        MakeTranslation("0199e880-2000-7000-8000-000000000001", highId, "wysoki"),
                        MakeTranslation("0199e880-2000-7000-8000-000000000002", midId, "średni"),
                        MakeTranslation("0199e880-2000-7000-8000-000000000003", lowId, "niski")
                    ],
                    Answers =
                    [
                        // high: 0/2
                        MakeAnswer(highId, "high", false, 1),
                        MakeAnswer(highId, "high", false, 2),
                        // mid: 2/2
                        MakeAnswer(midId, "mid", true, 3),
                        MakeAnswer(midId, "mid", true, 4),
                        MakeAnswer(midId, "mid", false, 5),
                        MakeAnswer(midId, "mid", false, 6),
                        // low: 3/1
                        MakeAnswer(lowId, "low", true, 7),
                        MakeAnswer(lowId, "low", true, 8),
                        MakeAnswer(lowId, "low", true, 9),
                        MakeAnswer(lowId, "low", false, 10)
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

    private static TranslationEntity MakeTranslation(string id, Guid wordId, string translation)
    {
        return new TranslationEntity
        {
            TranslationId = Guid.Parse(id),
            WordId = wordId,
            Translation = translation,
            Order = 0
        };
    }

    private static AnswerEntity MakeAnswer(Guid wordId, string word, bool isCorrect, int ord)
    {
        return new AnswerEntity
        {
            AnswerId = Guid.Parse($"0199e881-0000-7000-8000-{ord:D12}"),
            UserId = "test-user-id",
            ModeType = "open-questions",
            QuestionType = "english-open",
            Question = word,
            GivenAnswer = isCorrect ? word : "wrong",
            ExpectedAnswer = word,
            IsCorrect = isCorrect,
            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero).AddMinutes(ord),
            WordId = wordId
        };
    }
}
