using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;

// Invalid word type. Expected: 400 Bad Request.
internal static class TestCase03
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 3,
            RequestBody = new GenerateTranslationsRequest("bright", "invalid"),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Translations = [] }
            }
        };
    }
}
