using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;

// Empty word. Expected: 400 Bad Request.
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            RequestBody = new GenerateTranslationsRequest("", "noun"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Translations = [] }
            }
        };
    }
}
