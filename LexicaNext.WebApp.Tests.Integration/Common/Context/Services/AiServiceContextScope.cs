using System.Text.Json;
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
    public AiServiceContextScope(WebApplicationFactory<Program> factory)
    {
        Factory = factory;
    }

    public WebApplicationFactory<Program> Factory { get; private set; }

    public Task InitializeAsync(ITestCaseData testCase)
    {
        AiServiceTestCaseData data = testCase.Data.AiService;

        if (data.Translations is null && data.Sentences is null && !data.ShouldThrowException)
        {
            return Task.CompletedTask;
        }

        IAzureFoundryAiClient mock = Substitute.For<IAzureFoundryAiClient>();

        if (data.ShouldThrowException)
        {
            mock.CallAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                .ThrowsAsync(new InvalidOperationException("AI service unavailable"));
        }
        else
        {
            List<string> responses = [];

            if (data.Translations is not null)
            {
                responses.Add(JsonSerializer.Serialize(data.Translations));
            }

            if (data.Sentences is not null)
            {
                responses.Add(JsonSerializer.Serialize(data.Sentences));
            }

            if (responses.Count > 0)
            {
                mock.CallAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                    .Returns(responses[0], responses.Skip(1).ToArray());
            }
        }

        Factory = Factory.ReplaceService(mock, ServiceLifetime.Scoped);

        return Task.CompletedTask;
    }
}
