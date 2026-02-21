using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;

// AI service failure (throws exception). Expected: 500 Internal Server Error.
internal static class TestCase06
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 6,
            RequestBody = new GenerateTranslationsRequest("bright", "adjective"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData
                {
                    ShouldThrowException = true
                }
            }
        };
    }
}
