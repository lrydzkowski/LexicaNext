using LexicaNext.Core.Commands.RegisterAnswer;

namespace LexicaNext.WebApp.Tests.Integration.Features.Answers.RegisterAnswer.Data.CorrectTestCases;

// Answer without givenAnswer (user skipped). Expected: 204 No Content.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new RegisterAnswerRequestPayload
            {
                Question = "Translate 'apple' to Polish",
                GivenAnswer = null,
                ExpectedAnswer = "jabłko"
            }
        };
    }
}
