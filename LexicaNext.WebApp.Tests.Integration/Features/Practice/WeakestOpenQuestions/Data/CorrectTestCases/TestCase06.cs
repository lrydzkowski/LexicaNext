using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Practice.WeakestOpenQuestions.Data.CorrectTestCases;

// 22 words with open-questions history; ratios fall from 1.00 down to 0.00. Expected: top 20 returned (worst-first).
internal static class TestCase06
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        List<WordEntity> words = [];
        List<TranslationEntity> translations = [];
        List<AnswerEntity> answers = [];

        // For i = 0..21: word i has (i correct answers) and (22 - i incorrect answers).
        // i=0  → 0/22 → ratio 1.00 (highest priority)
        // i=21 → 21/1 → ratio 0.045 (lowest)
        // Top 20 weakest = i = 0..19.
        for (int i = 0; i < 22; i++)
        {
            Guid wordId = Guid.Parse($"0199e888-1000-7000-8000-{i + 1:D12}");
            string word = $"word{i:D2}";

            words.Add(
                new WordEntity
                {
                    WordId = wordId,
                    UserId = "test-user-id",
                    Word = word,
                    WordTypeId = NounTypeId,
                    CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero).AddMinutes(i)
                }
            );
            translations.Add(
                new TranslationEntity
                {
                    TranslationId = Guid.Parse($"0199e888-2000-7000-8000-{i + 1:D12}"),
                    WordId = wordId,
                    Translation = $"tłumaczenie{i:D2}",
                    Order = 0
                }
            );

            int incorrect = 22 - i;
            int correct = i;
            int answerCounter = 0;
            for (int j = 0; j < incorrect; j++)
            {
                answers.Add(MakeAnswer(wordId, word, false, i * 100 + answerCounter++));
            }

            for (int j = 0; j < correct; j++)
            {
                answers.Add(MakeAnswer(wordId, word, true, i * 100 + answerCounter++));
            }
        }

        return new TestCaseData
        {
            TestCaseId = 6,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words = words,
                    Translations = translations,
                    Answers = answers
                }
            }
        };
    }

    private static AnswerEntity MakeAnswer(Guid wordId, string word, bool isCorrect, int ord)
    {
        return new AnswerEntity
        {
            AnswerId = Guid.Parse($"0199e889-0000-7000-8000-{ord:D12}"),
            UserId = "test-user-id",
            ModeType = "open-questions",
            QuestionType = "english-open",
            Question = word,
            GivenAnswer = isCorrect ? word : "wrong",
            ExpectedAnswer = word,
            IsCorrect = isCorrect,
            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero).AddSeconds(ord),
            WordId = wordId
        };
    }
}
