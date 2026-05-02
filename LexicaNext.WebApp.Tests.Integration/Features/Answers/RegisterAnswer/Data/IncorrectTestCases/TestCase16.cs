using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// Sentences mode with a question type that is NOT in the expanded allow-list.
// Pins the boundary against future allow-list drift. Expected: 400 Bad Request.
internal static class TestCase16
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 16,
            RequestBody = new RegisterAnswerRequestPayload
            {
                ModeType = "sentences",
                QuestionType = "sentence-multiple-choice",
                Question = "The cat sat on the _____.",
                GivenAnswer = "mat",
                ExpectedAnswer = "mat",
                IsCorrect = true,
                WordId = Guid.Parse("0199e86c-0002-7000-8000-000000000002")
            }
        };
    }
}
