using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data.CorrectTestCases;

// Other-mode answers are ignored — only open-questions count.
// candidate: 1 open-questions incorrect → ratio 1.00, included.
// distractor: 0 open-questions answers, but 5 spelling/full/sentences answers → excluded.
internal static class TestCase04
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid candidateId = Guid.Parse("0199e884-1000-7000-8000-000000000001");
        Guid distractorId = Guid.Parse("0199e884-1000-7000-8000-000000000002");

        return new TestCaseData
        {
            TestCaseId = 4,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        MakeWord(candidateId, "candidate"),
                        MakeWord(distractorId, "distractor")
                    ],
                    Translations =
                    [
                        MakeTranslation("0199e884-2000-7000-8000-000000000001", candidateId, "kandydat"),
                        MakeTranslation("0199e884-2000-7000-8000-000000000002", distractorId, "zakłócacz")
                    ],
                    Answers =
                    [
                        MakeAnswer(candidateId, "candidate", "open-questions", false, 1),
                        MakeAnswer(distractorId, "distractor", "spelling", false, 2),
                        MakeAnswer(distractorId, "distractor", "full", false, 3),
                        MakeAnswer(distractorId, "distractor", "sentences", false, 4),
                        MakeAnswer(distractorId, "distractor", "spelling", true, 5),
                        MakeAnswer(distractorId, "distractor", "full", true, 6)
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

    private static AnswerEntity MakeAnswer(Guid wordId, string word, string modeType, bool isCorrect, int ord)
    {
        return new AnswerEntity
        {
            AnswerId = Guid.Parse($"0199e885-0000-7000-8000-{ord:D12}"),
            UserId = "test-user-id",
            ModeType = modeType,
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
