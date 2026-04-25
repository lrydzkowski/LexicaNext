using LexicaNext.Core.Commands.RegisterAnswer;
using LexicaNext.Infrastructure.Db.Common.Entities;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.CorrectTestCases;

// Full answer with question, givenAnswer, and expectedAnswer. Expected: 204 No Content.
internal static class TestCase01
{
    private static readonly Guid AdjectiveTypeId = Guid.Parse("0196294e-9a78-7573-9db1-47b3d0ee9eae");

    public static TestCaseData Get()
    {
        Guid wordId = Guid.Parse("0199e86c-0001-7000-8000-000000000001");

        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                QuestionType = "english-open",
                Question = "bright",
                GivenAnswer = "jasny",
                ExpectedAnswer = "jasny, świetlany",
                IsCorrect = true,
                WordId = wordId
            },
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words =
                    [
                        new WordEntity
                        {
                            WordId = wordId,
                            UserId = "test-user-id",
                            Word = "bright",
                            WordTypeId = AdjectiveTypeId,
                            CreatedAt = new DateTimeOffset(2025, 1, 15, 10, 0, 0, TimeSpan.Zero)
                        }
                    ]
                }
            }
        };
    }
}
