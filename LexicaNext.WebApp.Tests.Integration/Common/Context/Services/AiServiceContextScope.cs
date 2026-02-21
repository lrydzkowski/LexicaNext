using LexicaNext.Infrastructure.Foundry;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using LexicaNext.WebApp.Tests.Integration.Common.WebApplication;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace LexicaNext.WebApp.Tests.Integration.Common.Context.Services;

internal class AiServiceContextScope
{
    public IAzureFoundryAiClient? Mock { get; private set; }

    public Task<WebApplicationFactory<Program>> InitializeAsync(
        WebApplicationFactory<Program> factory,
        ITestCaseData testCase
    )
    {
        AiServiceTestCaseData data = testCase.Data.AiService;

        Mock = Substitute.For<IAzureFoundryAiClient>();
        if (data.ShouldThrowException)
        {
            Mock.CallAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                .ThrowsAsync(new InvalidOperationException("AI service unavailable"));
        }
        else if (data.Responses?.Count > 0)
        {
            Mock.CallAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(data.Responses[0], data.Responses.Skip(1).ToArray());
        }


        factory = factory.ReplaceService(Mock, ServiceLifetime.Scoped);

        return Task.FromResult(factory);
    }
}
