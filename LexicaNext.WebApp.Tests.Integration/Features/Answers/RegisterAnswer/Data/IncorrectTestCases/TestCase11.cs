using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// Empty questionType string. Expected: 400 Bad Request.
internal static class TestCase11
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 11,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                QuestionType = "",
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "test",
                IsCorrect = true,
                WordId = Guid.Parse("0199e86c-0002-7000-8000-000000000002")
            }
        };
    }
}
