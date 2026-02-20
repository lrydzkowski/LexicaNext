using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.CorrectTestCases;

// Full answer with question, givenAnswer, and expectedAnswer. Expected: 204 No Content.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new RegisterAnswerRequestPayload
            {
                Question = "What is the meaning of 'bright'?",
                GivenAnswer = "jasny",
                ExpectedAnswer = "jasny, świetlany"
            }
        };
    }
}
