using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.CorrectTestCases;

// Valid request with AI returning 3 translations. Expected: 200 OK.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new GenerateTranslationsRequest("bright", "adjective"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData
                {
                    Translations = ["jasny", "świetlany", "bystry"]
                }
            }
        };
    }
}
