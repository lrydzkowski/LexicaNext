using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.IncorrectTestCases;

// Question exceeds max length (501 chars). Expected: 400 Bad Request.
internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            RequestBody = new RegisterAnswerRequestPayload
            {
                Question = new string('a', 501),
                GivenAnswer = "test",
                ExpectedAnswer = "test"
            }
        };
    }
}
