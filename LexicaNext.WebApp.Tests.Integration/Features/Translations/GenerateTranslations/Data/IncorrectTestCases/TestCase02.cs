using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data.IncorrectTestCases;

// Word exceeds 200 characters. Expected: 400 Bad Request.
internal static class TestCase02
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 2,
            RequestBody = new GenerateTranslationsRequest(new string('a', 201), "noun", 3),
            Data = new BaseTestCaseData
            {
                AiService = new AiServiceTestCaseData { Translations = [] }
            }
        };
    }
}
