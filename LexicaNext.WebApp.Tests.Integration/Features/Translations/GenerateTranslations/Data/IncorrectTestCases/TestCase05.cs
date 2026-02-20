using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;

// Count = 11 (above maximum of 10). Expected: 400 Bad Request.
internal static class TestCase05
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 5,
            RequestBody = new GenerateTranslationsRequest("bright", "noun", 11),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Responses = [] }
            }
        };
    }
}
