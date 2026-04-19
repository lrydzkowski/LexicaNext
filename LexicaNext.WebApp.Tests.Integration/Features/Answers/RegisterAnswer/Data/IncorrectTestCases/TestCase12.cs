using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// QuestionType exceeds max length (51 chars). Expected: 400 Bad Request.
internal static class TestCase12
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 12,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                QuestionType = new string('a', 51),
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = true
            }
        };
    }
}
