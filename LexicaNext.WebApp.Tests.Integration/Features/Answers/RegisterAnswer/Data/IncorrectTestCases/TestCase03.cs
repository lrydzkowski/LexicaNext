using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// Empty expectedAnswer string. Expected: 400 Bad Request.
internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "full",
                QuestionType = "english-open",
                Question = "test",
                GivenAnswer = "test",
                ExpectedAnswer = "",
                IsCorrect = true,
                WordId = Guid.Parse("0199e86c-0002-7000-8000-000000000002")
            }
        };
    }
}
