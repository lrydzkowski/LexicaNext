using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// WordId does not reference an existing word owned by the user. Expected: 400 Bad Request.
internal static class TestCase15
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 15,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                QuestionType = "english-open",
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = true,
                WordId = Guid.Parse("0199e86c-dead-7000-8000-000000000000")
            }
        };
    }
}
