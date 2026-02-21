using LexicaNext.Core.Commands.GenerateTranslations;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;

namespace LexicaNext.WebApp.Tests.Integration.Features.Translations.GenerateTranslations.Data;

internal class TestCaseData : ITestCaseData
{
    public GenerateTranslationsRequest? RequestBody { get; init; }

    public int TestCaseId { get; init; }

    public string UserId { get; init; } = "test-user-id";

    public BaseTestCaseData Data { get; init; } = new();
}
