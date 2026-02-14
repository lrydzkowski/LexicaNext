using System.Text.Json;
using LexicaNext.Infrastructure.Foundry;
using LexicaNext.WebApp.Tests.Integration.Common.TestCases;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute;
using NSubstitute.ExceptionExtensions;

namespace LexicaNext.WebApp.Tests.Integration.Common.WebApplication.Infrastructure;

internal static class AiServiceBuilder
{
    public static WebApplicationFactory<Program> Configure(
        WebApplicationFactory<Program> webApiFactory,
        AiServiceTestCaseData data
    )
    {
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

        return webApiFactory.ReplaceService(mock, ServiceLifetime.Scoped);
    }
}
