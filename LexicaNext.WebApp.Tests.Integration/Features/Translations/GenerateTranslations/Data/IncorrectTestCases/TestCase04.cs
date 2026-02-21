using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;

// Count = 0 (below minimum of 1). Expected: 400 Bad Request.
internal static class TestCase04
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 4,
            RequestBody = new GenerateTranslationsRequest("bright", "noun", 0),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Responses = [] }
            }
        };
    }
}
