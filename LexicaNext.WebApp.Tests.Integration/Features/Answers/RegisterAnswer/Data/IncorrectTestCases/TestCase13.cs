using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// QuestionType is not one of the allowed values. Expected: 400 Bad Request.
internal static class TestCase13
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 13,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                QuestionType = "invalid-question-type",
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = true,
                WordId = Guid.Parse("0199e86c-0002-7000-8000-000000000002")
            }
        };
    }
}
