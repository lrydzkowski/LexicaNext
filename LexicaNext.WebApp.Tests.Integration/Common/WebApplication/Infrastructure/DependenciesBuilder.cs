using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using Microsoft.AspNetCore.Mvc.Testing;
using WireMock.Server;

namespace LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;

internal static class DependenciesBuilder
{
    public static WebApplicationFactory<Program> WithDependencies(
        this WebApplicationFactory<Program> webApiFactory,
        ITestCaseData testCase,
        WireMockServer? wireMockServer = null
    )
    {
        webApiFactory = webApiFactory.WithMockedUserContext(testCase.UserId);

        AiServiceTestCaseData aiService = testCase.Data.AiService;
        if (aiService.Translations is not null || aiService.Sentences is not null || aiService.ShouldThrowException)
        {
            webApiFactory = AiServiceBuilder.Configure(webApiFactory, aiService);
        }

        if (wireMockServer is not null)
        {
            EnglishDictionaryApiBuilder.Configure(wireMockServer, testCase.Data.EnglishDictionaryApi);
        }

        return webApiFactory;
    }
}
