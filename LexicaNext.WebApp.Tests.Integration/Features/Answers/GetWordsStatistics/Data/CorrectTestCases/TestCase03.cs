using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.GetWordsStatistics.Data.CorrectTestCases;

// User scoping — another user has answers for the same words but only the current user's stats are returned.
internal static class TestCase03
{
    private static readonly Guid NounTypeId = Guid.Parse("0196294e-9a78-73b5-947e-fb739d73808c");

    public static TestCaseData Get()
    {
        Guid myApple = Guid.Parse("0199e86c-2000-7000-8000-000000000001");
        Guid otherApple = Guid.Parse("0199e86c-2000-7000-8000-000000000002");

        return new TestCaseData
        {
            TestCaseId = 3,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = myApple,
                            UserId = "test-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
                        },
                        new WordEntity
                        {
                            WordId = otherApple,
                            UserId = "other-user-id",
                            Word = "apple",
                            WordTypeId = NounTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 1, 0, 0, 0, TimeSpan.Zero)
                        }
                    ],
                    Answers =
                    [
                        new AnswerEntity
                        {
                            AnswerId = Guid.Parse("0199e86d-2000-7000-8000-000000000001"),
                            UserId = "test-user-id",
                            ModeType = "open-questions",
                            QuestionType = "english-open",
                            Question = "apple",
                            GivenAnswer = "apple",
                            ExpectedAnswer = "apple",
                            IsCorrect = true,
                            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero),
                            WordId = myApple
                        },
                        new AnswerEntity
                        {
                            AnswerId = Guid.Parse("0199e86d-2000-7000-8000-000000000002"),
                            UserId = "other-user-id",
                            ModeType = "open-questions",
                            QuestionType = "english-open",
                            Question = "apple",
                            GivenAnswer = "apple",
                            ExpectedAnswer = "apple",
                            IsCorrect = false,
                            AnsweredAt = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero),
                            WordId = otherApple
                        }
                    ]
                }
            }
        };
    }
}
